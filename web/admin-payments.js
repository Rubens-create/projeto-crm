const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

document.querySelectorAll('.pay-btn').forEach(btn => {
  btn.onclick = () => {
    const name = btn.dataset.name;
    const tr = btn.closest('tr');
    if (tr) {
      const statusTd = tr.querySelector('.status');
      if (statusTd) {
        statusTd.className = 'status done';
        statusTd.textContent = 'Pago';
      }
      btn.disabled = true;
      btn.className = 'action-mini-btn disabled';
      btn.textContent = 'Concluído';
    }
    showToast(`Repasse para ${name} efetuado com sucesso!`);
  };
});
