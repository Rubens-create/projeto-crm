const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let clients = [
  { id: 'CLI-01', name: 'Dra. Camila Rocha', propertyName: 'Loft Jardins', address: 'Alameda Santos, 1400 - Jardins, São Paulo', phone: '(11) 91122-3344', sqm: 55, rate: 120.00, active: true },
  { id: 'CLI-02', name: 'Carlos Eduardo', propertyName: 'Apt Copacabana', address: 'Av. Atlântica, 2200 - Copacabana, Rio de Janeiro', phone: '(21) 98877-6655', sqm: 38, rate: 85.00, active: true },
  { id: 'CLI-03', name: 'Grupo Hoteleiro Orla', propertyName: 'Penthouse Orla & Studio Pinheiros', address: 'Av. Faria Lima, 3400 - Pinheiros, São Paulo', phone: '(11) 3090-8000', sqm: 120, rate: 180.00, active: true }
];

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

function render() {
  const filtered = clients.filter(c => currentFilter === 'all' || (currentFilter === 'active' ? c.active : !c.active));

  const totalClientsEl = document.querySelector('#totalClients');
  if (totalClientsEl) totalClientsEl.textContent = clients.length;

  const activeClientsEl = document.querySelector('#activeClients');
  if (activeClientsEl) activeClientsEl.textContent = clients.filter(c => c.active).length;

  const totalPropsEl = document.querySelector('#totalProperties');
  if (totalPropsEl) totalPropsEl.textContent = clients.length + 1;

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
        <span class="specialty"><i data-lucide="home"></i><strong>${c.propertyName}</strong></span>
      </td>
      <td><small>${c.address}</small></td>
      <td><strong>${c.sqm} m²</strong></td>
      <td><strong>${money(c.rate)}/h</strong></td>
      <td>
        <span class="professional-status ${c.active ? 'active' : 'inactive'}">
          <i data-lucide="${c.active ? 'check' : 'pause'}"></i>${c.active ? 'Ativo' : 'Desativado'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${c.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${c.id}">
            <button data-action="toggle" data-id="${c.id}">
              <i data-lucide="${c.active ? 'eye-off' : 'eye'}"></i>
              ${c.active ? 'Desativar' : 'Ativar'}
            </button>
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

  document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleStatus(btn.dataset.id);
    };
  });

  document.querySelectorAll('[data-action="details"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const c = clients.find(x => x.id === btn.dataset.id);
      if (c) showToast(`${c.name} · ${c.propertyName} (${c.address})`);
    };
  });
}

function toggleStatus(id) {
  const c = clients.find(x => x.id === id);
  if (c) {
    c.active = !c.active;
    render();
    showToast(`Contrato de ${c.name} alterado para ${c.active ? 'Ativo' : 'Desativado'}!`);
  }
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
  form.onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const newCli = {
      id: 'CLI-0' + (clients.length + 1),
      name: data.name,
      propertyName: data.propertyName,
      address: data.address,
      phone: data.phone,
      sqm: Number(data.sqm) || 50,
      rate: Number(data.rate) || 120,
      active: true
    };
    clients.unshift(newCli);
    form.reset();
    modal.classList.remove('open');
    render();
    showToast(`Cliente ${newCli.name} cadastrado com sucesso!`);
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

render();
