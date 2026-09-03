const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

let professionals = [];
let properties = [];
let currentFilter = 'all';

const body = document.querySelector('#professionalsBody');
const modal = document.querySelector('#professionalModal');
const manualHoursModal = document.querySelector('#manualHoursModal');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

async function fetchProfessionals() {
  try {
    const res = await fetch('/api/admin/professionals');
    if (!res.ok) throw new Error('Falha ao carregar profissionais.');
    professionals = await res.json();
    render();
  } catch (err) {
    console.error('Erro ao buscar profissionais:', err);
    showToast(err.message);
  }
}

async function fetchProperties() {
  try {
    const res = await fetch('/api/admin/properties');
    if (!res.ok) throw new Error('Falha ao carregar imóveis.');
    properties = await res.json();
  } catch (err) {
    console.error('Erro ao buscar imóveis:', err);
    showToast('Não foi possível carregar os imóveis para lançamento de horas.');
  }
}

function render() {
  if (!body || !document.body.contains(body)) return;
  const filtered = professionals.filter(p => currentFilter === 'all' || (currentFilter === 'active' ? p.active : !p.active));
  document.querySelector('#totalProfessionals').textContent = professionals.length;
  document.querySelector('#activeProfessionals').textContent = professionals.filter(p => p.active).length;
  document.querySelector('#totalProfessionalHours').textContent = professionals.reduce((total, p) => total + (p.hours || 0), 0).toFixed(1).replace('.', ',') + 'h';
  document.querySelector('#totalProfessionalEarned').textContent = money(professionals.reduce((total, p) => total + (p.earned || 0), 0));

  body.innerHTML = filtered.map(p => `<tr>
    <td><div class="professional-cell"><span class="professional-avatar">${escapeHtml((p.name || 'P').split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join(''))}</span><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.email)}<br>${escapeHtml(p.phone || 'Telefone não informado')}</small></div></div></td>
    <td><span class="specialty"><i data-lucide="briefcase-business"></i>${escapeHtml(p.specialty || 'Limpeza')}</span></td>
    <td><strong>${(p.hours || 0).toFixed(1).replace('.', ',')}h</strong></td>
    <td><strong>${money(p.earned || 0)}</strong></td>
    <td><span class="professional-status ${p.active ? 'active' : 'inactive'}"><i data-lucide="${p.active ? 'check' : 'pause'}"></i>${p.active ? 'Ativo' : 'Desativado'}</span></td>
    <td><div class="action-menu"><button class="more professional-more" data-menu="${escapeHtml(p.id)}" aria-label="Mais opções"><i data-lucide="more-horizontal"></i></button><div class="action-dropdown" id="menu-${escapeHtml(p.id)}"><button data-action="hours" data-id="${escapeHtml(p.id)}"><i data-lucide="clock-plus"></i>Adicionar horas</button><button data-action="edit" data-id="${escapeHtml(p.id)}"><i data-lucide="pencil"></i>Editar</button><button data-action="toggle" data-id="${escapeHtml(p.id)}"><i data-lucide="${p.active ? 'user-round-minus' : 'user-round-check'}"></i>${p.active ? 'Desativar' : 'Ativar'}</button></div></div></td>
  </tr>`).join('') || '<tr><td colspan="6" class="empty-row">Nenhum profissional encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll('.professional-more').forEach(button => {
    button.onclick = event => {
      event.stopPropagation();
      document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open'));
      document.querySelector(`#menu-${CSS.escape(button.dataset.menu)}`)?.classList.toggle('open');
    };
  });
  document.querySelectorAll('[data-action="hours"]').forEach(button => button.onclick = event => { event.stopPropagation(); openManualHours(button.dataset.id); });
  document.querySelectorAll('[data-action="toggle"]').forEach(button => button.onclick = event => { event.stopPropagation(); toggleStatus(button.dataset.id); });
  document.querySelectorAll('[data-action="edit"]').forEach(button => button.onclick = event => {
    event.stopPropagation();
    const professional = professionals.find(item => item.id === button.dataset.id);
    if (professional) openProfessionalEditor(professional);
  });
}

