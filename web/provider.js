const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const moneyExact = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

let timerState = { active: false, serviceId: '', elapsedSeconds: 0, startedAt: null };
let tick;
let currentSelectedOption = null;
let allOptions = [];

const display = document.querySelector('#timerDisplay');
const select = document.querySelector('#serviceSelect');
const button = document.querySelector('#timerButton');

function elapsedExact() {
  if (!timerState.active) return timerState.elapsedSeconds;
  const now = Date.now();
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
  const width = 300;
  const height = 70;
  const steps = 12;
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const x = (width / steps) * i;
    const tRatio = i / steps;
    const progressRatio = Math.min((secExact * tRatio) / 3600, 1.0);
    const eased = Math.pow(progressRatio, 0.5);
    const y = height - (eased * (height - 15));
    points.push({ x, y });
  }

  const lineD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`;
  }, '');

  const areaD = `${lineD} L${width},${height} L0,${height} Z`;
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

let lastRenderedActive = null;

function renderTimer() {
  const secExact = elapsedExact();
  const rate = getSelectedRate();
  display.textContent = formatTime(secExact);
  button.disabled = !timerState.active && !select.value;

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
}

function switchTab(tabName) {
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
  document.querySelector('#modalImg').src = option.image || '/assets/loft.jpg';
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
  if (window.lucide) lucide.createIcons();
}

function closeServiceModal() {
  const modal = document.querySelector('#serviceModal');
  if (modal) modal.classList.remove('open');
}

async function load() {
  try {
    const response = await fetch('/api/provider');
    if (!response.ok) return;
    const data = await response.json();
    timerState = data.timer;
    allOptions = data.options.filter(o => o.active);

    document.querySelector('#totalHours').textContent = data.totalHours.toFixed(1).replace('.', ',') + 'h';
    document.querySelector('#totalEarned').textContent = money(data.totalEarned);
    document.querySelector('#todayEarned').textContent = money(data.todayEarned);

    select.innerHTML = '<option value="">Selecione um serviço</option>' +
      allOptions.map(o => `<option value="${o.id}">${o.name} · ${money(o.rate)}/h</option>`).join('');
    select.value = timerState.serviceId;

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
  const action = timerState.active ? 'stop' : 'start';
  const body = action === 'start' ? { action, serviceId: select.value } : { action };
  const response = await fetch('/api/provider/timer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) return;
  timerState = await response.json();
  if (timerState.active && !tick) tick = setInterval(renderTimer, 30);
  if (!timerState.active) {
    clearInterval(tick);
    tick = null;
    load();
  }
  renderTimer();
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
