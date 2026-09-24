(() => {
  if (window.top === window.self) return;

  let pendingRequests = 0;
  let domReady = document.readyState !== 'loading';
  let notified = false;
  let settleTimer;
  const originalFetch = window.fetch.bind(window);

  const selectStyle = document.createElement('style');
  selectStyle.textContent = `select:not([hidden]){appearance:none;-webkit-appearance:none;min-height:43px;padding:11px 38px 11px 12px;border:1px solid #eeeaf0;border-radius:9px;background-color:#fff;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b76b89' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;color:#4d4550;font:inherit;font-size:12px;cursor:pointer}select:not([hidden]):hover,select:not([hidden]):focus{border-color:#efb5ca;outline:0;box-shadow:0 0 0 3px #fff1f6}select:not([hidden]):disabled{color:#aaa2ab;background-color:#f7f5f7;cursor:not-allowed}`;
  document.head.append(selectStyle);

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
