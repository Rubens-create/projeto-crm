const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

let services = [];
let properties = [];
let currentFilter = 'all';

const body = document.querySelector('#servicesBody');
const modal = document.querySelector('#serviceModal');
const editModal = document.querySelector('#editServiceModal');
const toast = document.querySelector('#toast');

function showToast(message) {
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

function populatePropertySelects() {
  const options = properties.filter(property => property.status === 'ATIVO').map(property =>
    `<option value="${escapeHtml(property.id)}">${escapeHtml(property.name)}${property.clientName ? ` · ${escapeHtml(property.clientName)}` : ''}</option>`
  ).join('');
  ['newServiceProperty', 'editServiceProperty'].forEach(id => {
    const select = document.querySelector(`#${id}`);
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Selecione um imóvel</option>' + options;
    select.value = current;
  });
}

function render() {
  const badge = document.querySelector('#totalServicesBadge');
  if (badge) badge.textContent = services.length;
  const filtered = services.filter(service => currentFilter === 'all' || (currentFilter === 'active' ? service.active : !service.active));
  body.innerHTML = filtered.map(service => `<tr>
    <td><div class="professional-cell"><img src="${escapeHtml(service.image || '')}" alt="${escapeHtml(service.name)}" style="width:38px;height:38px;border-radius:10px;object-fit:cover;flex:none" onerror="this.style.display='none'"><div><strong>${escapeHtml(service.name)}</strong><small>${escapeHtml(service.propertyId || 'Sem imóvel')}</small></div></div></td>
    <td><span class="specialty"><i data-lucide="clipboard-check"></i>${escapeHtml(service.description || 'Serviço de limpeza')}</span></td>
    <td><strong>${money(service.rate)}/h</strong></td>
    <td><strong>${escapeHtml(service.estTime || 'Não informado')}</strong></td>
    <td><span class="professional-status ${service.active ? 'active' : 'inactive'}"><i data-lucide="${service.active ? 'check' : 'eye-off'}"></i>${service.active ? 'Ativo' : 'Desativado'}</span></td>
    <td><div class="action-menu"><button class="more service-more" data-menu="${escapeHtml(service.id)}" aria-label="Mais opções"><i data-lucide="more-horizontal"></i></button><div class="action-dropdown" id="service-menu-${escapeHtml(service.id)}"><button data-action="edit" data-id="${escapeHtml(service.id)}"><i data-lucide="pencil"></i>Editar informações</button><button data-action="toggle" data-id="${escapeHtml(service.id)}"><i data-lucide="${service.active ? 'eye-off' : 'eye'}"></i>${service.active ? 'Desativar' : 'Ativar'}</button></div></div></td>
  </tr>`).join('') || '<tr><td colspan="6" class="empty-row">Nenhum serviço encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll('.service-more').forEach(button => {
    button.onclick = event => {
      event.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open'));
      document.querySelector(`#service-menu-${CSS.escape(button.dataset.menu)}`)?.classList.toggle('open');
    };
  });
  document.querySelectorAll('[data-action="edit"]').forEach(button => button.onclick = event => {
    event.stopPropagation();
    openEdit(button.dataset.id);
  });
  document.querySelectorAll('[data-action="toggle"]').forEach(button => button.onclick = async event => {
    event.stopPropagation();
    await saveService({ action: 'toggle', id: button.dataset.id }, 'Visibilidade do serviço atualizada.');
  });
}

function openEdit(id) {
  const service = services.find(item => item.id === id);
  if (!service) return;
  document.querySelector('#editServiceId').value = service.id;
  document.querySelector('#editServiceProperty').value = service.propertyId || '';
  document.querySelector('#editServiceDescription').value = service.description || '';
  document.querySelector('#editServiceRate').value = service.rate || '';
  document.querySelector('#editServiceEstTime').value = service.estTime || '';
  editModal.classList.add('open');
}

async function saveService(payload, successMessage) {
  try {
    const response = await fetch('/api/admin/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não foi possível salvar o serviço.');
    services = result;
    render();
    showToast(successMessage);
    return true;
  } catch (error) {
    showToast(error.message);
    return false;
  }
}

async function load() {
  try {
    const [serviceResponse, propertyResponse] = await Promise.all([fetch('/api/admin/services'), fetch('/api/admin/properties')]);
    if (!serviceResponse.ok || !propertyResponse.ok) throw new Error('Falha ao carregar serviços e imóveis.');
    [services, properties] = await Promise.all([serviceResponse.json(), propertyResponse.json()]);
    populatePropertySelects();
    render();
  } catch (error) {
    body.innerHTML = '<tr><td colspan="6" class="empty-row">Não foi possível carregar os serviços.</td></tr>';
    showToast(error.message);
  }
}

document.querySelectorAll('.filter').forEach(button => button.onclick = () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  render();
});

document.querySelector('#newServiceBtn').onclick = () => {
  if (!properties.some(property => property.status === 'ATIVO')) return showToast('Cadastre um imóvel ativo antes de criar um serviço.');
  document.querySelector('#serviceForm').reset();
  modal.classList.add('open');
};
document.querySelector('#closeModal').onclick = () => modal.classList.remove('open');
document.querySelector('#closeEditModal').onclick = () => editModal.classList.remove('open');
modal.onclick = event => { if (event.target === modal) modal.classList.remove('open'); };
editModal.onclick = event => { if (event.target === editModal) editModal.classList.remove('open'); };

document.querySelector('#serviceForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const saved = await saveService({ action: 'create', propertyId: data.propertyId, description: data.description, rate: Number(data.rate), estTime: data.estTime }, 'Serviço criado para o imóvel selecionado.');
  if (saved) modal.classList.remove('open');
};
document.querySelector('#editServiceForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const saved = await saveService({ action: 'update', id: data.id, propertyId: data.propertyId, description: data.description, rate: Number(data.rate), estTime: data.estTime }, 'Serviço atualizado com sucesso.');
  if (saved) editModal.classList.remove('open');
};

document.addEventListener('click', () => document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open')));
document.querySelector('#reportsMenuBtn').onclick = event => { event.preventDefault(); document.querySelector('#reportsNavGroup').classList.toggle('open'); };
load();
