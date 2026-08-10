const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

const reportData = {
  geral: [
    { name: 'Limpeza Pós Check-out', desc: 'Atendimentos de padrão Airbnb', hours: '82.5h (22 serv.)', rev: 12400, pay: 8250, margin: 4150 },
    { name: 'Turno Rápido & Troca de Enxoval', desc: 'Preparo urgente para hóspedes', hours: '44.0h (14 serv.)', rev: 7200, pay: 4800, margin: 2400 },
    { name: 'Higienização Profunda', desc: 'Manutenção mensal e detalhada', hours: '60.0h (12 serv.)', rev: 12661.10, pay: 9330, margin: 3331.10 }
  ],
  prestador: [
    { name: 'Marina Costa', desc: 'Especialista Pós Check-out & Enxoval', hours: '68.5h (18 serv.)', rev: 11800, pay: 8220, margin: 3580 },
    { name: 'Beatriz Lima', desc: 'Limpeza Geral Pós Hospedagem', hours: '62.0h (16 serv.)', rev: 10400, pay: 7440, margin: 2960 },
    { name: 'Rafael Mendes', desc: 'Turno Rápido Roupas & Banheiros', hours: '56.0h (14 serv.)', rev: 10061.10, pay: 6720, margin: 3341.10 }
  ],
  cliente: [
    { name: 'Dra. Camila Rocha', desc: 'Loft Jardins & Apt Paulista', hours: '72.0h (18 serv.)', rev: 13400, pay: 8640, margin: 4760 },
    { name: 'Grupo Hoteleiro Orla', desc: 'Penthouse Orla & Studio Pinheiros', hours: '64.5h (16 serv.)', rev: 11200, pay: 7740, margin: 3460 },
    { name: 'Carlos Eduardo', desc: 'Apt Copacabana', hours: '50.0h (14 serv.)', rev: 7661.10, pay: 6000, margin: 1661.10 }
  ],
  financeiro: [
    { name: 'Semana 1 - Agosto', desc: 'Consolidado de 01 a 07 de Agosto', hours: '45.0h (12 serv.)', rev: 7800, pay: 5400, margin: 2400 },
    { name: 'Semana 2 - Agosto', desc: 'Consolidado de 08 a 14 de Agosto', hours: '48.5h (13 serv.)', rev: 8400, pay: 5820, margin: 2580 },
    { name: 'Semana 3 - Agosto', desc: 'Consolidado de 15 a 21 de Agosto', hours: '46.0h (11 serv.)', rev: 7900, pay: 5520, margin: 2380 },
    { name: 'Semana 4 - Agosto (Parcial)', desc: 'Consolidado de 22 a 28 de Agosto', hours: '47.0h (12 serv.)', rev: 8161.10, pay: 5640, margin: 2521.10 }
  ],
  servico: [
    { name: 'Loft Moderno Jardins', desc: 'Tarifa R$ 120,00/h', hours: '58.0h (15 serv.)', rev: 10200, pay: 6960, margin: 3240 },
    { name: 'Penthouse Cobertura', desc: 'Tarifa R$ 180,00/h', hours: '42.5h (10 serv.)', rev: 9500, pay: 6375, margin: 3125 },
    { name: 'Apt Copacabana Beach', desc: 'Tarifa R$ 85,00/h', hours: '46.0h (12 serv.)', rev: 6861.10, pay: 4900, margin: 1961.10 },
    { name: 'Studio Integrado Pinheiros', desc: 'Tarifa R$ 110,00/h', hours: '40.0h (11 serv.)', rev: 5700, pay: 4145, margin: 1555 }
  ]
};

const toast = document.querySelector('#toast');
const reportsBody = document.querySelector('#reportsBody');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateReportView(type) {
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

  // Renderizar linhas da tabela
  const rows = reportData[type] || reportData.geral;
  if (reportsBody) {
    reportsBody.innerHTML = rows.map(r => `
      <tr>
        <td>
          <div class="professional-cell">
            <div class="client-card-icon"><i data-lucide="bar-chart-3"></i></div>
            <div>
              <strong>${r.name}</strong>
            </div>
          </div>
        </td>
        <td><small>${r.desc}</small></td>
        <td><strong>${r.hours}</strong></td>
        <td><strong style="color:#3b8761;">${money(r.rev)}</strong></td>
        <td><strong>${money(r.pay)}</strong></td>
        <td><strong style="color:var(--pink-strong);">${money(r.margin)}</strong></td>
      </tr>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
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
    showToast('Download do Relatório CSV iniciado com sucesso!');
  };
}

const pdfBtn = document.querySelector('#btnExportPDFPage');
if (pdfBtn) {
  pdfBtn.onclick = () => {
    showToast('Gerando arquivo PDF do Demonstrativo Financeiro...');
  };
}
