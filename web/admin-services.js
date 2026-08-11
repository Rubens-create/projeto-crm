const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);

let services = [];
let currentFilter = 'all';

const body = document.querySelector('#servicesBody');
const modal = document.querySelector('#serviceModal');
const editModal = document.querySelector('#editServiceModal');
const badgeCounter = document.querySelector('#totalServicesBadge');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function handleFileUpload(fileInput, hiddenInput, previewImg, previewUrlEl, previewNameEl) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (previewImg) previewImg.src = dataUrl;
    if (previewNameEl) previewNameEl.textContent = file.name;
    if (previewUrlEl) previewUrlEl.textContent = 'Enviando...';
  };
  reader.readAsDataURL(file);

  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        if (hiddenInput) hiddenInput.value = data.url;
        if (previewImg) previewImg.src = data.url;
        if (previewUrlEl) previewUrlEl.textContent = data.url;
        showToast('Foto enviada com sucesso!');
        return;
      }
    }
  } catch (err) {
    console.error('Upload via servidor falhou, fallback ativado:', err);
  }

  reader.onloadend = () => {
    const dataUrl = reader.result;
    if (hiddenInput) hiddenInput.value = dataUrl;
    if (previewImg) previewImg.src = dataUrl;
    if (previewUrlEl) previewUrlEl.textContent = 'Carregada localmente';
    showToast('Foto carregada com sucesso!');
  };
}

function openEditModal(id) {
  const service = services.find(s => s.id === id);
  if (!service) return;

  document.querySelector('#editServiceId').value = service.id;
  document.querySelector('#editServiceName').value = service.name || '';
  document.querySelector('#editServiceDescription').value = service.description || '';
  document.querySelector('#editServiceRate').value = service.rate || 120;
  document.querySelector('#editServiceEstTime').value = service.estTime || '2.5h';
  document.querySelector('#editServiceBedrooms').value = service.bedrooms || 1;
  document.querySelector('#editServiceBathrooms').value = service.bathrooms || 1;
  document.querySelector('#editServiceLivingRooms').value = service.livingRooms || 1;
  document.querySelector('#editServiceSqm').value = service.sqm || 45;

  const imgSrc = service.image || '';
  const imgInput = document.querySelector('#editServiceImage');
  if (imgInput) imgInput.value = imgSrc;

  const editPreviewImg = document.querySelector('#editServiceImgPreview');
  if (editPreviewImg) editPreviewImg.src = imgSrc;
  const editPreviewUrl = document.querySelector('#editServiceImgPreviewUrl');
  if (editPreviewUrl) editPreviewUrl.textContent = imgSrc;

  if (editModal) editModal.classList.add('open');
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
          <img src="${s.image || ''}" alt="${s.name}" style="width:36px;height:36px;border-radius:10px;object-fit:cover;flex:none;">
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
        <span class="professional-status ${s.active ? 'active' : 'inactive'}">
          <i data-lucide="${s.active ? 'check' : 'eye-off'}"></i>${s.active ? (window.i18n ? window.i18n.t('services.active') : 'Ativo') : (window.i18n ? window.i18n.t('services.disabled') : 'Desativado')}
        </span>
      </td>
      <td>
        <div class="action-menu">
          <button class="more professional-more" data-menu="${s.id}" aria-label="Mais opções">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="action-dropdown" id="menu-${s.id}">
            <button data-action="edit" data-id="${s.id}">
              <i data-lucide="pencil"></i>
              ${window.i18n ? window.i18n.t('services.editInfo') : 'Editar informações'}
            </button>
            <button data-action="toggle" data-id="${s.id}">
              <i data-lucide="${s.active ? 'eye-off' : 'eye'}"></i>
              ${s.active ? (window.i18n ? window.i18n.t('services.toggleOff') : 'Desativar (Ocultar)') : (window.i18n ? window.i18n.t('services.toggleOn') : 'Ativar (Exibir)')}
            </button>
          </div>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="7" class="empty-row">${window.i18n ? window.i18n.t('services.empty') : 'Nenhum serviço encontrado.'}</td></tr>`;

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('.professional-more').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
      const targetMenu = document.querySelector('#menu-' + btn.dataset.menu);
      if (targetMenu) targetMenu.classList.toggle('open');
    };
  });

  document.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
      openEditModal(btn.dataset.id);
    };
  });

  document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      toggleStatus(btn.dataset.id);
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

const closeEditModalBtn = document.querySelector('#closeEditModal');
if (closeEditModalBtn) closeEditModalBtn.onclick = () => editModal.classList.remove('open');

if (editModal) {
  editModal.onclick = e => {
    if (e.target === editModal) editModal.classList.remove('open');
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

const editForm = document.querySelector('#editServiceForm');
if (editForm) {
  editForm.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(editForm);
    const payload = {
      action: 'update',
      id: formData.get('id'),
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
      editForm.reset();
      if (editModal) editModal.classList.remove('open');
      services = await res.json();
      render();
      showToast('Informações do serviço atualizadas com sucesso!');
    }
  };
}

document.addEventListener('click', () => {
  document.querySelectorAll('.action-dropdown.open').forEach(x => x.classList.remove('open'));
});

const newFileInput = document.querySelector('#newServiceFileInput');
const newHiddenInput = document.querySelector('#newServiceImage');
const newPreview = document.querySelector('#newServiceImgPreview');
const newPreviewUrl = document.querySelector('#newServiceImgPreviewUrl');
const newPreviewName = document.querySelector('#newServiceImgPreviewName');

if (newFileInput) {
  newFileInput.onchange = () => handleFileUpload(newFileInput, newHiddenInput, newPreview, newPreviewUrl, newPreviewName);
}

const editFileInput = document.querySelector('#editServiceFileInput');
const editHiddenInput = document.querySelector('#editServiceImage');
const editPreview = document.querySelector('#editServiceImgPreview');
const editPreviewUrl = document.querySelector('#editServiceImgPreviewUrl');
const editPreviewName = document.querySelector('#editServiceImgPreviewName');

if (editFileInput) {
  editFileInput.onchange = () => handleFileUpload(editFileInput, editHiddenInput, editPreview, editPreviewUrl, editPreviewName);
}

const reportsMenuBtn = document.querySelector('#reportsMenuBtn');
const reportsNavGroup = document.querySelector('#reportsNavGroup');
if (reportsMenuBtn && reportsNavGroup) {
  reportsMenuBtn.onclick = (e) => {
    e.preventDefault();
    reportsNavGroup.classList.toggle('open');
  };
}

load();
