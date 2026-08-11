document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.zygg-nav');
  const menu = document.querySelector('.zygg-menu-toggle');
  const navLinks = document.querySelector('.zygg-nav-links');

  const setNavState = () => nav?.classList.toggle('is-scrolled', window.scrollY > 12);
  setNavState();
  window.addEventListener('scroll', setNavState, { passive: true });

  menu?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.zygg-reveal').forEach(element => reveal.observe(element));
});
