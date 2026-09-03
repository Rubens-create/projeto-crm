const form = document.querySelector('#initialSetupForm');
const error = document.querySelector('#setupError');

form?.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  if (data.password !== data.passwordConfirmation) {
    error.textContent = 'As senhas não conferem.';
    return;
  }
  try {
    const response = await fetch('/api/auth/setup-superuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.status === 409) {
      error.textContent = 'A configuração inicial já foi concluída.';
      return;
    }
    if (!response.ok) {
      error.textContent = 'Não foi possível criar o superusuário.';
      return;
    }
    window.location.assign('/login?role=admin&created=1');
  } catch (_) {
    error.textContent = 'Não foi possível conectar ao servidor.';
  }
});
