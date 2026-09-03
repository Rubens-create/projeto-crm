const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

let clients = [];
let currentFilter = 'all';
const body = document.querySelector('#clientsBody');
const modal = document.querySelector('#clientModal');
const toast = document.querySelector('#toast');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

async function fetchClients() {
  try {
    const response = await fetch('/api/admin/clients');
    if (!response.ok) throw new Error('Falha ao carregar clientes.');
    clients = await response.json();
    render();
  } catch (error) {
    if (body && document.body.contains(body)) body.innerHTML = '<tr><td colspan="6" class="empty-row">Não foi possível carregar os clientes.</td></tr>';
    showToast(error.message);
  }
}

function render() {
  if (!body || !document.body.contains(body)) return;
  const filtered = clients.filter(client => currentFilter === 'all' || (currentFilter === 'active' ? client.status === 'Ativo' : client.status !== 'Ativo'));
  document.querySelector('#totalClients').textContent = clients.length;
  document.querySelector('#activeClients').textContent = clients.filter(client => client.status === 'Ativo').length;
  document.querySelector('#totalProperties').textContent = clients.reduce((total, client) => total + (client.properties || 0), 0);
  document.querySelector('#totalClientRevenue').textContent = money(clients.reduce((total, client) => total + (client.monthlySpend || 0), 0));

  body.innerHTML = filtered.map(client => {
    const propertyItems = client.propertyItems || [];
    const propertyList = propertyItems.length
      ? `<div class="client-property-list">${propertyItems.map(property => `<a href="/admin/imoveis" title="Abrir gestão de imóveis"><i data-lucide="house"></i>${escapeHtml(property.name)}</a>`).join('')}</div>`
      : '<span class="property-unlinked">Nenhum imóvel vinculado</span>';
    const active = client.status === 'Ativo';
    return `<tr>
      <td><div class="professional-cell"><div class="client-card-icon"><i data-lucide="building"></i></div><div><strong>${escapeHtml(client.name)}</strong><small>ID: ${escapeHtml(client.id)}</small></div></div></td>
      <td><strong>${escapeHtml(client.email || 'Sem e-mail')}</strong><small>${escapeHtml(client.phone || 'Sem telefone')}</small></td>
      <td>${propertyList}<small>${client.properties || 0} imóvel(is)</small></td>
      <td><strong>${money(client.monthlySpend || 0)}/mês</strong></td>
      <td><span class="professional-status ${active ? 'active' : 'inactive'}"><i data-lucide="${active ? 'check' : 'pause'}"></i>${escapeHtml(client.status || 'Ativo')}</span></td>
      <td><div class="action-menu"><button class="more client-more" data-menu="${escapeHtml(client.id)}" aria-label="Mais opções"><i data-lucide="more-horizontal"></i></button><div class="action-dropdown" id="client-menu-${escapeHtml(client.id)}"><button data-action="edit" data-id="${escapeHtml(client.id)}"><i data-lucide="pencil"></i>Editar</button><button data-action="toggle" data-id="${escapeHtml(client.id)}"><i data-lucide="${active ? 'user-round-minus' : 'user-round-check'}"></i>${active ? 'Desativar' : 'Ativar'}</button></div></div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-row">Nenhum cliente encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll('.client-more').forEach(button => button.onclick = event => {
    event.stopPropagation();
    document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open'));
    document.querySelector(`#client-menu-${CSS.escape(button.dataset.menu)}`)?.classList.toggle('open');
  });
  document.querySelectorAll('[data-action="edit"]').forEach(button => button.onclick = event => {
    event.stopPropagation();
    const client = clients.find(item => item.id === button.dataset.id);
    if (client) openClientEditor(client);
  });
  document.querySelectorAll('[data-action="toggle"]').forEach(button => button.onclick = event => {
    event.stopPropagation();
    toggleClient(button.dataset.id);
  });
}

function openClientEditor(client) {
  document.querySelector('#clientForm').reset();
  document.querySelector('#clientId').value = client.id;
  document.querySelector('#clientModalTitle').textContent = 'Editar cliente';
  document.querySelector('#clientModalSubtitle').textContent = 'Atualize os dados de contato. Os imóveis vinculados permanecem inalterados.';
  document.querySelector('#clientForm [name="name"]').value = client.name || '';
  document.querySelector('#clientForm [name="email"]').value = client.email || '';
  document.querySelector('#clientForm [name="phone"]').value = client.phone || '';
  document.querySelector('#clientSubmit').innerHTML = '<i data-lucide="save"></i> Salvar alterações';
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
}

async function toggleClient(id) {
  const client = clients.find(item => item.id === id);
  if (!client) return;
  try {
    const response = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle', id }) });
    if (!response.ok) throw new Error('Não foi possível alterar o status do cliente.');
    await fetchClients();
    showToast(`${client.name} foi ${client.status === 'Ativo' ? 'desativado' : 'ativado'}.`);
  } catch (error) {
    showToast(error.message);
  }
}

document.querySelectorAll('.filter').forEach(button => button.onclick = () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  render();
});
document.querySelector('#newClient').onclick = () => {
  document.querySelector('#clientForm').reset();
  document.querySelector('#clientId').value = '';
  document.querySelector('#clientModalTitle').textContent = 'Novo cliente';
  document.querySelector('#clientModalSubtitle').textContent = 'Cadastre o cliente. Os imóveis são gerenciados na seção Imóveis.';
  document.querySelector('#clientSubmit').innerHTML = '<i data-lucide="building-2"></i> Cadastrar proprietário';
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
};
document.querySelector('#closeModal').onclick = () => modal.classList.remove('open');
modal.onclick = event => { if (event.target === modal) modal.classList.remove('open'); };

document.querySelector('#clientForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const editing = Boolean(data.id);
  try {
    const response = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: editing ? 'update' : 'create', id: data.id, name: data.name, email: data.email, phone: data.phone }) });
    if (!response.ok) throw new Error(editing ? 'Não foi possível atualizar o cliente.' : 'Não foi possível cadastrar o cliente.');
    event.target.reset();
    modal.classList.remove('open');
    await fetchClients();
    showToast(editing ? `Dados de ${data.name} atualizados.` : `Cliente ${data.name} cadastrado. Vincule imóveis pela seção Imóveis.`);
  } catch (error) {
    showToast(error.message);
  }
};

document.addEventListener('click', () => document.querySelectorAll('.action-dropdown.open').forEach(menu => menu.classList.remove('open')));
document.querySelector('#reportsMenuBtn').onclick = event => { event.preventDefault(); document.querySelector('#reportsNavGroup').classList.toggle('open'); };
fetchClients();
