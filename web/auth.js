function showZyggNotice({ title, message = '', details = [] }) {
  document.querySelector('#zyggNotice')?.remove();
  const backdrop = document.createElement('div');
  backdrop.id = 'zyggNotice';
  backdrop.className = 'zygg-notice-backdrop';

  const card = document.createElement('section');
  card.className = 'zygg-notice-card';
  const icon = document.createElement('span');
  icon.className = 'zygg-notice-icon';
  icon.innerHTML = '<i data-lucide="check"></i>';
  const heading = document.createElement('h2');
  heading.textContent = title;
  const copy = document.createElement('p');
  copy.textContent = message;
  const list = document.createElement('dl');
  list.className = 'zygg-notice-details';
  details.forEach(({ label, value }) => {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.textContent = value;
    list.append(term, description);
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'primary';
  close.textContent = 'Continuar';
  close.addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.remove(); });
  card.append(icon, heading, copy, list, close);
  backdrop.append(card);
  document.body.append(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  if (window.lucide) lucide.createIcons();
}

window.zyggNotify = showZyggNotice;

async function loadSessionState() {
  try {
    const response = await fetch('/api/auth/session');
    if (!response.ok) return;
    const user = await response.json();
    const target = document.querySelector('.provider-user') || document.querySelector('.profile');
    if (!target) return;

    const logout = document.createElement('button');
    logout.type = 'button';
    logout.className = 'more';
    logout.title = 'Sair';
    logout.innerHTML = '<i data-lucide="log-out"></i>';
    logout.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.assign('/login');
    });
    target.append(logout);

    if (window.lucide) lucide.createIcons();
  } catch (_) {
    // The server already protects private pages; avoid exposing session details in the UI.
  }
}

document.addEventListener('DOMContentLoaded', loadSessionState);
