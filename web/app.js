const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
const initials = name => name.split(' ').map(part => part[0]).slice(0, 2).join('');

const mobileMenu = document.querySelector('#mobileMenu');
const sidebar = document.querySelector('#sidebar');
if (mobileMenu && sidebar) {
  mobileMenu.onclick = () => sidebar.classList.toggle('open');
}

async function loadDashboard() {
  try {
    const response = await fetch('/api/dashboard');
    if (!response.ok) throw new Error('Falha ao carregar');
    const data = await response.json();

    const tbody = document.querySelector('#servicesBody');
    if (tbody) {
      tbody.innerHTML = data.services.map(service => `
        <tr>
          <td>
            <strong>${service.client}</strong>
            <small class="service-name">${service.service}</small>
          </td>
          <td>
            <span class="person">
              <span class="mini-avatar">${initials(service.professional)}</span>
              ${service.professional}
            </span>
          </td>
          <td>${service.hours}h</td>
          <td><strong>${money(service.hours * service.rate)}</strong></td>
          <td>
            <span class="status ${service.status === 'Concluído' ? 'done' : service.status === 'Aguardando' ? 'wait' : 'progress'}">
              ${service.status}
            </span>
          </td>
        </tr>
      `).join('');
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Erro no dashboard:', err);
    const tbody = document.querySelector('#servicesBody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5">Não foi possível carregar os serviços do PostgreSQL.</td></tr>';
    }
  }
}

loadDashboard();
