const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

let clients = [];
let currentFilter = 'all';
const body = document.querySelector('#clientsBody');
const modal = document.querySelector('#clientModal');
const toast = document.querySelector('#toast');

function showToast(message) {
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
    body.innerHTML = '<tr><td colspan="6" class="empty-row">Não foi possível carregar os clientes.</td></tr>';
    showToast(error.message);
  }
}

function render() {
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
    return `<tr>
      <td><div class="professional-cell"><div class="client-card-icon"><i data-lucide="building"></i></div><div><strong>${escapeHtml(client.name)}</strong><small>ID: ${escapeHtml(client.id)}</small></div></div></td>
      <td><strong>${escapeHtml(client.email || 'Sem e-mail')}</strong><small>${escapeHtml(client.phone || 'Sem telefone')}</small></td>
      <td>${propertyList}<small>${client.properties || 0} imóvel(is)</small></td>
      <td><strong>${money(client.monthlySpend || 0)}/mês</strong></td>
      <td><span class="professional-status ${client.status === 'Ativo' ? 'active' : 'inactive'}"><i data-lucide="${client.status === 'Ativo' ? 'check' : 'pause'}"></i>${escapeHtml(client.status || 'Ativo')}</span></td>
      <td><button class="more client-details" data-id="${escapeHtml(client.id)}" aria-label="Ver detalhes"><i data-lucide="eye"></i></button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-row">Nenhum cliente encontrado.</td></tr>';

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll('.client-details').forEach(button => button.onclick = () => {
    const client = clients.find(item => item.id === button.dataset.id);
    const names = (client?.propertyItems || []).map(property => property.name).join(', ') || 'nenhum imóvel vinculado';
    showToast(`${client.name}: ${names}`);
  });
}

document.querySelectorAll('.filter').forEach(button => button.onclick = () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  render();
});
document.querySelector('#newClient').onclick = () => modal.classList.add('open');
document.querySelector('#closeModal').onclick = () => modal.classList.remove('open');
modal.onclick = event => { if (event.target === modal) modal.classList.remove('open'); };

document.querySelector('#clientForm').onsubmit = async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  try {
    const response = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone }) });
    if (!response.ok) throw new Error('Não foi possível cadastrar o cliente.');
    clients = await response.json();
    event.target.reset();
    modal.classList.remove('open');
    render();
    showToast(`Cliente ${data.name} cadastrado. Vincule imóveis pela seção Imóveis.`);
  } catch (error) {
    showToast(error.message);
  }
};

document.querySelector('#reportsMenuBtn').onclick = event => { event.preventDefault(); document.querySelector('#reportsNavGroup').classList.toggle('open'); };
fetchClients();
