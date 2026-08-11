const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let professionals = [];
let currentFilter = 'all';

const body = document.querySelector('#professionalsBody');
const modal = document.querySelector('#professionalModal');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function fetchProfessionals() {
  try {
    const res = await fetch('/api/admin/professionals');
    if (res.ok) {
      professionals = await res.json();
      render();
    }
  } catch (err) {
    console.error('Erro ao buscar profissionais:', err);
  }
}

function render() {
  const filtered = professionals.filter(p => currentFilter === 'all' || (currentFilter === 'active' ? p.active : !p.active));

  const totalProEl = document.querySelector('#totalProfessionals');
  if (totalProEl) totalProEl.textContent = professionals.length;

  const activeProEl = document.querySelector('#activeProfessionals');
  if (activeProEl) activeProEl.textContent = professionals.filter(p => p.active).length;

  const totalHoursEl = document.querySelector('#totalProfessionalHours');
  if (totalHoursEl) totalHoursEl.textContent = professionals.reduce((a, p) => a + (p.hours || 0), 0).toFixed(1).replace('.', ',') + 'h';

  const totalEarnedEl = document.querySelector('#totalProfessionalEarned');
  if (totalEarnedEl) totalEarnedEl.textContent = money(professionals.reduce((a, p) => a + (p.earned || 0), 0));

  if (!body) return;

  body.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <div class="professional-cell">
          <span class="professional-avatar">${(p.name || 'P').split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
          <div>
            <strong>${p.name}</strong>
            <small>${p.email}<br>${p.phone || 'Telefone não informado'}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="specialty"><i data-lucide="briefcase-business"></i>${p.specialty || 'Limpeza'}</span>
      </td>
      <td><strong>${(p.hours || 0).toFixed(1).replace('.', ',')}h</strong></td>
      <td><strong>${money(p.earned || 0)}</strong></td>
      <td>
        <span class="professional-status ${p.active ? 'active' : 'inactive'}">
          <i data-lucide="${p.active ? 'check' : 'pause'}"></i>${p.active ? 'Ativo' : 'Desativado'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${p.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${p.id}">
            <button data-action="toggle" data-id="${p.id}">
              <i data-lucide="${p.active ? 'user-round-minus' : 'user-round-check'}"></i>
              ${p.active ? 'Desativar' : 'Ativar'}
            </button>
            <button data-action="details" data-id="${p.id}">
              <i data-lucide="eye"></i>Ver detalhes
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6" class="empty-row">Nenhum profissional encontrado.</td></tr>';

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
      const p = professionals.find(x => x.id === btn.dataset.id);
      if (p) showToast(`${p.name} · ${p.specialty} (${p.hours}h ativas)`);
    };
  });
}

async function toggleStatus(id) {
  const p = professionals.find(x => x.id === id);
  if (p) {
    await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id })
    });
    fetchProfessionals();
    showToast(`Status de ${p.name} alterado no banco de dados!`);
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

const newProBtn = document.querySelector('#newProfessional');
if (newProBtn) newProBtn.onclick = () => modal.classList.add('open');

const closeModalBtn = document.querySelector('#closeModal');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('open');

if (modal) {
  modal.onclick = e => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

const form = document.querySelector('#professionalForm');
if (form) {
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const newPro = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialty: data.specialty,
    };
    await fetch('/api/admin/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPro)
    });
    form.reset();
    modal.classList.remove('open');
    fetchProfessionals();
    showToast(`Profissional ${newPro.name} salvo no banco com sucesso!`);
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

fetchProfessionals();
