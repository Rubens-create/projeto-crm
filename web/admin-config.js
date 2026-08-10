const toast = document.querySelector('#toast');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    const activeFilter = document.querySelector('.filter.active');
    if (activeFilter) activeFilter.classList.remove('active');
    btn.classList.add('active');

    const targetTab = btn.dataset.tab;
    const tabMap = {
      general: 'tabGeneral',
      app: 'tabApp',
      db: 'tabDb'
    };

    document.querySelectorAll('.config-tab-section').forEach(sec => {
      sec.style.display = 'none';
    });

    const activeSec = document.querySelector(`#${tabMap[targetTab]}`);
    if (activeSec) activeSec.style.display = 'block';

    if (window.lucide) lucide.createIcons();
  };
});

const saveBtn = document.querySelector('#saveConfigBtn');
const form = document.querySelector('#configForm');

if (saveBtn) {
  saveBtn.onclick = () => {
    if (form) form.requestSubmit();
  };
}

if (form) {
  form.onsubmit = e => {
    e.preventDefault();
    showToast('Preferências salvas com sucesso no sistema!');
  };
}

const reportsMenuBtn = document.querySelector('#reportsMenuBtn');
const reportsNavGroup = document.querySelector('#reportsNavGroup');
if (reportsMenuBtn && reportsNavGroup) {
  reportsMenuBtn.onclick = (e) => {
    e.preventDefault();
    reportsNavGroup.classList.toggle('open');
  };
}
