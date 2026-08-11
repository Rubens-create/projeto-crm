const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let payments = [];
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

async function fetchPayments() {
  try {
    const res = await fetch('/api/admin/payments');
    if (res.ok) {
      payments = await res.json();
      render();
    }
  } catch (err) {
    console.error('Erro ao buscar pagamentos:', err);
  }
}

function render() {
  const filtered = payments.filter(p => currentFilter === 'all' || (currentFilter === 'done' ? p.status === 'Pago' : p.status !== 'Pago'));

  const pendingTotal = payments.filter(p => p.status !== 'Pago').reduce((a, p) => a + (p.amount || 0), 0);
  const doneTotal = payments.filter(p => p.status === 'Pago').reduce((a, p) => a + (p.amount || 0), 0);
  const billedHours = payments.reduce((a, p) => a + (p.hours || 0), 0);

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
          <span class="professional-avatar">${(p.professional || 'P').split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
          <div>
            <strong>${p.professional}</strong>
            <small>ID: ${p.id}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="specialty"><i data-lucide="calendar"></i>${p.period || 'Período Atual'}</span>
      </td>
      <td><strong>${(p.hours || 0).toFixed(1).replace('.', ',')}h</strong></td>
      <td>${p.date || 'Hoje'}</td>
      <td><strong>${money(p.amount || 0)}</strong></td>
      <td>
        <span class="professional-status ${p.status === 'Pago' ? 'active' : 'inactive'}">
          <i data-lucide="${p.status === 'Pago' ? 'check-circle-2' : 'clock'}"></i>${p.status || 'Pago'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${p.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${p.id}">
            <button data-action="pay" data-id="${p.id}">
              <i data-lucide="check"></i>
              Repasse Concluído
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
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const hours = Number(data.hours) || 4;
    const amount = Number(data.amount) || (hours * 120);
    const newPay = {
      professional: data.proName || data.professional,
      amount: amount,
      hours: hours,
      period: data.period || 'Semana Atual'
    };
    await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPay)
    });
    form.reset();
    modal.classList.remove('open');
    fetchPayments();
    showToast(`Repasse de ${money(amount)} para ${newPay.professional} salvo no banco!`);
  };
}

document.addEventListener('click', () => {
  document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
});

const reportsMenuBtn = document.querySelector('#reportsMenuBtn');
const reportsNavGroup = document.querySelector('#reportsNavGroup');
if (reportsMenuBtn && reportsNavGroup) {
  reportsMenuBtn.onclick = (e) => {
    e.preventDefault();
    reportsNavGroup.classList.toggle('open');
  };
}

if (body) {
  body.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action="pay"]');
    if (btn) {
      e.stopPropagation();
      const id = btn.dataset.id;
      try {
        const res = await fetch('/api/admin/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_paid', id: id })
        });
        if (res.ok) {
          fetchPayments();
          showToast('Repasse marcado como concluído com sucesso!');
        } else {
          showToast('Erro ao marcar repasse como concluído.');
        }
      } catch (err) {
        showToast('Erro ao comunicar com o servidor.');
      }
    }
  });
}

fetchPayments();
