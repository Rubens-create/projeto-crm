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

  const carousel = document.querySelector('[data-carousel]');
  const copy = document.querySelector('[data-carousel-copy]');
  const slides = [...document.querySelectorAll('[data-slide]')];
  const dots = [...document.querySelectorAll('[data-carousel-dot]')];
  const carouselCopy = [
    {
      kicker: 'Plataforma para operações de serviços',
      title: 'Gestão inteligente<br>para operações<br><em>de limpeza.</em>',
      lead: 'Controle serviços, prestadores, clientes, tempo e repasses em um único lugar, com visão clara da sua operação todos os dias.'
    },
    {
      kicker: 'Serviços sob controle',
      title: 'Serviços organizados.<br>Execução sem<br><em>ruído.</em>',
      lead: 'Cadastre cada serviço, tarifa e imóvel em um catálogo claro para sua equipe executar com contexto e consistência.'
    },
    {
      kicker: 'Financeiro sem surpresas',
      title: 'Repasses claros<br>para uma operação<br><em>saudável.</em>',
      lead: 'Acompanhe o que foi pago, o que está pendente e quanto cada prestador deve receber em uma leitura simples.'
    }
  ];
  let activeSlide = 0;
  let carouselTimer;

  const showSlide = index => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeSlide;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
    if (copy) {
      const content = carouselCopy[activeSlide];
      copy.querySelector('.zygg-kicker').innerHTML = `<span></span> ${content.kicker}`;
      copy.querySelector('h1').innerHTML = content.title;
      copy.querySelector('.zygg-lead').textContent = content.lead;
    }
    if (window.lucide) lucide.createIcons();
  };

  const restartCarousel = () => {
    window.clearInterval(carouselTimer);
    carouselTimer = window.setInterval(() => showSlide(activeSlide + 1), 5500);
  };

  if (carousel && slides.length) {
    carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => { showSlide(activeSlide - 1); restartCarousel(); });
    carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => { showSlide(activeSlide + 1); restartCarousel(); });
    dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.carouselDot)); restartCarousel(); }));
    carousel.addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
    carousel.addEventListener('mouseleave', restartCarousel);
    carousel.addEventListener('focusin', () => window.clearInterval(carouselTimer));
    carousel.addEventListener('focusout', event => { if (!carousel.contains(event.relatedTarget)) restartCarousel(); });
    showSlide(0);
    restartCarousel();
  }

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.zygg-reveal').forEach(element => reveal.observe(element));

  document.querySelectorAll('[data-live-timer]').forEach(timer => {
    const display = timer.querySelector('b') || timer.querySelector('span');
    const parts = timer.dataset.liveTimer.split(':').map(Number);
    if (!display || parts.length !== 3 || parts.some(Number.isNaN)) return;

    let elapsedSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    const renderTimer = () => {
      elapsedSeconds += 1;
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      display.textContent = [hours, minutes, seconds]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
    };

    window.setInterval(renderTimer, 1000);
  });
});
