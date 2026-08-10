const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let services = [];
let currentFilter = 'all';

const body = document.querySelector('#servicesBody');
const modal = document.querySelector('#serviceModal');
const badgeCounter = document.querySelector('#totalServicesBadge');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function render() {
  if (badgeCounter) badgeCounter.textContent = services.length;

  const totalCountEl = document.querySelector('#totalServicesCount');
  if (totalCountEl) totalCountEl.textContent = services.length;

  const activeCountEl = document.querySelector('#activeServicesCount');
  if (activeCountEl) activeCountEl.textContent = services.filter(s => s.active).length;

  const avgRateEl = document.querySelector('#avgServiceRate');
  if (avgRateEl && services.length > 0) {
    const avg = services.reduce((a, s) => a + s.rate, 0) / services.length;
    avgRateEl.textContent = money(avg);
  }

  const filtered = services.filter(s => currentFilter === 'all' || (currentFilter === 'active' ? s.active : !s.active));

  if (!body) return;

  body.innerHTML = filtered.map(s => `
    <tr>
      <td>
        <div class="professional-cell">
          <img src="${s.image || '/assets/loft.jpg'}" alt="${s.name}" style="width:36px;height:36px;border-radius:10px;object-fit:cover;flex:none;">
          <div>
            <strong>${s.name}</strong>
            <small>ID: ${s.id}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="specialty"><i data-lucide="clipboard-check"></i>${s.description || 'Limpeza Pós Check-out'}</span>
      </td>
      <td>
        <span style="font-size:11px;color:#6e6772;">
          <i data-lucide="bed" style="width:12px;vertical-align:-2px;"></i> ${s.bedrooms || 1}Q · 
          <i data-lucide="bath" style="width:12px;vertical-align:-2px;"></i> ${s.bathrooms || 1}B · 
          <i data-lucide="maximize-2" style="width:12px;vertical-align:-2px;"></i> ${s.sqm || 45}m²
        </span>
      </td>
      <td><strong>${s.estTime || '2.5h'}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <input type="number" step="0.50" min="1" id="rateInput_${s.id}" value="${s.rate.toFixed(2)}" style="width:80px;padding:6px;border:1px solid var(--line);border-radius:6px;font-size:11px;font-weight:700;">
          <button class="save-rate-btn" data-id="${s.id}" style="border:1px solid var(--pink-strong);background:var(--pink-strong);color:#fff;padding:6px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;">Salvar</button>
        </div>
      </td>
      <td>
        <span class="professional-status ${s.active ? 'active' : 'inactive'}">
          <i data-lucide="${s.active ? 'check' : 'eye-off'}"></i>${s.active ? 'Ativo (No App)' : 'Desativado'}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${s.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${s.id}">
            <button data-action="toggle" data-id="${s.id}">
              <i data-lucide="${s.active ? 'eye-off' : 'eye'}"></i>
              ${s.active ? 'Desativar (Ocultar)' : 'Ativar (Exibir)'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="empty-row">Nenhum serviço encontrado.</td></tr>';

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

  document.querySelectorAll('.save-rate-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      saveRate(btn.dataset.id);
    };
  });
}

async function toggleStatus(id) {
  const res = await fetch('/api/admin/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle', id })
  });
  if (res.ok) {
    services = await res.json();
    render();
    showToast('Visibilidade do imóvel alterada no PostgreSQL!');
  }
}

async function saveRate(id) {
  const rateInput = document.querySelector(`#rateInput_${id}`);
  if (!rateInput) return;
  const newRate = parseFloat(rateInput.value);
  if (isNaN(newRate) || newRate <= 0) {
    showToast('Insira um valor por hora válido.');
    return;
  }
  const res = await fetch('/api/admin/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', id, rate: newRate })
  });
  if (res.ok) {
    services = await res.json();
    render();
    showToast(`Tarifa por hora atualizada para ${money(newRate)}!`);
  }
}

async function load() {
  try {
    const res = await fetch('/api/admin/services');
    if (res.ok) {
      services = await res.json();
      render();
    }
  } catch (err) {
    console.error('Erro ao carregar serviços:', err);
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

const newServiceBtn = document.querySelector('#newServiceBtn');
if (newServiceBtn) newServiceBtn.onclick = () => modal.classList.add('open');

const closeModalBtn = document.querySelector('#closeModal');
if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('open');

if (modal) {
  modal.onclick = e => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

const form = document.querySelector('#serviceForm');
if (form) {
  form.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      action: 'create',
      name: formData.get('name'),
      description: formData.get('description'),
      rate: parseFloat(formData.get('rate')),
      bedrooms: parseInt(formData.get('bedrooms')) || 1,
      bathrooms: parseInt(formData.get('bathrooms')) || 1,
      livingRooms: parseInt(formData.get('livingRooms')) || 1,
      sqm: parseInt(formData.get('sqm')) || 45,
      estTime: formData.get('estTime'),
      image: formData.get('image')
    };

    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      form.reset();
      modal.classList.remove('open');
      services = await res.json();
      render();
      showToast('Novo imóvel cadastrado e publicado no PostgreSQL!');
    }
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

load();
