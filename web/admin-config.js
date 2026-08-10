const systemConfigForm = document.querySelector('#systemConfigForm');
const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

if (systemConfigForm) {
  systemConfigForm.onsubmit = (e) => {
    e.preventDefault();
    showToast('Configurações salvas com sucesso!');
  };
}
