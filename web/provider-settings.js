const languageSelect = document.querySelector('#providerLanguageSelect');
const passwordForm = document.querySelector('#changePasswordForm');
const message = document.querySelector('#changePasswordMessage');

if (languageSelect && window.i18n) {
  languageSelect.value = window.i18n.getCurrentLanguage();
  languageSelect.onchange = () => window.i18n.setLanguage(languageSelect.value);
}

passwordForm?.addEventListener('submit', async event => {
  event.preventDefault();
  message.textContent = '';
  const data = Object.fromEntries(new FormData(passwordForm));
  if (data.newPassword !== data.passwordConfirmation) {
    message.textContent = window.i18n?.text('As senhas não conferem.') || 'As senhas não conferem.';
    return;
  }
  const submit = passwordForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  try {
    const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Não foi possível alterar a senha.');
    passwordForm.reset();
    message.className = 'form-message success-message';
    message.textContent = window.i18n?.text('Sua senha foi atualizada com sucesso.') || 'Sua senha foi atualizada com sucesso.';
  } catch (error) {
    message.className = 'form-message';
    message.textContent = window.i18n?.translateText(error.message) || error.message;
  } finally {
    submit.disabled = false;
  }
});
