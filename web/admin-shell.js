(() => {
  if (window.top !== window.self) return;

  const main = document.querySelector('.app-shell > .main');
  const sidebar = document.querySelector('.app-shell > .sidebar');
  if (!main || !sidebar) return;

  const frame = document.createElement('iframe');
  frame.className = 'admin-shell-frame';
  frame.title = 'Conteúdo administrativo';
  frame.setAttribute('aria-live', 'polite');

  const loader = document.createElement('div');
  loader.className = 'admin-shell-loader is-visible';
  loader.setAttribute('role', 'status');
  loader.innerHTML = '<span></span><strong>Carregando tela</strong><small>Preparando informações da operação</small>';

  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'admin-shell-mobile-toggle';
  mobileToggle.type = 'button';
  mobileToggle.setAttribute('aria-label', 'Abrir menu');
  mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
  mobileToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.body.append(mobileToggle);

  const style = document.createElement('style');
  style.textContent = `
    .admin-shell-frame { display:block; width:100%; height:100vh; border:0; background:var(--bg); opacity:0; transition:opacity .16s ease; }
    .admin-shell-frame.is-ready { opacity:1; }
    .main:has(.admin-shell-frame) { position:relative; overflow:hidden; }
    .admin-shell-loader { position:absolute; inset:0; z-index:2; display:none; place-content:center; justify-items:center; gap:8px; background:var(--bg); color:#675f69; text-align:center; }
    .admin-shell-loader.is-visible { display:grid; }
    .admin-shell-loader span { width:30px; height:30px; border:3px solid #f4d7e2; border-top-color:var(--pink-strong); border-radius:50%; animation:admin-shell-spin .7s linear infinite; }
    .admin-shell-loader strong { margin-top:5px; font:700 13px Outfit, sans-serif; }
    .admin-shell-loader small { color:#948c96; font-size:10px; }
    @keyframes admin-shell-spin { to { transform:rotate(360deg); } }
    .admin-shell-mobile-toggle { display:none; position:fixed; z-index:20; left:14px; bottom:16px; width:48px; height:48px; border:0; border-radius:50%; background:var(--pink-strong); color:#fff; box-shadow:0 8px 22px rgba(183,84,122,.35); }
    .admin-shell-mobile-toggle svg { width:21px; height:21px; }
    @media (max-width:700px) { .admin-shell-mobile-toggle { display:grid; place-items:center; } }
  `;
  document.head.append(style);
  main.replaceChildren(frame, loader);
  if (window.lucide) lucide.createIcons();

  let currentPath = location.pathname + location.search;
  let loadingTimeout;
  const setLoading = loading => {
    clearTimeout(loadingTimeout);
    frame.classList.toggle('is-ready', !loading);
    loader.classList.toggle('is-visible', loading);
    if (loading) loadingTimeout = setTimeout(() => setLoading(false), 5000);
  };

  const updateNavigation = path => {
    const current = new URL(path, location.origin);
    sidebar.querySelectorAll('.nav-item, .nav-sub-item').forEach(link => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const target = new URL(link.href);
      const isReportSubItem = link.classList.contains('nav-sub-item');
      const isActive = target.pathname === current.pathname && (!isReportSubItem || target.search === current.search);
      link.classList.toggle('active', isActive);
    });
    const reports = sidebar.querySelector('#reportsNavGroup');
    const isReportsPage = current.pathname === '/admin/relatorios';
    reports?.classList.toggle('open', isReportsPage);
    sidebar.querySelector('#reportsMenuBtn')?.classList.toggle('active', isReportsPage);
  };

  const navigate = (path, pushState) => {
    if (path === currentPath) return;
    currentPath = path;
    updateNavigation(path);
    sidebar.classList.remove('open');
    if (pushState) history.pushState({}, '', path);
    setLoading(true);
    frame.src = path;
  };

  sidebar.querySelectorAll('a[href^="/admin"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
      event.preventDefault();
      navigate(link.getAttribute('href'), true);
    });
  });

  frame.addEventListener('load', () => {
    try {
      const documentInFrame = frame.contentDocument;
      const frameWindow = frame.contentWindow;
      if (!documentInFrame || !frameWindow) return;
      const framePath = frameWindow.location.pathname + frameWindow.location.search;
      documentInFrame.querySelector('.app-shell > .sidebar')?.remove();
      const innerStyle = documentInFrame.createElement('style');
      innerStyle.textContent = 'html,body{height:100%;overflow:hidden}.app-shell{display:block;min-height:100vh}.app-shell>.main{width:100%;height:100vh;overflow:auto}.mobile-menu{display:none!important}';
      documentInFrame.head.append(innerStyle);
      if (documentInFrame.title) document.title = documentInFrame.title;
      if (framePath !== currentPath) {
        currentPath = framePath;
        history.pushState({}, '', framePath);
      }
      updateNavigation(currentPath);
    } catch (_) {
      window.location.assign(frame.src);
    }
  });

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'zygg-admin-ready') return;
    if (event.data.path === currentPath) setLoading(false);
  });
  window.addEventListener('popstate', () => navigate(location.pathname + location.search, false));

  updateNavigation(currentPath);
  setLoading(true);
  frame.src = currentPath;
})();
