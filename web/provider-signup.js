const form = document.querySelector('#providerSignupForm');
const error = document.querySelector('#signupError');
const submit = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const data = Object.fromEntries(new FormData(form));
  if (data.password !== data.passwordConfirmation) {
    error.textContent = 'As senhas não conferem.';
    return;
  }
  submit.disabled = true;
  submit.classList.add('is-loading');
  try {
    const response = await fetch('/api/auth/provider-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      error.textContent = response.status === 409
        ? 'Este e-mail já está cadastrado. Tente entrar.'
        : payload.error === 'invalid signup data'
          ? 'Confira os campos e use uma senha com pelo menos 8 caracteres.'
          : 'Não foi possível criar sua conta. Tente novamente.';
      return;
    }
    window.location.assign('/login?role=provider&created=1');
  } catch (_) {
    error.textContent = 'Não foi possível conectar à Zygg. Tente novamente.';
  } finally {
    submit.disabled = false;
    submit.classList.remove('is-loading');
  }
});
