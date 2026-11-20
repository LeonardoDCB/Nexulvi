(() => {
  'use strict';

  const languages = [
    ['pt-BR', 'Português (Brasil)'], ['en-US', 'English (United States)'],
    ['es-ES', 'Español (España)'], ['en-GB', 'English (United Kingdom)'],
    ['es-419', 'Español (Latinoamérica)'], ['de-DE', 'Deutsch'],
    ['fr-FR', 'Français'], ['it-IT', 'Italiano'], ['pt-PT', 'Português (Portugal)'],
    ['nl-NL', 'Nederlands'], ['ja-JP', '日本語'], ['ko-KR', '한국어'],
    ['hi-IN', 'हिन्दी'], ['id', 'Bahasa Indonesia'], ['tr-TR', 'Türkçe'], ['pl-PL', 'Polski']
  ];
  const codes = new Set(languages.map(([code]) => code));
  const pathParts = location.pathname.split('/').filter(Boolean);
  const localeIndex = pathParts.findIndex((part) => codes.has(part));
  const currentLocale = localeIndex < 0 ? 'pt-BR' : pathParts[localeIndex];
  const isDirectoryUrl = location.pathname.endsWith('/');
  const isNotFound = Boolean(document.querySelector('meta[name="robots"][content="noindex"]'));
  const currentPage = isNotFound ? '404.html' : (localeIndex < 0 ? (isDirectoryUrl ? 'index.html' : (pathParts[pathParts.length - 1] || 'index.html')) : (pathParts[localeIndex + 1] || 'index.html'));
  const pickerScript = document.currentScript ? new URL(document.currentScript.src) : new URL('language-picker.js', location.href);
  const basePath = new URL('.', pickerScript).pathname;
  const selectorNames = {
    'pt-BR': 'Selecionar idioma', 'en-US': 'Select language', 'es-ES': 'Seleccionar idioma',
    'en-GB': 'Select language', 'es-419': 'Seleccionar idioma', 'de-DE': 'Sprache auswählen',
    'fr-FR': 'Choisir la langue', 'it-IT': 'Seleziona la lingua', 'pt-PT': 'Selecionar idioma',
    'nl-NL': 'Taal selecteren', 'ja-JP': '言語を選択', 'ko-KR': '언어 선택',
    'hi-IN': 'भाषा चुनें', id: 'Pilih bahasa', 'tr-TR': 'Dil seçin', 'pl-PL': 'Wybierz język'
  };
  const navigationNames = {
    'pt-BR': ['Abrir navegação', 'Fechar navegação'], 'en-US': ['Open navigation', 'Close navigation'],
    'es-ES': ['Abrir navegación', 'Cerrar navegación'], 'en-GB': ['Open navigation', 'Close navigation'],
    'es-419': ['Abrir navegación', 'Cerrar navegación'], 'de-DE': ['Navigation öffnen', 'Navigation schließen'],
    'fr-FR': ['Ouvrir la navigation', 'Fermer la navigation'], 'it-IT': ['Apri la navigazione', 'Chiudi la navigazione'],
    'pt-PT': ['Abrir navegação', 'Fechar navegação'], 'nl-NL': ['Navigatie openen', 'Navigatie sluiten'],
    'ja-JP': ['ナビゲーションを開く', 'ナビゲーションを閉じる'], 'ko-KR': ['탐색 열기', '탐색 닫기'],
    'hi-IN': ['नेविगेशन खोलें', 'नेविगेशन बंद करें'], id: ['Buka navigasi', 'Tutup navigasi'],
    'tr-TR': ['Gezinmeyi aç', 'Gezinmeyi kapat'], 'pl-PL': ['Otwórz nawigację', 'Zamknij nawigację']
  };
  window.__NEXULVI_NAVIGATION_LABELS = navigationNames[currentLocale] || navigationNames['pt-BR'];
  let select = document.querySelector('#language-select, #app-language');

  if (!select) {
    const wrapper = document.createElement('label');
    wrapper.className = 'site-language-control';
    wrapper.setAttribute('aria-label', selectorNames[currentLocale] || selectorNames['pt-BR']);
    select = document.createElement('select');
    select.id = 'site-language-select';
    select.setAttribute('aria-label', selectorNames[currentLocale] || selectorNames['pt-BR']);
    wrapper.append(select);
    document.body.append(wrapper);
    const style = document.createElement('style');
    style.textContent = '.site-language-control{position:fixed;z-index:100;top:1rem;right:1rem}.site-language-control select{max-width:min(14rem,48vw);min-height:42px;padding:.5rem 2rem .5rem .7rem;border:1px solid #8dffe0;border-radius:7px;background:#081116;color:#edf9f6;font:600 .8rem system-ui,sans-serif}.site-language-control select:focus-visible{outline:3px solid #9985ff;outline-offset:3px}';
    document.head.append(style);
  }

  select.replaceChildren(...languages.map(([code, label]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    return option;
  }));
  select.setAttribute('aria-label', selectorNames[currentLocale] || selectorNames['pt-BR']);
  select.style.maxWidth = 'min(12rem, 38vw)';
  select.value = currentLocale;
  select.addEventListener('change', (event) => {
    event.stopImmediatePropagation();
    const targetLocale = select.value;
    const isCatalogPicker = select.hasAttribute('data-catalog-language') || currentPage === 'aplicativos.html' || (currentLocale !== 'pt-BR' && currentPage === 'index.html');
    const page = isCatalogPicker ? (targetLocale === 'pt-BR' ? 'aplicativos.html' : '') : (currentPage === 'index.html' ? '' : currentPage);
    const target = targetLocale === 'pt-BR'
      ? `${basePath}${page}`
      : `${basePath}${targetLocale}/${page || 'index.html'}`;
    try { localStorage.setItem('nexulvi-language', targetLocale); } catch { /* Optional preference. */ }
    location.assign(`${target}${location.search}${location.hash}`);
  });
})();
