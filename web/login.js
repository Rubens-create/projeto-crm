const requestedRole = new URLSearchParams(window.location.search).get('role');
const form = document.querySelector('#loginForm');
const error = document.querySelector('#loginError');

if (requestedRole === 'admin') {
  document.querySelector('#loginHint').textContent = 'Entre com sua conta administrativa.';
} else if (requestedRole === 'provider') {
  document.querySelector('#loginHint').textContent = 'Entre com sua conta de prestador.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      error.textContent = 'E-mail ou senha inválidos.';
      return;
    }
    const user = await response.json();
    if (requestedRole === 'admin' && user.role !== 'ADMIN') {
      error.textContent = 'Esta conta não possui acesso administrativo.';
      await fetch('/api/auth/logout', { method: 'POST' });
      return;
    }
    if (requestedRole === 'provider' && user.role !== 'PRESTADOR') {
      error.textContent = 'Esta conta não possui acesso à área do prestador.';
      await fetch('/api/auth/logout', { method: 'POST' });
      return;
    }
    window.location.assign(user.role === 'ADMIN' ? '/admin/servicos' : '/prestador');
  } catch (_) {
    error.textContent = 'Não foi possível entrar. Tente novamente.';
  }
});
