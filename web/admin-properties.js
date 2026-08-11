const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

let properties = [];
let clients = [];
let currentFilter = 'all';

const body = document.querySelector('#propertiesBody');
const modal = document.querySelector('#propertyModal');
const detailsModal = document.querySelector('#propertyDetailsModal');
const form = document.querySelector('#propertyForm');
const toast = document.querySelector('#toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function apiPost(payload) {
  const response = await fetch('/api/admin/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
  return data;
}

function populateClients() {
  const select = document.querySelector('#propertyClient');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Não vinculado</option>' + clients.map(client =>
    `<option value="${escapeHtml(client.id)}">${escapeHtml(client.name)}</option>`
  ).join('');
  select.value = current;
}

function renderStats() {
  document.querySelector('#totalProperties').textContent = properties.length;
  document.querySelector('#activeProperties').textContent = properties.filter(property => property.status === 'ATIVO').length;
  document.querySelector('#linkedProperties').textContent = properties.filter(property => property.clientId).length;
  document.querySelector('#unlinkedProperties').textContent = properties.filter(property => !property.clientId).length;
}

function render() {
  renderStats();
  const query = (document.querySelector('#propertySearch')?.value || '').trim().toLowerCase();
  const filtered = properties.filter(property => {
    const matchesFilter = currentFilter === 'all' ||
      (currentFilter === 'active' ? property.status === 'ATIVO' : property.status === 'ARQUIVADO');
    const haystack = `${property.name} ${property.address} ${property.clientName}`.toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });

  body.innerHTML = filtered.map(property => {
    const serviceCount = (property.services || []).length;
    return `<tr>
      <td><div class="professional-cell property-cell">
        <img src="${escapeHtml(property.image || '')}" alt="${escapeHtml(property.name)}" onerror="this.style.display='none'">
        <div><strong>${escapeHtml(property.name)}</strong><small>ID: ${escapeHtml(property.id)}</small></div>
      </div></td>
      <td>${property.clientName ? `<span class="specialty"><i data-lucide="user-round"></i>${escapeHtml(property.clientName)}</span>` : '<span class="property-unlinked">Não vinculado</span>'}</td>
      <td><small>${escapeHtml(property.address || 'Endereço não informado')}</small></td>
      <td><strong>${property.sqm || 0}m²</strong><small>${property.bedrooms || 0}Q · ${property.bathrooms || 0}B · ${property.livingRooms || 0}S</small></td>
      <td><span class="property-service-count">${serviceCount} serviço(s)</span></td>
      <td><span class="professional-status ${property.status === 'ATIVO' ? 'active' : 'inactive'}"><i data-lucide="${property.status === 'ATIVO' ? 'check' : 'archive'}"></i>${property.status === 'ATIVO' ? 'Ativo' : 'Arquivado'}</span></td>
      <td><div class="action-menu">
        <button class="more property-more" data-menu="${escapeHtml(property.id)}" aria-label="Ações"><i data-lucide="more-horizontal"></i></button>
        <div class="action-dropdown" id="property-menu-${escapeHtml(property.id)}">
          <button data-action="details" data-id="${escapeHtml(property.id)}"><i data-lucide="eye"></i>Ver detalhes</button>
          <button data-action="edit" data-id="${escapeHtml(property.id)}"><i data-lucide="pencil"></i>Editar</button>
          ${property.status === 'ATIVO' ? `<button data-action="archive" data-id="${escapeHtml(property.id)}"><i data-lucide="archive"></i>Arquivar</button>` : ''}
          <button data-action="delete" data-id="${escapeHtml(property.id)}" class="danger-action"><i data-lucide="trash-2"></i>Excluir</button>
        </div>
      </div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty-row">Nenhum imóvel encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();
  bindRowActions();
}

function bindRowActions() {
  document.querySelectorAll('.property-more').forEach(button => {
    button.onclick = event => {
      event.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open'));
      document.querySelector(`#property-menu-${CSS.escape(button.dataset.menu)}`)?.classList.toggle('open');
    };
  });
  document.querySelectorAll('[data-action]').forEach(button => {
    button.onclick = async event => {
      event.stopPropagation();
      const property = properties.find(item => item.id === button.dataset.id);
      if (!property) return;
      const action = button.dataset.action;
      if (action === 'details') openDetails(property);
      if (action === 'edit') openForm(property);
      if (action === 'archive') await archiveProperty(property);
      if (action === 'delete') await deleteProperty(property);
    };
  });
}

function openForm(property = null) {
  form.reset();
  document.querySelector('#propertyModalTitle').textContent = property ? 'Editar imóvel' : 'Novo imóvel';
  document.querySelector('#propertyId').value = property?.id || '';
  document.querySelector('#propertyName').value = property?.name || '';
  document.querySelector('#propertyClient').value = property?.clientId || '';
  document.querySelector('#propertyStatus').value = property?.status || 'ATIVO';
  document.querySelector('#propertyAddress').value = property?.address || '';
  document.querySelector('#propertyDescription').value = property?.description || '';
  document.querySelector('#propertyBedrooms').value = property?.bedrooms ?? 1;
  document.querySelector('#propertyBathrooms').value = property?.bathrooms ?? 1;
  document.querySelector('#propertyLivingRooms').value = property?.livingRooms ?? 0;
  document.querySelector('#propertySqm').value = property?.sqm ?? 0;
  document.querySelector('#propertyEstimatedTime').value = property?.estimatedTime || '';
  document.querySelector('#propertyImage').value = property?.image || '';
  document.querySelector('#propertyImagePreview').src = property?.image || '';
  document.querySelector('#propertyImageName').textContent = property?.image ? 'Imagem atual' : 'Nenhuma imagem selecionada';
  modal.classList.add('open');
}

