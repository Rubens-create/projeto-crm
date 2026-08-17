const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const moneyExact = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

let timerState = { active: false, serviceId: '', elapsedSeconds: 0, startedAt: null };
let tick;
let currentSelectedOption = null;
let allOptions = [];

const display = document.querySelector('#timerDisplay');
const select = document.querySelector('#serviceSelect');
const selectedServiceLabel = document.querySelector('#selectedServiceLabel');
const button = document.querySelector('#timerButton');
const finishButton = document.querySelector('#finishExecutionButton');

let clockSkew = 0;

function elapsedExact() {
  if (!timerState.active) return timerState.elapsedSeconds;
  const now = Date.now() - clockSkew;
  const start = new Date(timerState.startedAt).getTime();
  return timerState.elapsedSeconds + ((now - start) / 1000);
}

function formatTime(seconds) {
  const totalSec = Math.floor(seconds);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  const ms = String(Math.floor((seconds % 1) * 100)).padStart(2, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function updateSelectedServiceLabel() {
  if (!selectedServiceLabel) return;
  const option = allOptions.find(item => item.id === (select.value || timerState.serviceId));
  selectedServiceLabel.textContent = option ? `${option.name} · ${money(option.rate)}/h` : 'Selecione um serviço na aba Serviços';
}

function getSelectedRate() {
  const targetId = select.value || timerState.serviceId;
  const opt = allOptions.find(o => o.id === targetId);
  return opt ? opt.rate : 0;
}

function updateLiveChart(secExact, rate) {
  const container = document.querySelector('#liveEarningsContainer');
  if (!container) return;

  if (timerState.active || secExact > 0) {
    container.classList.add('active');
  } else {
    container.classList.remove('active');
    return;
  }

  const sessionEarned = secExact * (rate / 3600);
  document.querySelector('#liveSessionEarned').textContent = moneyExact(sessionEarned);
  document.querySelector('#liveRateBadge').innerHTML = `<i data-lucide="zap"></i> ${money(rate)}/h`;

  // Desenhar curva dinâmica em tempo real (milissegundos)
  const chartWidth = 300;
  const width = 288;
  const xOffset = 6;
  const height = 70;
  const steps = 12;
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const x = xOffset + (width / steps) * i;
    const tRatio = i / steps;
    const progressRatio = Math.min((secExact * tRatio) / 3600, 1.0);
    const eased = Math.pow(progressRatio, 0.5);
    const y = height - (eased * (height - 15));
    points.push({ x, y });
  }

  const lineD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`;
  }, '');

  const areaD = `${lineD} L${chartWidth},${height} L0,${height} Z`;
  const lastPoint = points[points.length - 1];

  const lineEl = document.querySelector('#chartLine');
  const areaEl = document.querySelector('#chartArea');
  const dotEl = document.querySelector('#chartDot');

  if (lineEl) lineEl.setAttribute('d', lineD);
  if (areaEl) areaEl.setAttribute('d', areaD);
  if (dotEl) {
    dotEl.setAttribute('cx', lastPoint.x);
    dotEl.setAttribute('cy', lastPoint.y);
  }
}

let cachedExecutions = [];

function renderWeeklyChart(executions = cachedExecutions, currentSessionSeconds = 0) {
  const barsContainer = document.querySelector('#weeklyBars');
  if (!barsContainer) return;

  const daysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const dayData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);

    let totalSeconds = 0;
    (executions || []).forEach(ex => {
      if (ex.status !== 'CANCELADO') {
        const exDate = new Date(ex.startedAt);
        if (exDate >= d && exDate < nextD) {
          totalSeconds += (ex.durationSeconds || 0);
        }
      }
    });

    if (i === 0) {
      totalSeconds += currentSessionSeconds;
    }

    const hours = totalSeconds / 3600;
    dayData.push({
      date: d,
      dayLabel: daysShort[d.getDay()],
      isToday: i === 0,
      hours: hours,
      formattedHours: hours > 0 ? (hours >= 1 ? hours.toFixed(1).replace('.0', '') + 'h' : Math.round(hours * 60) + 'm') : '0h'
    });
  }

  const maxHoursRaw = Math.max(...dayData.map(d => d.hours));
  const maxHours = Math.max(Math.ceil(maxHoursRaw) || 1, 4);
  const midHours = (maxHours / 2).toFixed(1).replace('.0', '');

  const yMaxEl = document.querySelector('#chartYMax');
  const yMidEl = document.querySelector('#chartYMid');
  if (yMaxEl) yMaxEl.textContent = `${maxHours}h`;
  if (yMidEl) yMidEl.textContent = `${midHours}h`;

  const totalWeekHours = dayData.reduce((acc, d) => acc + d.hours, 0);
  const badgeEl = document.querySelector('#weeklyTotalHoursBadge');
  if (badgeEl) badgeEl.textContent = `${totalWeekHours.toFixed(1).replace('.0', '')}h`;

  barsContainer.innerHTML = dayData.map(d => {
    const percent = d.hours > 0 ? Math.min(100, Math.max(8, Math.round((d.hours / maxHours) * 100))) : 4;
    return `
      <div class="bar-col ${d.isToday ? 'is-today' : ''}" title="${d.dayLabel} (${d.date.toLocaleDateString('pt-BR')}): ${d.formattedHours}">
        <small class="bar-val">${d.hours > 0 ? d.formattedHours : ''}</small>
        <b style="height: ${percent}%;"></b>
        <small class="bar-label">${d.isToday ? 'Hoje' : d.dayLabel}</small>
      </div>
    `;
  }).join('');
}

let lastRenderedActive = null;

function renderTimer() {
  const secExact = elapsedExact();
  const rate = getSelectedRate();
  display.textContent = formatTime(secExact);
  button.disabled = !timerState.executionId && !select.value;
  if (finishButton) {
    finishButton.hidden = !(timerState.executionId || select.value);
    finishButton.disabled = !timerState.executionId;
  }

  if (lastRenderedActive !== timerState.active) {
    lastRenderedActive = timerState.active;
    button.classList.toggle('running', timerState.active);
    button.setAttribute('aria-label', timerState.active ? 'Parar cronômetro' : 'Iniciar cronômetro');
    button.innerHTML = timerState.active
      ? '<i data-lucide="pause"></i>'
      : '<i data-lucide="play"></i>';
    document.querySelector('#timerStatus').innerHTML = timerState.active
      ? '<i data-lucide="circle-play"></i> Em andamento'
      : '<i data-lucide="pause"></i> Parado';
    if (window.lucide) lucide.createIcons();
  }

  updateLiveChart(secExact, rate);
  if (latestProviderData && timerState.active) {
    calculateAndRenderAchievements(latestProviderData, secExact);
  }
}

function switchTab(tabName) {
  closeServiceModal();
  closeAchievementsModal();
  document.querySelectorAll('.bottom-nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.provider-tab-content').forEach(c => {
    c.classList.remove('active');
  });
  if (tabName === 'timer') {
    document.querySelector('#tabContentTimer').classList.add('active');
  } else if (tabName === 'services') {
    document.querySelector('#tabContentServices').classList.add('active');
  } else if (tabName === 'stats') {
    document.querySelector('#tabContentStats').classList.add('active');
  }
}

function openServiceModal(option) {
  currentSelectedOption = option;
  document.querySelector('#modalImg').src = option.image || '';
  document.querySelector('#modalTitle').textContent = option.name;
  document.querySelector('#modalDesc').textContent = option.description;
  document.querySelector('#modalRate').textContent = money(option.rate);

  if (document.querySelector('#modalBedrooms')) document.querySelector('#modalBedrooms').textContent = option.bedrooms || 1;
  if (document.querySelector('#modalBathrooms')) document.querySelector('#modalBathrooms').textContent = option.bathrooms || 1;
  if (document.querySelector('#modalLivingRooms')) document.querySelector('#modalLivingRooms').textContent = option.livingRooms || 1;
  if (document.querySelector('#modalSqm')) document.querySelector('#modalSqm').textContent = option.sqm || 45;

  document.querySelector('#modalEstTime').innerHTML = `<i data-lucide="clock"></i> ${option.estTime || '2.5h'}`;

  const modal = document.querySelector('#serviceModal');
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  if (window.lucide) lucide.createIcons();
}

function closeServiceModal() {
  const modal = document.querySelector('#serviceModal');
  if (modal) modal.classList.remove('open');
  const achModal = document.querySelector('#achievementsModal');
  if (!achModal || !achModal.classList.contains('open')) {
    document.body.classList.remove('modal-open');
  }
}

function openAchievementsModal() {
  const modal = document.querySelector('#achievementsModal');
  if (modal) {
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    if (window.lucide) lucide.createIcons();
  }
}

function closeAchievementsModal() {
  const modal = document.querySelector('#achievementsModal');
  if (modal) modal.classList.remove('open');
  const serviceModal = document.querySelector('#serviceModal');
  if (!serviceModal || !serviceModal.classList.contains('open')) {
    document.body.classList.remove('modal-open');
  }
}

let latestProviderData = null;

function calculateAndRenderAchievements(data = latestProviderData, currentSessionSeconds = 0) {
  if (!data) return;
  latestProviderData = data;

  const sessionHours = currentSessionSeconds / 3600;
  const totalHours = (data.totalHours || 0) + sessionHours;
  const currentRate = getSelectedRate();
  const totalEarned = (data.totalEarned || 0) + (sessionHours * currentRate);
  const executions = data.executions || [];

  // 1. 1.000 horas trabalhadas
  const targetHours = 1000;
  const pctHours = Math.min(100, Math.max(0, (totalHours / targetHours) * 100));
  const isHoursUnlocked = totalHours >= targetHours;
  const cardHours = document.querySelector('#achieveCardHours');
  const fillHours = document.querySelector('#fillHours');
  const badgeHours = document.querySelector('#badgeHours');
  const labelHours = document.querySelector('#labelHoursCurrent');

  if (cardHours) cardHours.classList.toggle('unlocked', isHoursUnlocked);
  if (fillHours) fillHours.style.width = `${pctHours.toFixed(1)}%`;
  if (badgeHours) badgeHours.textContent = isHoursUnlocked ? 'Concluído 🏆' : `${pctHours.toFixed(1)}%`;
  if (labelHours) labelHours.textContent = `${totalHours.toFixed(1).replace('.', ',')}h`;

  // 2. R$ 10.000 ganhos
  const targetEarned10k = 10000;
  const pctEarned10k = Math.min(100, Math.max(0, (totalEarned / targetEarned10k) * 100));
  const isEarned10kUnlocked = totalEarned >= targetEarned10k;
  const cardEarned10k = document.querySelector('#achieveCardEarned10k');
  const fillEarned10k = document.querySelector('#fillEarned10k');
  const badgeEarned10k = document.querySelector('#badgeEarned10k');
  const labelEarned10k = document.querySelector('#labelEarned10kCurrent');

  if (cardEarned10k) cardEarned10k.classList.toggle('unlocked', isEarned10kUnlocked);
  if (fillEarned10k) fillEarned10k.style.width = `${pctEarned10k.toFixed(1)}%`;
  if (badgeEarned10k) badgeEarned10k.textContent = isEarned10kUnlocked ? 'Concluído 🏆' : `${pctEarned10k.toFixed(1)}%`;
  if (labelEarned10k) labelEarned10k.textContent = money(totalEarned);

  // 3. R$ 20.000 ganhos
  const targetEarned20k = 20000;
  const pctEarned20k = Math.min(100, Math.max(0, (totalEarned / targetEarned20k) * 100));
  const isEarned20kUnlocked = totalEarned >= targetEarned20k;
  const cardEarned20k = document.querySelector('#achieveCardEarned20k');
  const fillEarned20k = document.querySelector('#fillEarned20k');
  const badgeEarned20k = document.querySelector('#badgeEarned20k');
  const labelEarned20k = document.querySelector('#labelEarned20kCurrent');

  if (cardEarned20k) cardEarned20k.classList.toggle('unlocked', isEarned20kUnlocked);
  if (fillEarned20k) fillEarned20k.style.width = `${pctEarned20k.toFixed(1)}%`;
  if (badgeEarned20k) badgeEarned20k.textContent = isEarned20kUnlocked ? 'Concluído 🏆' : `${pctEarned20k.toFixed(1)}%`;
  if (labelEarned20k) labelEarned20k.textContent = money(totalEarned);

  // 4. 5 dias seguidos trabalhando 8h
  const dailySecondsMap = {};
  executions.forEach(ex => {
    if (ex.status !== 'CANCELADO') {
      const dayKey = new Date(ex.startedAt).toISOString().slice(0, 10);
      dailySecondsMap[dayKey] = (dailySecondsMap[dayKey] || 0) + (ex.durationSeconds || 0);
    }
  });

  if (timerState.active) {
    const todayKey = new Date().toISOString().slice(0, 10);
    dailySecondsMap[todayKey] = (dailySecondsMap[todayKey] || 0) + currentSessionSeconds;
  }

  const sortedDays = Object.keys(dailySecondsMap).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  sortedDays.forEach(dayStr => {
    const seconds = dailySecondsMap[dayStr];
    const dayDate = new Date(dayStr + 'T00:00:00');
    if (seconds >= 28800) { // 8h
      if (prevDate && (dayDate - prevDate === 86400000)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      prevDate = dayDate;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
      prevDate = null;
    }
  });

  const targetStreak = 5;
  const pctStreak = Math.min(100, Math.max(0, (maxStreak / targetStreak) * 100));
  const isStreakUnlocked = maxStreak >= targetStreak;
  const cardStreak = document.querySelector('#achieveCardStreak5d');
  const fillStreak = document.querySelector('#fillStreak5d');
  const badgeStreak = document.querySelector('#badgeStreak5d');
  const labelStreak = document.querySelector('#labelStreak5dCurrent');

  if (cardStreak) cardStreak.classList.toggle('unlocked', isStreakUnlocked);
  if (fillStreak) fillStreak.style.width = `${pctStreak.toFixed(1)}%`;
  if (badgeStreak) badgeStreak.textContent = isStreakUnlocked ? 'Concluído 🏆' : `${maxStreak}/5 dias`;
  if (labelStreak) labelStreak.textContent = `${maxStreak} dia(s) consecutivo(s)`;

  // Contador total desbloqueado
  const unlockedCount = [isHoursUnlocked, isEarned10kUnlocked, isEarned20kUnlocked, isStreakUnlocked].filter(Boolean).length;
  const badgeCountEl = document.querySelector('#achievementsUnlockedCount');
  if (badgeCountEl) badgeCountEl.textContent = `${unlockedCount}/4`;
}

async function load() {
  try {
    const response = await fetch('/api/provider');
    if (!response.ok) return;
    const data = await response.json();
    if (data.serverTime) {
      clockSkew = Date.now() - new Date(data.serverTime).getTime();
    }
    timerState = data.timer;
    allOptions = data.options.filter(o => o.active);

    if (data.professional) {
      const firstName = (data.professional.name || '').split(' ')[0];
      const fullName = data.professional.name || 'Prestador';
      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'P';

      const heading = document.querySelector('.provider-heading h1');
      if (heading && firstName) heading.textContent = `Olá, ${firstName}`;

      document.querySelectorAll('.avatar').forEach(el => {
        el.textContent = initials;
      });

      const dropdownName = document.querySelector('#dropdownUserName');
      if (dropdownName) dropdownName.textContent = fullName;
    }

    const thEl = document.querySelector('#totalHours'); if (thEl) thEl.textContent = (data.totalHours || 0).toFixed(1).replace('.', ',') + 'h';
    const teEl = document.querySelector('#totalEarned'); if (teEl) teEl.textContent = money(data.totalEarned);
    const tdEl = document.querySelector('#todayEarned'); if (tdEl) tdEl.textContent = money(data.todayEarned);

    select.innerHTML = '<option value="">Selecione um serviço</option>' +
      allOptions.map(o => `<option value="${o.id}">${o.name} · ${money(o.rate)}/h</option>`).join('');
    select.value = timerState.serviceId;
    updateSelectedServiceLabel();

    document.querySelector('#serviceOptions').innerHTML = allOptions.map(o => `
      <article class="service-card-airbnb" data-id="${o.id}">
        <div class="service-card-image-wrap">
          <img src="${o.image || '/assets/loft.jpg'}" alt="${o.name}" class="service-card-image" loading="lazy">
          <span class="est-time-badge"><i data-lucide="clock"></i> ${o.estTime || '2h'}</span>
        </div>
        <div class="service-card-body">
          <h3 class="service-card-title">${o.name}</h3>
          <div class="service-card-footer">
            <div class="service-card-price">
              <strong>${money(o.rate)}</strong>
              <small>/ hora</small>
            </div>
            <button class="service-card-btn" data-id="${o.id}">Ver detalhes</button>
          </div>
        </div>
      </article>
    `).join('');

    document.querySelectorAll('.service-card-airbnb').forEach(card => {
      const optId = card.dataset.id;
      const option = allOptions.find(o => o.id === optId);
      if (!option) return;
      card.onclick = () => openServiceModal(option);
    });

    const history = document.querySelector('#executionsList');
    if (history) history.innerHTML = (data.executions || []).map(execution => `
      <div class="professional-cell" style="padding:10px 0;border-bottom:1px solid var(--line);">
        <div><strong>${execution.serviceName}</strong><small>${new Date(execution.startedAt).toLocaleDateString('pt-BR')} · ${formatTime(execution.durationSeconds).slice(0, 8)} · ${money(execution.totalValueCents / 100)} · ${execution.status}</small></div>
      </div>`).join('') || '<small>Nenhum serviço executado ainda.</small>';

    cachedExecutions = data.executions || [];
    renderWeeklyChart(cachedExecutions, timerState.active ? elapsedExact() : 0);
    calculateAndRenderAchievements(data, timerState.active ? elapsedExact() : 0);

    if (timerState.active && !tick) {
      tick = setInterval(renderTimer, 30);
    }

    renderTimer();
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Erro ao carregar dados do prestador:', err);
  }
}

select.addEventListener('change', renderTimer);

button.addEventListener('click', async () => {
  const action = timerState.executionId ? (timerState.active ? 'pause' : 'resume') : 'start';
  const body = action === 'start' ? { action, serviceId: select.value } : { action };
  const response = await fetch('/api/provider/timer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) return;
  const payload = await response.json();
  if (payload.serverTime) {
    clockSkew = Date.now() - new Date(payload.serverTime).getTime();
  }
  timerState = payload.timer;
  if (timerState.active && !tick) tick = setInterval(renderTimer, 30);
  if (!timerState.active) {
    clearInterval(tick);
    tick = null;
  }
  renderTimer();
});

if (finishButton) finishButton.addEventListener('click', async () => {
  const response = await fetch('/api/provider/timer', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'finish' })
  });
  if (!response.ok) return;
  const payload = await response.json();
  const execution = payload.execution;
  window.zyggNotify({
    title: 'Serviço concluído',
    message: execution.serviceName || 'A execução foi registrada com sucesso.',
    details: [
      { label: 'Duração', value: formatTime(execution.durationSeconds).slice(0, 8) },
      { label: 'Tarifa', value: `${money(execution.hourlyRateCents / 100)}/h` },
      { label: 'Total', value: money(execution.totalValueCents / 100) }
    ]
  });
  clearInterval(tick); tick = null;
  await load();
});

document.querySelectorAll('.bottom-nav-item').forEach(b => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

const closeBtn = document.querySelector('#modalCloseBtn');
if (closeBtn) closeBtn.onclick = closeServiceModal;

const modalBackdrop = document.querySelector('#serviceModal');
if (modalBackdrop) {
  modalBackdrop.onclick = (e) => {
    if (e.target === modalBackdrop) closeServiceModal();
  };
}

const selectBtn = document.querySelector('#modalSelectBtn');
if (selectBtn) {
  selectBtn.onclick = () => {
    if (currentSelectedOption) {
      select.value = currentSelectedOption.id;
      updateSelectedServiceLabel();
      closeServiceModal();
      switchTab('timer');
      renderTimer();
    }
  };
}

const refreshBtn = document.querySelector('#refreshCatalogBtn');
if (refreshBtn) {
  refreshBtn.onclick = () => {
    refreshBtn.classList.add('spinning');
    load().finally(() => {
      setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    });
  };
}

// Toggle Menu Flutuante do Avatar
const avatarBtn = document.querySelector('#providerAvatarBtn');
const dropdownMenu = document.querySelector('#providerDropdown');
const logoutBtn = document.querySelector('#providerLogoutBtn');

if (avatarBtn && dropdownMenu) {
  avatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.toggle('open');
    avatarBtn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !avatarBtn.contains(e.target)) {
      dropdownMenu.classList.remove('open');
      avatarBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownMenu.classList.remove('open');
      avatarBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    window.location.assign('/login');
  });
}

// Toggle Como Funciona (Steps Expansíveis)
const howToggle = document.querySelector('#howItWorksToggle');
const howCard = document.querySelector('#howItWorksCard');

if (howToggle && howCard) {
  const toggleHowItWorks = () => {
    const isOpen = howCard.classList.toggle('open');
    howToggle.setAttribute('aria-expanded', isOpen);
  };

  howToggle.addEventListener('click', toggleHowItWorks);
  howToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleHowItWorks();
    }
  });
}

// Modal de Conquistas
const achievementsBtn = document.querySelector('#providerAchievementsBtn');
const achievementsCloseBtn = document.querySelector('#achievementsCloseBtn');
const achievementsModal = document.querySelector('#achievementsModal');

if (achievementsBtn) {
  achievementsBtn.addEventListener('click', () => {
    if (dropdownMenu) {
      dropdownMenu.classList.remove('open');
      if (avatarBtn) avatarBtn.setAttribute('aria-expanded', 'false');
    }
    openAchievementsModal();
  });
}

if (achievementsCloseBtn) {
  achievementsCloseBtn.addEventListener('click', closeAchievementsModal);
}

if (achievementsModal) {
  achievementsModal.addEventListener('click', (e) => {
    if (e.target === achievementsModal) closeAchievementsModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAchievementsModal();
  }
});

load();

// Registro do Service Worker e Suporte PWA no Celular
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker Zygg registrado com sucesso:', reg.scope);
    }).catch(err => {
      console.error('Falha no Service Worker:', err);
    });
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Aplicativo Zygg pronto para instalacao no celular!');
});
