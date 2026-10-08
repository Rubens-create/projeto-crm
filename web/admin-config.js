const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
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
      achievements: 'tabAchievements',
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

async function loadAchievements() {
  const list = document.querySelector('#adminAchievementsList');
  if (!list) return;
  const response = await fetch('/api/admin/achievements');
  if (!response.ok) { list.innerHTML = '<small>Não foi possível carregar as conquistas.</small>'; return; }
  const achievements = await response.json();
  list.innerHTML = achievements.length ? achievements.map(a => `<div class="admin-achievement-row"><div><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.description)} · ${a.metric === 'GANHOS' ? 'Ganhos' : 'Horas'}: ${a.target}</small></div><button type="button" class="icon-btn danger" data-achievement-delete="${escapeHtml(a.id)}" aria-label="Excluir conquista"><i data-lucide="trash-2"></i></button></div>`).join('') : '<small>Nenhuma conquista cadastrada.</small>';
  list.querySelectorAll('[data-achievement-delete]').forEach(button => button.onclick = async () => {
    const response = await fetch(`/api/admin/achievements/${button.dataset.achievementDelete}`, { method: 'DELETE' });
    if (response.ok) loadAchievements();
  });
  if (window.lucide) lucide.createIcons();
}

const iconPickerModal = document.querySelector('#iconPickerModal');
const iconPickerGrid = document.querySelector('#iconPickerGrid');
const iconPickerButton = document.querySelector('#achievementIconPickerBtn');
const iconPickerClose = document.querySelector('#iconPickerCloseBtn');
const achievementIconInput = document.querySelector('#achievementIcon');
const achievementIcons = [
  ['trophy', 'Troféu'], ['award', 'Medalha'], ['star', 'Estrela'], ['crown', 'Coroa'],
  ['clock-3', 'Horas'], ['timer', 'Cronômetro'], ['flame', 'Foco'], ['zap', 'Energia'],
  ['wallet', 'Ganhos'], ['badge-dollar-sign', 'Meta financeira'], ['target', 'Objetivo'], ['sparkles', 'Destaque']
];

function closeIconPicker() {
  if (!iconPickerModal) return;
  iconPickerModal.classList.remove('open');
  iconPickerModal.setAttribute('aria-hidden', 'true');
}

if (iconPickerGrid) {
  iconPickerGrid.innerHTML = achievementIcons.map(([name, label]) => `<button type="button" class="icon-picker-option" data-icon-value="${name}" title="${label}"><i data-lucide="${name}"></i><span>${label}</span></button>`).join('');
  iconPickerGrid.querySelectorAll('[data-icon-value]').forEach(option => option.onclick = () => {
    achievementIconInput.value = option.dataset.iconValue;
    iconPickerButton.innerHTML = `<i data-lucide="${option.dataset.iconValue}"></i><span>${option.title}</span>`;
    closeIconPicker();
    if (window.lucide) lucide.createIcons();
  });
}
if (iconPickerButton) iconPickerButton.onclick = () => {
  iconPickerModal.classList.add('open');
  iconPickerModal.setAttribute('aria-hidden', 'false');
  if (window.lucide) lucide.createIcons();
};
if (iconPickerClose) iconPickerClose.onclick = closeIconPicker;
if (iconPickerModal) iconPickerModal.onclick = event => { if (event.target === iconPickerModal) closeIconPicker(); };

document.addEventListener('keydown', event => { if (event.key === 'Escape') closeIconPicker(); });

const createAchievementBtn = document.querySelector('#createAchievementBtn');
if (createAchievementBtn) {
  createAchievementBtn.onclick = async () => {
    const payload = {
      title: document.querySelector('#achievementTitle').value,
      description: document.querySelector('#achievementDescription').value,
      metric: document.querySelector('#achievementMetric').value,
      target: Number(document.querySelector('#achievementTarget').value),
      icon: document.querySelector('#achievementIcon').value,
      color: document.querySelector('#achievementColor').value,
      active: true
    };
    const response = await fetch('/api/admin/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { showToast('Preencha título, descrição e uma meta válida.'); return; }
    ['achievementTitle', 'achievementDescription', 'achievementTarget'].forEach(id => { document.querySelector(`#${id}`).value = ''; });
    showToast('Conquista criada com sucesso.');
    loadAchievements();
  };
}

loadConfig();
loadAchievements();