function openProfessionalEditor(professional) {
  document.querySelector('#professionalForm').reset();
  document.querySelector('#professionalId').value = professional.id;
  document.querySelector('#professionalModalTitle').textContent = 'Editar profissional';
  document.querySelector('#professionalModalSubtitle').textContent = 'Atualize os dados de contato e especialidade do prestador.';
  document.querySelector('#professionalForm [name="name"]').value = professional.name || '';
  document.querySelector('#professionalForm [name="email"]').value = professional.email || '';
  document.querySelector('#professionalForm [name="phone"]').value = professional.phone || '';
  document.querySelector('#professionalForm [name="specialty"]').value = professional.specialty || '';
  document.querySelector('#professionalSubmit').innerHTML = '<i data-lucide="save"></i> Salvar alterações';
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

function setManualDefaults() {
  const now = new Date();
  document.querySelector('#manualDate').value = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  document.querySelector('#manualStartTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function populateManualProperties() {
  const activeProperties = properties.filter(property => property.status === 'ATIVO' && (property.services || []).some(service => service.active));
  document.querySelector('#manualProperty').innerHTML = '<option value="">Selecione o imóvel</option>' + activeProperties.map(property => `<option value="${escapeHtml(property.id)}">${escapeHtml(property.name)}${property.clientName ? ` · ${escapeHtml(property.clientName)}` : ''}</option>`).join('');
}

function updateManualServices() {
  const property = properties.find(item => item.id === document.querySelector('#manualProperty').value);
  const services = (property?.services || []).filter(service => service.active);
  const select = document.querySelector('#manualService');
  select.disabled = !services.length;
  select.innerHTML = services.length ? '<option value="">Selecione o serviço</option>' + services.map(service => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.description || 'Serviço de limpeza')} · ${money(service.rate)}/h</option>`).join('') : '<option value="">Nenhum serviço ativo neste imóvel</option>';
  if (services.length === 1) select.value = services[0].id;
  updateManualEstimate();
}

function selectedManualService() {
  const property = properties.find(item => item.id === document.querySelector('#manualProperty').value);
  return (property?.services || []).find(service => service.id === document.querySelector('#manualService').value);
}

function updateManualEstimate() {
  const rate = Number(selectedManualService()?.rate) || 0;
  const hours = Number(document.querySelector('#manualHours').value) || 0;
  document.querySelector('#manualRate').textContent = `${money(rate)}/h`;
  document.querySelector('#manualTotal').textContent = money(rate * hours);
}

function openManualHours(id) {
  const professional = professionals.find(item => item.id === id);
  if (!professional) return;
  document.querySelector('#manualHoursForm').reset();
  document.querySelector('#manualProfessionalId').value = professional.id;
  document.querySelector('#manualProfessionalName').textContent = professional.name;
  document.querySelector('#manualProfessionalSpecialty').textContent = professional.specialty || 'Prestador cadastrado';
  document.querySelector('#manualProfessionalInitials').textContent = (professional.name || 'P').split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('');
  populateManualProperties();
  updateManualServices();
  setManualDefaults();
  updateManualEstimate();
  manualHoursModal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

async function toggleStatus(id) {
  const professional = professionals.find(item => item.id === id);
  if (!professional) return;
  await fetch('/api/admin/professionals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id }) });
  await fetchProfessionals();
  showToast(`Status de ${professional.name} alterado.`);
}

document.querySelectorAll('.filter').forEach(button => button.onclick = () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  render();
});

document.querySelector('#newProfessional').onclick = () => {
  document.querySelector('#professionalForm').reset();
  document.querySelector('#professionalId').value = '';
  document.querySelector('#professionalModalTitle').textContent = 'Novo profissional';
  document.querySelector('#professionalModalSubtitle').textContent = 'Cadastre um prestador de serviço para acesso à plataforma.';
  document.querySelector('#professionalSubmit').innerHTML = '<i data-lucide="user-plus"></i> Cadastrar profissional';
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
};
document.querySelector('#closeModal').onclick = () => modal.classList.remove('open');
modal.onclick = event => { if (event.target === modal) modal.classList.remove('open'); };
document.querySelector('#closeManualHoursModal').onclick = () => manualHoursModal.classList.remove('open');
manualHoursModal.onclick = event => { if (event.target === manualHoursModal) manualHoursModal.classList.remove('open'); };
document.querySelector('#manualProperty').onchange = updateManualServices;
document.querySelector('#manualService').onchange = updateManualEstimate;
document.querySelector('#manualHours').oninput = updateManualEstimate;

document.querySelector('#professionalForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const editing = Boolean(data.id);
  const response = await fetch('/api/admin/professionals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: editing ? 'update' : 'create', id: data.id, name: data.name, email: data.email, phone: data.phone, specialty: data.specialty }) });
  if (!response.ok) return showToast(editing ? 'Não foi possível atualizar o profissional.' : 'Não foi possível cadastrar o profissional.');
  event.target.reset();
  modal.classList.remove('open');
  await fetchProfessionals();
  showToast(editing ? `Dados de ${data.name} atualizados.` : `Profissional ${data.name} cadastrado.`);
};

document.querySelector('#manualHoursForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const submit = event.target.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const response = await fetch('/api/admin/executions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ professionalId: data.professionalId, serviceId: data.serviceId, date: data.date, startTime: data.startTime, hours: Number(data.hours), notes: data.notes }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não foi possível adicionar as horas.');
    manualHoursModal.classList.remove('open');
    await fetchProfessionals();
    showToast(`${Number(data.hours).toFixed(2).replace('.', ',')}h adicionadas para ${result.professionalName}. Valor: ${money(result.totalValueCents / 100)}.`);
  } catch (error) {
    showToast(error.message);
  } finally {
    submit.disabled = false;
  }
};

document.addEventListener('click', () => document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open')));
document.querySelector('#reportsMenuBtn').onclick = event => { event.preventDefault(); document.querySelector('#reportsNavGroup').classList.toggle('open'); };

Promise.all([fetchProfessionals(), fetchProperties()]);
