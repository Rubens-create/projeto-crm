const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let payments = [
  { id: 'PAY-01', proName: 'Marina Costa', serviceName: 'Loft Jardins (Pós Check-out)', hours: 6.5, rate: 120.00, amount: 780.00, done: true },
  { id: 'PAY-02', proName: 'Rafael Mendes', serviceName: 'Apt Copacabana (Turno Rápido)', hours: 4.0, rate: 85.00, amount: 340.00, done: false },
  { id: 'PAY-03', proName: 'Beatriz Lima', serviceName: 'Studio Pinheiros (Geral)', hours: 8.0, rate: 110.00, amount: 880.00, done: true },
  { id: 'PAY-04', proName: 'Lucas Rocha', serviceName: 'Penthouse Orla (Profunda)', hours: 5.5, rate: 180.00, amount: 990.00, done: false }
];

let currentFilter = 'all';

const body = document.querySelector('#paymentsBody');
const modal = document.querySelector('#paymentModal');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function render() {
  const filtered = payments.filter(p => currentFilter === 'all' || (currentFilter === 'done' ? p.done : !p.done));

  const pendingTotal = payments.filter(p => !p.done).reduce((a, p) => a + p.amount, 0);
  const doneTotal = payments.filter(p => p.done).reduce((a, p) => a + p.amount, 0);
  const billedHours = payments.reduce((a, p) => a + p.hours, 0);

  const pendingEl = document.querySelector('#totalPayoutPending');
  if (pendingEl) pendingEl.textContent = money(pendingTotal);

  const doneEl = document.querySelector('#totalPayoutDone');
  if (doneEl) doneEl.textContent = money(doneTotal);

  const hoursEl = document.querySelector('#totalBilledHours');
  if (hoursEl) hoursEl.textContent = billedHours.toFixed(1).replace('.', ',') + 'h';

  if (!body) return;

  body.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <div class="professional-cell">
          <span class="professional-avatar">${p.proName.split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
          <div>
            <strong>${p.proName}</strong>
            <small>ID: ${p.id}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="specialty"><i data-lucide="briefcase-business"></i>${p.serviceName}</span>
      </td>
      <td><strong>${p.hours.toFixed(1).replace('.', ',')}h</strong></td>
      <td>${money(p.rate)}/h</td>
      <td><strong>${money(p.amount)}</strong></td>
      <td>
        <span class="professional-status ${p.done ? 'active' : 'inactive'}">
          <i data-lucide="${p.done ? 'check-circle-2' : 'clock'}"></i>${p.done ? 'Pago' : 'Pendente'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${p.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${p.id}">
            <button data-action="pay" data-id="${p.id}" ${p.done ? 'disabled style="opacity:0.5;cursor:default;"' : ''}>
              <i data-lucide="${p.done ? 'check' : 'badge-dollar-sign'}"></i>
              ${p.done ? 'Repasse Concluído' : 'Liberar Repasse'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-row">Nenhum repasse encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('.professional-more').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
      const targetMenu = document.querySelector('#menu-' + btn.dataset.menu);
      if (targetMenu) targetMenu.classList.toggle('open');
    };
  });

  document.querySelectorAll('[data-action="pay"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const p = payments.find(x => x.id === btn.dataset.id);
      if (p && !p.done) {
        p.done = true;
        render();
        showToast(`Repasse de ${money(p.amount)} liberado para ${p.proName}!`);
      }
    };
  });
}

document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    const activeFilter = document.querySelector('.filter.active');
    if (activeFilter) activeFilter.classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  };
});

const newPaymentBtn = document.querySelector('#newPayment');
if (newPaymentBtn) newPaymentBtn.onclick = () => modal.classList.add('open');

const closeModalBtn = document.querySelector('#closeModal');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('open');

if (modal) {
  modal.onclick = e => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

const form = document.querySelector('#paymentForm');
if (form) {
  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const hours = Number(data.hours) || 4;
    const rate = Number(data.rate) || 100;
    const newPay = {
      id: 'PAY-0' + (payments.length + 1),
      proName: data.proName,
      serviceName: data.serviceName,
      hours: hours,
      rate: rate,
      amount: hours * rate,
      done: false
    };
    payments.unshift(newPay);
    form.reset();
    modal.classList.remove('open');
    render();
    showToast(`Repasse registrado para ${newPay.proName}!`);
  };
}

document.addEventListener('click', () => {
  document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
});

render();
