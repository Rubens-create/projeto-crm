const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const duration = seconds => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}min`;

async function loadExecutions() {
  const response = await fetch('/api/admin/executions');
  if (!response.ok) return;
  const data = await response.json();
  const summary = data.summary || {};
  const elTotalEx = document.querySelector('#totalExecutions'); if (elTotalEx) elTotalEx.textContent = summary.totalExecutions || 0;
  const elTotalHs = document.querySelector('#totalHours'); if (elTotalHs) elTotalHs.textContent = `${((summary.totalSeconds || 0) / 3600).toFixed(1)}h`;
  const elTotalRev = document.querySelector('#totalRevenue'); if (elTotalRev) elTotalRev.textContent = money((summary.totalValueCents || 0) / 100);
  const elTotalPend = document.querySelector('#totalPending'); if (elTotalPend) elTotalPend.textContent = money((summary.pendingValueCents || 0) / 100);
  const elBody = document.querySelector('#executionsBody');
  if (elBody) elBody.innerHTML = (data.executions || []).map(e => `<tr><td>${e.serviceName}</td><td>${e.clientName || '-'}</td><td>${e.professionalName}</td><td>${new Date(e.startedAt).toLocaleDateString('pt-BR')}</td><td>${duration(e.durationSeconds)}</td><td>${money(e.hourlyRateCents / 100)}/h</td><td>${money(e.totalValueCents / 100)}</td><td>${e.status}</td><td>${e.paymentId ? 'Incluído em repasse' : e.status === 'CONCLUIDO' ? `<button class="primary payout" data-id="${e.id}">Gerar repasse</button>` : '-'}</td></tr>`).join('') || '<tr><td colspan="9">Nenhuma execução encontrada.</td></tr>';
  document.querySelectorAll('.payout').forEach(button => button.onclick = async () => {
    const result = await fetch('/api/admin/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create_from_execution', executionId: button.dataset.id }) });
    if (result.ok) loadExecutions();
  });
}
loadExecutions();