function openDetails(property) {
  const services = (property.services || []).map(service => `<li><div><strong>${escapeHtml(service.description || 'Serviço')}</strong><small>${escapeHtml(service.estTime || 'Sem estimativa')}</small></div><b>${money(service.rate)}/h</b></li>`).join('');
  document.querySelector('#propertyDetailsContent').innerHTML = `
    <div class="property-detail-hero"><img src="${escapeHtml(property.image || '')}" alt="${escapeHtml(property.name)}" onerror="this.style.display='none'"><div><span class="professional-status ${property.status === 'ATIVO' ? 'active' : 'inactive'}">${property.status === 'ATIVO' ? 'Ativo' : 'Arquivado'}</span><h2>${escapeHtml(property.name)}</h2><p>${escapeHtml(property.address || 'Endereço não informado')}</p></div></div>
    <div class="property-detail-grid">
      <div><small>Cliente</small><strong>${escapeHtml(property.clientName || 'Não vinculado')}</strong></div>
      <div><small>Estrutura</small><strong>${property.bedrooms || 0}Q · ${property.bathrooms || 0}B · ${property.livingRooms || 0}S · ${property.sqm || 0}m²</strong></div>
      <div><small>Tempo padrão</small><strong>${escapeHtml(property.estimatedTime || 'Não informado')}</strong></div>
      <div class="full"><small>Descrição</small><p>${escapeHtml(property.description || 'Sem descrição.')}</p></div>
    </div>
    <div class="property-related-services"><h3>Serviços relacionados</h3><ul>${services || '<li class="empty-service">Nenhum serviço relacionado.</li>'}</ul></div>`;
  detailsModal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

async function archiveProperty(property) {
  if (!confirm(`Arquivar o imóvel “${property.name}”? O histórico será preservado.`)) return;
  try {
    properties = await apiPost({ action: 'archive', id: property.id });
    render();
    showToast('Imóvel arquivado sem apagar o histórico.');
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteProperty(property) {
  if (!confirm(`Excluir permanentemente o imóvel “${property.name}”?`)) return;
  try {
    properties = await apiPost({ action: 'delete', id: property.id });
    render();
    showToast('Imóvel sem vínculos excluído.');
  } catch (error) {
    showToast(`${error.message} Use a opção Arquivar para preservar os relacionamentos.`);
  }
}

form.onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    action: data.id ? 'update' : 'create', id: data.id,
    name: data.name, clientId: data.clientId, address: data.address,
    description: data.description, bedrooms: Number(data.bedrooms) || 0,
    bathrooms: Number(data.bathrooms) || 0, livingRooms: Number(data.livingRooms) || 0,
    sqm: Number(data.sqm) || 0, image: data.image, estimatedTime: data.estimatedTime,
    status: data.status || 'ATIVO'
  };
  try {
    properties = await apiPost(payload);
    modal.classList.remove('open');
    render();
    showToast(data.id ? 'Imóvel atualizado com sucesso.' : 'Imóvel criado com sucesso.');
  } catch (error) {
    showToast(error.message);
  }
};

async function uploadImage() {
  const input = document.querySelector('#propertyFileInput');
  const file = input.files[0];
  if (!file) return;
  const preview = document.querySelector('#propertyImagePreview');
  const hidden = document.querySelector('#propertyImage');
  const name = document.querySelector('#propertyImageName');
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    name.textContent = file.name;
    hidden.value = reader.result;
  };
  reader.readAsDataURL(file);
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('upload failed');
    const result = await response.json();
    hidden.value = result.url;
    preview.src = result.url;
    showToast('Imagem enviada com sucesso.');
  } catch {
    showToast('Imagem armazenada como dados locais.');
  }
}

document.querySelector('#propertyFileInput').onchange = uploadImage;
document.querySelector('#newPropertyBtn').onclick = () => openForm();
document.querySelector('#closePropertyModal').onclick = () => modal.classList.remove('open');
document.querySelector('#closePropertyDetails').onclick = () => detailsModal.classList.remove('open');
modal.onclick = event => { if (event.target === modal) modal.classList.remove('open'); };
detailsModal.onclick = event => { if (event.target === detailsModal) detailsModal.classList.remove('open'); };
document.querySelector('#propertySearch').oninput = render;
document.querySelectorAll('.property-filters .filter').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.property-filters .filter').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    render();
  };
});
document.addEventListener('click', () => document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open')));
document.querySelector('#reportsMenuBtn').onclick = event => { event.preventDefault(); document.querySelector('#reportsNavGroup').classList.toggle('open'); };

async function load() {
  try {
    const [propertyResponse, clientResponse] = await Promise.all([fetch('/api/admin/properties'), fetch('/api/admin/clients')]);
    if (!propertyResponse.ok || !clientResponse.ok) throw new Error('Falha ao carregar dados.');
    [properties, clients] = await Promise.all([propertyResponse.json(), clientResponse.json()]);
    populateClients();
    render();
  } catch (error) {
    body.innerHTML = '<tr><td colspan="7" class="empty-row">Não foi possível carregar os imóveis.</td></tr>';
    showToast(error.message);
  }
}

load();
