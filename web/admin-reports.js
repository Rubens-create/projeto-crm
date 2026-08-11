const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

const toast = document.querySelector('#toast');
const reportsBody = document.querySelector('#reportsBody');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function setReportStat(index, label, value, trend) {
  const valueIds = ['repTotalServices', 'repTotalHours', 'repTotalRevenue', 'repTotalPayouts'];
  const labelEl = document.querySelector(`#repStatLabel${index}`);
  const valueEl = document.querySelector(`#${valueIds[index - 1]}`);
  const trendEl = document.querySelector(`#repStatTrend${index}`);
  if (labelEl) labelEl.textContent = label;
  if (valueEl) valueEl.textContent = value;
  if (trendEl) trendEl.textContent = trend;
}

function resetReportStats() {
  ['repTotalServices', 'repTotalHours', 'repTotalRevenue', 'repTotalPayouts'].forEach(id => {
    const valueEl = document.querySelector(`#${id}`);
    if (valueEl) valueEl.textContent = '-';
  });
}

function updateReportStats(type, data) {
  const rows = data.rows || [];
  const stats = data.stats || {};

  if (type === 'prestador') {
    const active = rows.filter(row => row[5] === 'Ativo').length;
    const hours = rows.reduce((total, row) => total + (Number(row[3]) || 0), 0);
    const earned = rows.reduce((total, row) => total + (Number(row[4]) || 0), 0);
    setReportStat(1, 'Total de prestadores', rows.length, 'Cadastros encontrados');
    setReportStat(2, 'Prestadores ativos', active, 'Disponíveis no aplicativo');
    setReportStat(3, 'Horas trabalhadas', `${hours.toFixed(1).replace('.', ',')}h`, 'Horas registradas');
    setReportStat(4, 'Total ganho', money(earned), 'Ganhos acumulados');
    return;
  }

  if (type === 'cliente') {
    const active = rows.filter(row => row[6] === 'Ativo').length;
    const properties = rows.reduce((total, row) => total + (Number(row[4]) || 0), 0);
    const spending = rows.reduce((total, row) => total + (Number(row[5]) || 0), 0);
    setReportStat(1, 'Total de clientes', rows.length, 'Proprietários cadastrados');
    setReportStat(2, 'Imóveis cadastrados', properties, 'Imóveis sob gestão');
    setReportStat(3, 'Gasto mensal', money(spending), 'Soma dos clientes');
    setReportStat(4, 'Clientes ativos', active, 'Cadastros em operação');
    return;
  }

  if (type === 'financeiro') {
    const pending = rows.filter(row => row[5] !== 'Pago').reduce((total, row) => total + (Number(row[4]) || 0), 0);
    const hours = rows.reduce((total, row) => total + (Number(row[3]) || 0), 0);
    const paid = rows.reduce((total, row) => total + (Number(row[4]) || 0), 0);
    setReportStat(1, 'Total de pagamentos', rows.length, 'Lançamentos financeiros');
    setReportStat(2, 'Horas pagas', `${hours.toFixed(1).replace('.', ',')}h`, 'Horas incluídas nos pagamentos');
    setReportStat(3, 'Total pago', money(paid), 'Repasses registrados');
    setReportStat(4, 'Pendências', money(pending), 'Valores ainda não pagos');
    return;
  }

  if (type === 'servico') {
    const active = rows.filter(row => row[5] === 'Ativo').length;
    const rates = rows.map(row => Number(row[2]) || 0).filter(rate => rate > 0);
    const averageRate = rates.length ? rates.reduce((total, rate) => total + rate, 0) / rates.length : 0;
    const times = rows.map(row => parseFloat(String(row[4]).replace(',', '.')) || 0).filter(time => time > 0);
    const averageTime = times.length ? times.reduce((total, time) => total + time, 0) / times.length : 0;
    setReportStat(1, 'Total de serviços', rows.length, 'Imóveis e serviços cadastrados');
    setReportStat(2, 'Serviços ativos', active, 'Disponíveis no aplicativo');
    setReportStat(3, 'Tarifa média', money(averageRate), 'Média dos valores por hora');
    setReportStat(4, 'Tempo médio', `${averageTime.toFixed(1).replace('.', ',')}h`, 'Estimativa dos serviços');
    return;
  }

  setReportStat(1, 'Total de limpezas', stats.totalServices || 0, 'Concluídos no período');
  setReportStat(2, 'Horas gravadas', `${(stats.totalHours || 0).toFixed(1).replace('.', ',')}h`, 'Tempo em operação');
  setReportStat(3, 'Faturamento bruto', money(stats.totalRevenue || 0), 'Receita de proprietários');
  setReportStat(4, 'Repasses liquidados', money(stats.totalPayouts || 0), 'Pago à equipe');
}

