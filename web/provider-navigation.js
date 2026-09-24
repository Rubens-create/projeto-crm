(() => {
  const transitionKey = 'zygg_provider_transition';
  const direction = sessionStorage.getItem(transitionKey);
  sessionStorage.removeItem(transitionKey);
  if (direction) {
    document.body.classList.add(`provider-page-enter-${direction}`);
    window.setTimeout(() => document.body.classList.remove(`provider-page-enter-${direction}`), 500);
  }

  const navigate = (link, nextDirection) => {
    if (!link || link.target || link.hasAttribute('download')) return;
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      sessionStorage.setItem(transitionKey, nextDirection);
      document.body.classList.add(`provider-page-transition-${nextDirection}`);
      window.setTimeout(() => { window.location.assign(link.href); }, 300);
    });
  };

  navigate(document.querySelector('#providerSettingsLink'), 'forward');
  navigate(document.querySelector('.provider-settings-back'), 'back');
})();
