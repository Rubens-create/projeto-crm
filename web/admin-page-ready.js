(() => {
  if (window.top === window.self) return;

  let pendingRequests = 0;
  let domReady = document.readyState !== 'loading';
  let notified = false;
  let settleTimer;
  const originalFetch = window.fetch.bind(window);

  const notifyReady = () => {
    if (notified || !domReady || pendingRequests > 0) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (notified || pendingRequests > 0) return;
      notified = true;
      requestAnimationFrame(() => {
        window.parent.postMessage({ type: 'zygg-admin-ready', path: location.pathname + location.search }, location.origin);
      });
    }, 120);
  };

  window.fetch = (...args) => {
    pendingRequests += 1;
    return originalFetch(...args).finally(() => {
      pendingRequests -= 1;
      notifyReady();
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    domReady = true;
    notifyReady();
  }, { once: true });

  window.addEventListener('pagehide', () => clearTimeout(settleTimer), { once: true });
})();