async function updateReportView(type) {
  const titles = {
    geral: { main: 'Relatório Geral Consolidado', sub: 'Visão completa da operação, atendimentos e repasses.', section: 'Atendimentos por Categoria' },
    prestador: { main: 'Relatório por Prestador', sub: 'Desempenho e produtividade individual de cada prestador.', section: 'Produção da Equipe de Limpeza' },
    cliente: { main: 'Relatório por Cliente & Imóvel', sub: 'Faturamento acumulado por proprietário e imóveis parceiros.', section: 'Faturamento por Cliente' },
    financeiro: { main: 'Relatório Financeiro & Margens', sub: 'Demonstrativo semanal de receita, repasses e margem líquida.', section: 'Extrato Financeiro Semanal' },
    servico: { main: 'Relatório por Tipo de Serviço', sub: 'Análise por imóvel cadastrado e tipo de higienização.', section: 'Rentabilidade por Imóvel' }
  };

  const currentInfo = titles[type] || titles.geral;

  const mainTitleEl = document.querySelector('#reportMainTitle');
  if (mainTitleEl) mainTitleEl.textContent = currentInfo.main;

  const subEl = document.querySelector('#reportSubtitle');
  if (subEl) subEl.textContent = currentInfo.sub;

  const sectionTitleEl = document.querySelector('#reportSectionTitle');
  if (sectionTitleEl) sectionTitleEl.textContent = currentInfo.section;

  // Atualizar abas superiores
  document.querySelectorAll('.filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // Atualizar links do submenu
  document.querySelectorAll('.nav-sub-item').forEach(link => {
    link.classList.toggle('active', link.dataset.type === type);
  });

  if (reportsBody) {
    reportsBody.innerHTML = '<tr><td colspan="100%" style="text-align: center; padding: 20px;">Carregando...</td></tr>';
  }
  resetReportStats();

  try {
    const res = await fetch(`/api/admin/reports?tipo=${type}`);
    if (!res.ok) throw new Error('Erro na resposta');
    const data = await res.json();

    updateReportStats(type, data);

    const theadTr = document.querySelector('thead tr');
    if (theadTr && data.headers) {
      theadTr.innerHTML = data.headers.map(h => `<th>${h}</th>`).join('');
    }

    if (reportsBody) {
      reportsBody.innerHTML = (data.rows || []).map(row => `
        <tr>
          ${row.map(cell => `<td>${cell}</td>`).join('')}
        </tr>
      `).join('') || '<tr><td colspan="100%" class="empty-row" style="text-align:center;">Nenhum dado encontrado.</td></tr>';
    }

    if (window.lucide) lucide.createIcons();

    window.currentReportData = data;
  } catch (err) {
    if (reportsBody) reportsBody.innerHTML = '<tr><td colspan="100%" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>';
    showToast('Erro ao carregar relatório');
    console.error(err);
  }
}

// Toggle do Menu Colapsável de Relatórios
const reportsMenuBtn = document.querySelector('#reportsMenuBtn');
const reportsNavGroup = document.querySelector('#reportsNavGroup');

if (reportsMenuBtn && reportsNavGroup) {
  reportsMenuBtn.onclick = (e) => {
    e.preventDefault();
    reportsNavGroup.classList.toggle('open');
  };
}

// Handler de cliques nas abas superiores
document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    const type = btn.dataset.type;
    updateReportView(type);
    history.pushState(null, '', `/admin/relatorios?tipo=${type}`);
  };
});

// Ler tipo da URL (?tipo=prestador, etc.)
const urlParams = new URLSearchParams(window.location.search);
const initialType = urlParams.get('tipo') || 'geral';
updateReportView(initialType);

// Handlers de exportação CSV e PDF
const csvBtn = document.querySelector('#btnExportCSVPage');
if (csvBtn) {
  csvBtn.onclick = () => {
    if (!window.currentReportData) return showToast('Sem dados para exportar');
    const { headers, rows } = window.currentReportData;
    const csvContent = [
      (headers || []).join(','),
      ...(rows || []).map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download do Relatório CSV iniciado com sucesso!');
  };
}

const pdfBtn = document.querySelector('#btnExportPDFPage');
if (pdfBtn) {
  pdfBtn.onclick = () => {
    showToast('Gerando arquivo PDF do Demonstrativo Financeiro...');
  };
}

