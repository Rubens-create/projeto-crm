const toast = document.querySelector('#toast');
const langSelect = document.querySelector('#systemLanguageSelect');

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

async function loadConfig() {
  try {
    const res = await fetch('/api/admin/config');
    if (res.ok) {
      const cfg = await res.json();
      const form = document.querySelector('#configForm');
      if (form) {
        if (form.companyName) form.companyName.value = cfg.companyName || '';
        if (form.cnpj) form.cnpj.value = cfg.cnpj || '';
        if (form.email) form.email.value = cfg.email || '';
        if (form.phone) form.phone.value = cfg.phone || '';
        if (form.currency) form.currency.value = cfg.currency || 'BRL';
        if (form.defaultRate) form.defaultRate.value = cfg.defaultRate || 120.00;
        if (langSelect && cfg.language) {
          langSelect.value = cfg.language;
          if (window.i18n) window.i18n.setLanguage(cfg.language);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao carregar configurações:', err);
  }
}

if (langSelect && window.i18n) {
  langSelect.value = window.i18n.getCurrentLanguage();
  langSelect.onchange = () => {
    window.i18n.setLanguage(langSelect.value);
    showToast(window.i18n.t('config.toastSave'));
  };
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
  form.onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.defaultRate = Number(data.defaultRate) || 120.00;
    data.language = langSelect ? langSelect.value : (window.i18n ? window.i18n.getCurrentLanguage() : 'pt');

    if (langSelect && window.i18n) {
      window.i18n.setLanguage(data.language);
    }

    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const msg = window.i18n ? window.i18n.t('config.toastSave') : 'Preferências salvas com sucesso no banco de dados!';
      showToast(msg);
    } catch (err) {
      showToast('Erro ao salvar no banco de dados');
    }
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

loadConfig();
