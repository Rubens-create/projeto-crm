const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const number = value => new Intl.NumberFormat('pt-BR').format(Number(value) || 0);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const duration = seconds => {
  const total = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}h ${minutes}min` : `${minutes}min`;
};

const statusInfo = status => {
  if (status === 'CONCLUIDO') return { label: 'Concluído', className: 'done', icon: 'circle-check' };
  if (status === 'CANCELADO') return { label: 'Cancelado', className: 'canceled', icon: 'circle-x' };
  return { label: 'Em execução', className: 'running', icon: 'radio' };
};

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = value;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
  return response.json();
}

function renderExecutions(executions) {
  const body = document.querySelector('#executionsBody');
  if (!body) return;
  const sorted = [...executions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 6);
  body.innerHTML = sorted.map(execution => {
    const status = statusInfo(execution.status);
    const start = execution.startedAt ? new Date(execution.startedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
    return `<tr>
      <td><div class="dashboard-service-cell"><strong>${escapeHtml(execution.serviceName || 'Serviço')}</strong><small>${escapeHtml(execution.id || '')}</small></div></td>
      <td>${escapeHtml(execution.clientName || 'Sem cliente')}</td>
      <td><span class="person"><span class="mini-avatar">${escapeHtml((execution.professionalName || 'P').split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join(''))}</span>${escapeHtml(execution.professionalName || 'Não informado')}</span></td>
      <td>${escapeHtml(start)}</td>
      <td>${escapeHtml(duration(execution.durationSeconds))}</td>
      <td><strong>${money((execution.totalValueCents || 0) / 100)}</strong></td>
      <td><span class="dashboard-status ${status.className}"><i data-lucide="${status.icon}"></i>${status.label}</span></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="dashboard-loading">Nenhuma execução registrada ainda.</td></tr>';
}

function renderWeekChart(executions) {
  const chart = document.querySelector('#weekChart');
  if (!chart) return;
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    days.push({ date, key, count: 0, today: offset === 0 });
  }
  executions.forEach(execution => {
    if (!execution.startedAt) return;
    const date = new Date(execution.startedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const day = days.find(item => item.key === key);
    if (day) day.count += 1;
  });
  const maximum = Math.max(1, ...days.map(day => day.count));
  chart.innerHTML = days.map(day => {
    const height = day.count ? Math.max(12, Math.round((day.count / maximum) * 115)) : 5;
    const label = day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    return `<div class="week-bar${day.today ? ' today' : ''}"><span>${number(day.count)}</span><i style="height:${height}px"></i><small>${escapeHtml(label)}</small></div>`;
  }).join('');
}

function renderHealth(professionals, services, pendingValue) {
  const activeProfessionals = professionals.filter(item => item.active).length;
  const activeServices = services.filter(item => item.active).length;
  setText('teamHealth', `${activeProfessionals} de ${professionals.length} prestadores ativos`);
  setText('catalogHealth', `${activeServices} de ${services.length} serviços disponíveis`);
  setText('payoutHealth', pendingValue > 0 ? `${money(pendingValue)} aguardando liquidação` : 'Nenhum valor pendente');
  setText('teamHealthBadge', activeProfessionals ? 'Operando' : 'Atenção');
  setText('catalogHealthBadge', activeServices ? 'Disponível' : 'Atenção');
  setText('payoutHealthBadge', pendingValue > 0 ? 'Pendente' : 'Em dia');
  document.querySelector('#teamHealthBadge')?.classList.toggle('attention', !activeProfessionals);
  document.querySelector('#catalogHealthBadge')?.classList.toggle('attention', !activeServices);
  document.querySelector('#payoutHealthBadge')?.classList.toggle('attention', pendingValue > 0);
}

async function loadDashboard() {
  try {
    const [executionData, services, properties, professionals, clients] = await Promise.all([
      fetchJson('/api/admin/executions'),
      fetchJson('/api/admin/services'),
      fetchJson('/api/admin/properties'),
      fetchJson('/api/admin/professionals'),
      fetchJson('/api/admin/clients')
    ]);

    const executions = executionData.executions || [];
    const summary = executionData.summary || {};
    const activeExecutions = executions.filter(item => item.status === 'EM_ANDAMENTO').length;
    const revenue = Number(summary.totalValueCents || 0) / 100;
    const paid = Number(summary.paidValueCents || 0) / 100;
    const pending = Number(summary.pendingValueCents || 0) / 100;
    const payoutBase = paid + pending;
    const paidPercent = payoutBase > 0 ? Math.round((paid / payoutBase) * 100) : 100;

    setText('activeExecutions', number(activeExecutions));
    setText('completedExecutions', number(summary.totalExecutions || 0));
    setText('grossRevenue', money(revenue));
    setText('pendingPayouts', money(pending));
    setText('serviceCount', number(services.filter(item => item.active).length));
    setText('propertyCount', number(properties.filter(item => item.status === 'ATIVO').length));
    setText('providerCount', number(professionals.filter(item => item.active).length));
    setText('clientCount', number(clients.filter(item => item.status === 'Ativo').length));
    setText('operationalResult', money(revenue - paid));
    setText('paidPayouts', money(paid));
    setText('financialRevenue', money(revenue));
    setText('financialPaid', money(paid));
    setText('financialPending', money(pending));
    setText('paidProgressLabel', `${paidPercent}% dos repasses processados`);
    setText('lastUpdated', `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    const progress = document.querySelector('#paidProgress');
    if (progress) progress.style.width = `${paidPercent}%`;

    renderExecutions(executions);
    renderWeekChart(executions);
    renderHealth(professionals, services, pending);
    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error('Erro ao carregar dashboard administrativo:', error);
    const body = document.querySelector('#executionsBody');
    if (body) body.innerHTML = '<tr><td colspan="7" class="dashboard-loading">Não foi possível carregar os dados da operação.</td></tr>';
    setText('lastUpdated', 'Falha na atualização');
    showToast('Não foi possível carregar a visão geral da operação.');
  }
}

const mobileMenu = document.querySelector('#mobileMenu');
const sidebar = document.querySelector('#sidebar');
if (mobileMenu && sidebar) mobileMenu.addEventListener('click', () => sidebar.classList.toggle('open'));
const reportsMenuBtn = document.querySelector('#reportsMenuBtn');
const reportsNavGroup = document.querySelector('#reportsNavGroup');
if (reportsMenuBtn && reportsNavGroup) reportsMenuBtn.addEventListener('click', () => reportsNavGroup.classList.toggle('open'));

loadDashboard();
