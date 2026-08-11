const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let clients = [];
let currentFilter = 'all';

const body = document.querySelector('#clientsBody');
const modal = document.querySelector('#clientModal');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function fetchClients() {
  try {
    const res = await fetch('/api/admin/clients');
    if (res.ok) {
      clients = await res.json();
      render();
    }
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
  }
}

function render() {
  const filtered = clients.filter(c => currentFilter === 'all' || (currentFilter === 'active' ? c.status === 'Ativo' : c.status !== 'Ativo'));

  const totalClientsEl = document.querySelector('#totalClients');
  if (totalClientsEl) totalClientsEl.textContent = clients.length;

  const activeClientsEl = document.querySelector('#activeClients');
  if (activeClientsEl) activeClientsEl.textContent = clients.filter(c => c.status === 'Ativo').length;

  const totalPropsEl = document.querySelector('#totalProperties');
  if (totalPropsEl) totalPropsEl.textContent = clients.reduce((a, c) => a + (c.properties || 1), 0);

  if (!body) return;

  body.innerHTML = filtered.map(c => `
    <tr>
      <td>
        <div class="professional-cell">
          <div class="client-card-icon"><i data-lucide="building"></i></div>
          <div>
            <strong>${c.name}</strong>
            <small><i data-lucide="phone"></i> ${c.phone || 'Sem telefone'}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="specialty"><i data-lucide="mail"></i><strong>${c.email || 'contato@cliente.com'}</strong></span>
      </td>
      <td><small>${c.phone || '-'}</small></td>
      <td><strong>${c.properties || 1} imóvel(is)</strong></td>
      <td><strong>${money(c.monthlySpend || 0)}/mês</strong></td>
      <td>
        <span class="professional-status ${c.status === 'Ativo' ? 'active' : 'inactive'}">
          <i data-lucide="${c.status === 'Ativo' ? 'check' : 'pause'}"></i>${c.status || 'Ativo'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${c.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${c.id}">
            <button data-action="details" data-id="${c.id}">
              <i data-lucide="info"></i>Ver detalhes
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-row">Nenhum cliente encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('.professional-more').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
      const targetMenu = document.querySelector('#menu-' + btn.dataset.menu);
      if (targetMenu) targetMenu.classList.toggle('open');
    };
  });

  document.querySelectorAll('[data-action="details"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const c = clients.find(x => x.id === btn.dataset.id);
      if (c) showToast(`${c.name} · ${c.email}`);
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

const newClientBtn = document.querySelector('#newClient');
if (newClientBtn) newClientBtn.onclick = () => modal.classList.add('open');

const closeModalBtn = document.querySelector('#closeModal');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('open');

if (modal) {
  modal.onclick = e => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

const form = document.querySelector('#clientForm');
if (form) {
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const newCli = {
      name: data.name,
      email: data.email || 'contato@cliente.com',
      phone: data.phone || '',
      properties: Number(data.properties || data.sqm) || 1
    };
    await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCli)
    });
    form.reset();
    modal.classList.remove('open');
    fetchClients();
    showToast(`Cliente ${newCli.name} salvo no banco com sucesso!`);
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

fetchClients();
