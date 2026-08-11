const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

const toast = document.querySelector('#toast');
const reportsBody = document.querySelector('#reportsBody');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
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

  try {
    const res = await fetch(`/api/admin/reports?tipo=${type}`);
    if (!res.ok) throw new Error('Erro na resposta');
    const data = await res.json();

    if (data.stats) {
      const s1 = document.querySelector('#repTotalServices');
      if (s1) s1.textContent = data.stats.totalServices;
      
      const s2 = document.querySelector('#repTotalHours');
      if (s2) s2.textContent = (data.stats.totalHours || 0).toFixed(1).replace('.', ',') + 'h';
      
      const s3 = document.querySelector('#repTotalRevenue');
      if (s3) s3.textContent = money(data.stats.totalRevenue || 0);
      
      const s4 = document.querySelector('#repTotalPayouts');
      if (s4) s4.textContent = money(data.stats.totalPayouts || 0);
    }

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

