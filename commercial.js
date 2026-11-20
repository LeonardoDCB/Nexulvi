(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const menu = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#mobile-nav');
  const salesHero = document.querySelector('.sales-hero');
  const mobileQuote = document.querySelector('.mobile-quote');
  const media = matchMedia('(prefers-color-scheme: dark)');
  const basePath = new URL('.', document.currentScript.src).pathname;
  document.querySelector('[data-catalog-language]')?.addEventListener('change', (event) => {
    const locale = event.currentTarget.value;
    try { localStorage.setItem('nexulvi-language', locale); } catch { /* Optional preference. */ }
    location.assign(`${basePath}${locale === 'pt-BR' ? 'aplicativos.html' : `${locale}/index.html`}`);
  });
  let preference = null;
  try { preference = localStorage.getItem('nexulvi-theme'); } catch { /* Optional preference. */ }
  function setTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    toggle?.setAttribute('aria-pressed', String(dark));
    toggle?.setAttribute('aria-label', dark ? 'Ativar modo claro' : 'Ativar modo escuro');
    if (toggle) toggle.firstElementChild.textContent = dark ? '☼' : '◐';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111613' : '#f7f8f4');
  }
  setTheme(preference ? preference === 'dark' : media.matches);
  if (salesHero && mobileQuote) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        document.body.dataset.stickyQuote = entry.isIntersecting ? 'hidden' : 'visible';
      }, { threshold: 0 }).observe(salesHero);
    } else {
      document.body.dataset.stickyQuote = 'visible';
    }
  }
  toggle?.addEventListener('click', () => {
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(preference === 'dark');
    try { localStorage.setItem('nexulvi-theme', preference); } catch { /* Optional preference. */ }
  });
  media.addEventListener('change', (event) => { if (!preference) setTheme(event.matches); });
  function setMenu(open, returnFocus = false) {
    nav?.toggleAttribute('hidden', !open);
    nav?.toggleAttribute('inert', !open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (returnFocus) menu?.focus();
  }
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (menu?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenu(false);
  });
  document.addEventListener('focusin', (event) => {
    if (menu?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenu(false);
  });
  matchMedia('(min-width: 1101px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });
  document.querySelector('[data-copy-email]')?.addEventListener('click', async (event) => {
    const status = document.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(event.currentTarget.dataset.copyEmail);
      status.textContent = 'E-mail copiado. Cole no seu aplicativo de e-mail.';
    } catch { status.textContent = 'Não foi possível copiar automaticamente. Selecione e copie o endereço acima.'; }
  });
  // Sem analytics, rede, identificadores pessoais ou persistência.
  // Uma integração futura pode escutar este evento após revisão de privacidade.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-track]');
    if (!link) return;
    window.dispatchEvent(new CustomEvent('nexulvi:interaction', { detail: {
      event: link.dataset.track, service: link.dataset.service || null,
      placement: link.dataset.placement || null, channel: link.dataset.channel || null
    } }));
  });
  if (document.body.dataset.project) window.dispatchEvent(new CustomEvent('nexulvi:project-view', { detail: { project: document.body.dataset.project } }));
})();
