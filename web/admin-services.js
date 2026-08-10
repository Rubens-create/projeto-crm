const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const form = document.querySelector('#serviceForm');
const catalogContainer = document.querySelector('#catalogRows');
const badgeCounter = document.querySelector('#totalServicesBadge');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function render(options) {
  if (badgeCounter) badgeCounter.textContent = options.length;

  catalogContainer.innerHTML = options.map(o => `
    <article class="admin-service-card ${o.active ? 'is-active' : 'is-inactive'}" id="card_${o.id}">
      <div class="admin-card-thumb">
        <img src="${o.image || '/assets/loft.jpg'}" alt="${o.name}" loading="lazy">
        <span class="admin-card-status-pill ${o.active ? 'active' : 'inactive'}">
          ${o.active ? '<i data-lucide="check-circle-2"></i> Ativo' : '<i data-lucide="eye-off"></i> Desativado'}
        </span>
      </div>
      <div class="admin-card-content">
        <div class="admin-card-header">
          <div>
            <h3>${o.name}</h3>
            <p>${o.description || 'Sem descrição'}</p>
          </div>
        </div>

        <div class="admin-card-meta-row">
          <span><i data-lucide="bed"></i> ${o.bedrooms || 1} Q</span>
          <span><i data-lucide="bath"></i> ${o.bathrooms || 1} B</span>
          <span><i data-lucide="armchair"></i> ${o.livingRooms || 1} S</span>
          <span><i data-lucide="maximize-2"></i> ${o.sqm || 45} m²</span>
          <span><i data-lucide="clock"></i> ${o.estTime || '2.5h'}</span>
        </div>

        <div class="admin-card-actions-row">
          <div class="rate-edit-group">
            <label>Valor/Hora (R$):</label>
            <div class="rate-input-wrap">
              <input type="number" step="0.50" min="1" class="rate-input" id="rateInput_${o.id}" value="${o.rate.toFixed(2)}">
              <button class="save-rate-btn" data-id="${o.id}"><i data-lucide="save"></i> Salvar</button>
            </div>
          </div>

          <button class="toggle-active-btn ${o.active ? 'btn-deactivate' : 'btn-activate'}" data-id="${o.id}">
            ${o.active
              ? '<i data-lucide="eye-off"></i> Desativar (Ocultar do Prestador)'
              : '<i data-lucide="eye"></i> Ativar (Exibir no Prestador)'
            }
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Attach Toggle Listeners safely with closest()
  document.querySelectorAll('.toggle-active-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const targetBtn = e.target.closest('.toggle-active-btn');
      if (!targetBtn) return;
      const id = targetBtn.dataset.id;
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id })
      });
      if (res.ok) {
        const updated = await res.json();
        render(updated);
        showToast('Visibilidade do imóvel alterada no banco de dados!');
      }
    };
  });

  // Attach Save Rate Listeners safely with closest()
  document.querySelectorAll('.save-rate-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const targetBtn = e.target.closest('.save-rate-btn');
      if (!targetBtn) return;
      const id = targetBtn.dataset.id;
      const rateInput = document.querySelector(`#rateInput_${id}`);
      if (!rateInput) return;

      const newRate = parseFloat(rateInput.value);
      if (isNaN(newRate) || newRate <= 0) {
        showToast('Por favor insira um valor válido por hora.');
        return;
      }

      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: id,
          rate: newRate
        })
      });

      if (res.ok) {
        const updated = await res.json();
        render(updated);
        showToast(`Valor por hora atualizado para ${money(newRate)} no PostgreSQL!`);
      }
    };
  });

  if (window.lucide) lucide.createIcons();
}

async function load() {
  try {
    const res = await fetch('/api/admin/services');
    if (res.ok) {
      const data = await res.json();
      render(data);
    }
  } catch (err) {
    console.error('Erro ao carregar serviços no admin:', err);
  }
}

form.addEventListener('submit', async e => {
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
    const updated = await res.json();
    render(updated);
    showToast('Novo imóvel cadastrado e salvo no PostgreSQL!');
  }
});

load();
