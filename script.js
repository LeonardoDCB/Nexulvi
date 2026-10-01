(() => {
  'use strict';

  const root = document.documentElement;
  const languageSelect = document.querySelector('#language-select');
  const themeToggle = document.querySelector('#theme-toggle');
  const menuToggle = document.querySelector('#menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const languageStatus = document.querySelector('#language-status');
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch { /* Storage can be unavailable in private contexts. */ }
    }
  };

  const translations = {
    pt: {
      skip: 'Pular para o conteúdo', language: 'Idioma', navProducts: 'Aplicativos', navAbout: 'Sobre nós', navContact: 'Contato',
      heroEyebrow: 'ESTÚDIO INDEPENDENTE DE PRODUTOS DIGITAIS', heroTitle: 'Tecnologia útil.<br><em>Feita para a vida real.</em>',
      heroDescription: 'Criamos aplicativos que ajudam as pessoas a cuidar do seu tempo, organizar o que importa e fazer escolhas com mais clareza.',
      heroCta: 'Conheça nossos aplicativos', heroSecondary: 'Quem é a Nexulvi', heroNote: 'Ideias independentes. Produtos em construção.', scroll: 'ROLE PARA EXPLORAR',
      stripTitle: 'Tecnologia com propósito. Experiências sem excesso.', productsEyebrow: 'NOSSO PORTFÓLIO', productsTitle: 'Aplicativos para<br><em>o que importa.</em>',
      productsIntro: 'Cada produto parte de uma necessidade concreta. Conheça as ideias que estamos transformando em ferramentas para o dia a dia.',
      statusSoon: 'EM BREVE', statusPreparing: 'EM PREPARAÇÃO', statusDeveloping: 'EM DESENVOLVIMENTO', learnProduct: 'Conheça o aplicativo',
      alongaeScreen: 'Hora de<br>respirar.', alongaeCategory: 'BEM-ESTAR E ERGONOMIA', alongaeDescription: 'Pausas guiadas e lembretes gentis para criar uma rotina mais saudável diante da tela.',
      archiveKicker: 'ARQUIVO PESSOAL', archiveTitle: 'Tudo no<br>seu lugar.', fileOne: 'Conta de energia', fileTwo: 'Documento pessoal',
      arqvelloCategory: 'ARQUIVO DIGITAL', arqvelloDescription: 'Digitalize, organize e encontre documentos importantes com privacidade e controle local.',
      financeKicker: 'RESUMO DO MÊS', financeCaption: 'disponível para planejar', cofliraCategory: 'FINANÇAS PESSOAIS',
      cofliraDescription: 'Receitas, despesas e metas organizadas para ajudar você a decidir com mais tranquilidade.',
      miauforiaCategory: 'ENTRETENIMENTO FELINO', miauforiaDescription: 'Brincadeiras interativas para estimular a curiosidade e o bem-estar dos gatos.',
      sentinelaKicker: 'ANÁLISE LOCAL', sentinelaScreen: 'Observe.<br>Entenda.', sentinelaCategory: 'INVESTIGAÇÃO DIGITAL',
      sentinelaDescription: 'Leituras técnicas locais para entender situações incomuns e investigar com responsabilidade.',
      aboutEyebrow: 'SOBRE A NEXULVI', aboutTitle: 'Um estúdio independente.<br><em>Produtos com intenção.</em>',
      aboutDescription: 'A Nexulvi é uma empresa de produtos digitais. Unimos estratégia, design e engenharia para transformar ideias em aplicativos úteis, claros e agradáveis de usar.',
      talkToUs: 'Vamos conversar', principleOneTitle: 'Utilidade primeiro', principleOneText: 'Cada função precisa resolver uma necessidade real.',
      principleTwoTitle: 'Privacidade por padrão', principleTwoText: 'Transparência e cuidado desde o início do produto.',
      principleThreeTitle: 'Tecnologia com clareza', principleThreeText: 'Experiências simples, mesmo quando a tecnologia é complexa.',
      contactEyebrow: 'FALE COM A NEXULVI', contactTitle: 'Tem uma ideia?<br><em>Vamos conversar.</em>',
      contactDescription: 'Dúvidas, sugestões ou interesse em acompanhar nossos produtos? Estamos por aqui.', contactCta: 'Enviar um e-mail',
      footerTagline: 'Produtos digitais independentes para a vida real.', backTop: 'Voltar ao topo ↑', rights: 'Todos os direitos reservados.'
    },
    en: {
      skip: 'Skip to content', language: 'Language', navProducts: 'Apps', navAbout: 'About us', navContact: 'Contact',
      heroEyebrow: 'INDEPENDENT DIGITAL PRODUCT STUDIO', heroTitle: 'Useful technology.<br><em>Made for real life.</em>',
      heroDescription: 'We create apps that help people make time for what matters, stay organized and make clearer choices.',
      heroCta: 'Explore our apps', heroSecondary: 'Meet Nexulvi', heroNote: 'Independent ideas. Products in progress.', scroll: 'SCROLL TO EXPLORE',
      stripTitle: 'Technology with purpose. Experiences without excess.', productsEyebrow: 'OUR PORTFOLIO', productsTitle: 'Apps for<br><em>what matters.</em>',
      productsIntro: 'Every product starts with a real need. Meet the ideas we are turning into useful tools for everyday life.',
      statusSoon: 'COMING SOON', statusPreparing: 'IN PREPARATION', statusDeveloping: 'IN DEVELOPMENT', learnProduct: 'Explore the app',
      alongaeScreen: 'Time to<br>breathe.', alongaeCategory: 'WELLNESS AND ERGONOMICS', alongaeDescription: 'Guided breaks and gentle reminders for a healthier routine at your screen.',
      archiveKicker: 'PERSONAL ARCHIVE', archiveTitle: 'Everything<br>in its place.', fileOne: 'Electricity bill', fileTwo: 'Personal document',
      arqvelloCategory: 'DIGITAL ARCHIVE', arqvelloDescription: 'Scan, organize and find important documents with privacy and local control.',
      financeKicker: 'MONTHLY OVERVIEW', financeCaption: 'available to plan', cofliraCategory: 'PERSONAL FINANCE',
      cofliraDescription: 'Organized income, expenses and goals to help you make more confident decisions.',
      miauforiaCategory: 'CAT ENTERTAINMENT', miauforiaDescription: 'Interactive play to spark curiosity and support cats’ wellbeing.',
      sentinelaKicker: 'LOCAL ANALYSIS', sentinelaScreen: 'Observe.<br>Understand.', sentinelaCategory: 'DIGITAL INVESTIGATION',
      sentinelaDescription: 'Local technical readings to understand unusual situations and investigate responsibly.',
      aboutEyebrow: 'ABOUT NEXULVI', aboutTitle: 'An independent studio.<br><em>Products with purpose.</em>',
      aboutDescription: 'Nexulvi is a digital product company. We bring strategy, design and engineering together to turn ideas into useful, clear and enjoyable apps.',
      talkToUs: 'Let’s talk', principleOneTitle: 'Useful by design', principleOneText: 'Every feature should solve a real need.',
      principleTwoTitle: 'Privacy by default', principleTwoText: 'Transparency and care from the very start.',
      principleThreeTitle: 'Technology made clear', principleThreeText: 'Simple experiences, even when technology is complex.',
      contactEyebrow: 'GET IN TOUCH', contactTitle: 'Have an idea?<br><em>Let’s talk.</em>',
      contactDescription: 'Questions, suggestions or want to follow our apps? We would love to hear from you.', contactCta: 'Send an email',
      footerTagline: 'Independent digital products for real life.', backTop: 'Back to top ↑', rights: 'All rights reserved.'
    },
    es: {
      skip: 'Saltar al contenido', language: 'Idioma', navProducts: 'Aplicaciones', navAbout: 'Sobre nosotros', navContact: 'Contacto',
      heroEyebrow: 'ESTUDIO INDEPENDIENTE DE PRODUCTOS DIGITALES', heroTitle: 'Tecnología útil.<br><em>Hecha para la vida real.</em>',
      heroDescription: 'Creamos aplicaciones que ayudan a cuidar el tiempo, organizar lo importante y tomar decisiones con más claridad.',
      heroCta: 'Conoce nuestras apps', heroSecondary: 'Conoce Nexulvi', heroNote: 'Ideas independientes. Productos en desarrollo.', scroll: 'DESLIZA PARA EXPLORAR',
      stripTitle: 'Tecnología con propósito. Experiencias sin exceso.', productsEyebrow: 'NUESTRO PORTAFOLIO', productsTitle: 'Aplicaciones para<br><em>lo que importa.</em>',
      productsIntro: 'Cada producto parte de una necesidad concreta. Conoce las ideas que convertimos en herramientas para el día a día.',
      statusSoon: 'PRÓXIMAMENTE', statusPreparing: 'EN PREPARACIÓN', statusDeveloping: 'EN DESARROLLO', learnProduct: 'Conoce la aplicación',
      alongaeScreen: 'Hora de<br>respirar.', alongaeCategory: 'BIENESTAR Y ERGONOMÍA', alongaeDescription: 'Pausas guiadas y recordatorios amables para una rutina más saludable frente a la pantalla.',
      archiveKicker: 'ARCHIVO PERSONAL', archiveTitle: 'Todo en<br>su lugar.', fileOne: 'Factura de luz', fileTwo: 'Documento personal',
      arqvelloCategory: 'ARCHIVO DIGITAL', arqvelloDescription: 'Digitaliza, organiza y encuentra documentos importantes con privacidad y control local.',
      financeKicker: 'RESUMEN DEL MES', financeCaption: 'disponible para planificar', cofliraCategory: 'FINANZAS PERSONALES',
      cofliraDescription: 'Ingresos, gastos y metas organizados para ayudarte a decidir con más tranquilidad.',
      miauforiaCategory: 'ENTRETENIMIENTO FELINO', miauforiaDescription: 'Juegos interactivos para estimular la curiosidad y el bienestar de los gatos.',
      sentinelaKicker: 'ANÁLISIS LOCAL', sentinelaScreen: 'Observa.<br>Entiende.', sentinelaCategory: 'INVESTIGACIÓN DIGITAL',
      sentinelaDescription: 'Lecturas técnicas locales para entender situaciones inusuales e investigar con responsabilidad.',
      aboutEyebrow: 'SOBRE NEXULVI', aboutTitle: 'Un estudio independiente.<br><em>Productos con intención.</em>',
      aboutDescription: 'Nexulvi es una empresa de productos digitales. Unimos estrategia, diseño e ingeniería para convertir ideas en aplicaciones útiles y agradables.',
      talkToUs: 'Hablemos', principleOneTitle: 'Utilidad primero', principleOneText: 'Cada función debe resolver una necesidad real.',
      principleTwoTitle: 'Privacidad por defecto', principleTwoText: 'Transparencia y cuidado desde el inicio.',
      principleThreeTitle: 'Tecnología clara', principleThreeText: 'Experiencias simples, aunque la tecnología sea compleja.',
      contactEyebrow: 'CONTACTA CON NEXULVI', contactTitle: '¿Tienes una idea?<br><em>Hablemos.</em>',
      contactDescription: '¿Dudas, sugerencias o interés en nuestros productos? Estamos aquí.', contactCta: 'Enviar un correo',
      footerTagline: 'Productos digitales independientes para la vida real.', backTop: 'Volver arriba ↑', rights: 'Todos los derechos reservados.'
    },
    fr: {
      skip: 'Aller au contenu', language: 'Langue', navProducts: 'Applications', navAbout: 'À propos', navContact: 'Contact',
      heroEyebrow: 'STUDIO INDÉPENDANT DE PRODUITS NUMÉRIQUES', heroTitle: 'La technologie utile.<br><em>Pour la vraie vie.</em>',
      heroDescription: 'Nous créons des applications pour mieux gérer son temps, organiser l’essentiel et faire des choix plus clairs.',
      heroCta: 'Découvrir nos applications', heroSecondary: 'Découvrir Nexulvi', heroNote: 'Des idées indépendantes. Des produits en développement.', scroll: 'FAITES DÉFILER POUR EXPLORER',
      stripTitle: 'La technologie avec un but. Des expériences sans superflu.', productsEyebrow: 'NOTRE PORTFOLIO', productsTitle: 'Des applications pour<br><em>ce qui compte.</em>',
      productsIntro: 'Chaque produit répond à un besoin concret. Découvrez les idées que nous transformons en outils du quotidien.',
      statusSoon: 'BIENTÔT', statusPreparing: 'EN PRÉPARATION', statusDeveloping: 'EN DÉVELOPPEMENT', learnProduct: 'Découvrir l’application',
      alongaeScreen: 'Le moment de<br>respirer.', alongaeCategory: 'BIEN-ÊTRE ET ERGONOMIE', alongaeDescription: 'Des pauses guidées et des rappels doux pour une routine plus saine devant l’écran.',
      archiveKicker: 'ARCHIVES PERSONNELLES', archiveTitle: 'Chaque chose<br>à sa place.', fileOne: 'Facture d’électricité', fileTwo: 'Document personnel',
      arqvelloCategory: 'ARCHIVES NUMÉRIQUES', arqvelloDescription: 'Numérisez, organisez et retrouvez vos documents en toute confidentialité.',
      financeKicker: 'RÉSUMÉ DU MOIS', financeCaption: 'disponible pour planifier', cofliraCategory: 'FINANCES PERSONNELLES',
      cofliraDescription: 'Revenus, dépenses et objectifs organisés pour vous aider à décider sereinement.',
      miauforiaCategory: 'DIVERTISSEMENT FÉLIN', miauforiaDescription: 'Des jeux interactifs pour stimuler la curiosité et le bien-être des chats.',
      sentinelaKicker: 'ANALYSE LOCALE', sentinelaScreen: 'Observer.<br>Comprendre.', sentinelaCategory: 'INVESTIGATION NUMÉRIQUE',
      sentinelaDescription: 'Des analyses techniques locales pour comprendre les situations inhabituelles avec responsabilité.',
      aboutEyebrow: 'À PROPOS DE NEXULVI', aboutTitle: 'Un studio indépendant.<br><em>Des produits qui ont du sens.</em>',
      aboutDescription: 'Nexulvi est une entreprise de produits numériques. Nous réunissons stratégie, design et ingénierie pour créer des applications utiles et agréables.',
      talkToUs: 'Parlons-en', principleOneTitle: 'L’utilité avant tout', principleOneText: 'Chaque fonction doit répondre à un vrai besoin.',
      principleTwoTitle: 'La confidentialité par défaut', principleTwoText: 'Transparence et attention dès le début.',
      principleThreeTitle: 'Une technologie claire', principleThreeText: 'Des expériences simples, même avec une technologie complexe.',
      contactEyebrow: 'CONTACTEZ NEXULVI', contactTitle: 'Une idée en tête ?<br><em>Parlons-en.</em>',
      contactDescription: 'Une question, une suggestion ou envie de suivre nos produits ? Écrivez-nous.', contactCta: 'Envoyer un e-mail',
      footerTagline: 'Des produits numériques indépendants pour la vraie vie.', backTop: 'Retour en haut ↑', rights: 'Tous droits réservés.'
    },
    de: {
      skip: 'Zum Inhalt springen', language: 'Sprache', navProducts: 'Apps', navAbout: 'Über uns', navContact: 'Kontakt',
      heroEyebrow: 'UNABHÄNGIGES STUDIO FÜR DIGITALE PRODUKTE', heroTitle: 'Nützliche Technologie.<br><em>Für das echte Leben.</em>',
      heroDescription: 'Wir entwickeln Apps, die Menschen helfen, ihre Zeit zu nutzen, Wichtiges zu ordnen und klarere Entscheidungen zu treffen.',
      heroCta: 'Unsere Apps entdecken', heroSecondary: 'Nexulvi kennenlernen', heroNote: 'Unabhängige Ideen. Produkte in Entwicklung.', scroll: 'WEITER SCROLLEN',
      stripTitle: 'Technologie mit Sinn. Erlebnisse ohne Überfluss.', productsEyebrow: 'UNSER PORTFOLIO', productsTitle: 'Apps für<br><em>das Wesentliche.</em>',
      productsIntro: 'Jedes Produkt beginnt mit einem konkreten Bedarf. Entdecke unsere Ideen für nützliche Werkzeuge im Alltag.',
      statusSoon: 'DEMNÄCHST', statusPreparing: 'IN VORBEREITUNG', statusDeveloping: 'IN ENTWICKLUNG', learnProduct: 'App entdecken',
      alongaeScreen: 'Zeit zum<br>Durchatmen.', alongaeCategory: 'WOHLBEFINDEN UND ERGONOMIE', alongaeDescription: 'Geführte Pausen und sanfte Erinnerungen für einen gesünderen Alltag am Bildschirm.',
      archiveKicker: 'PERSÖNLICHES ARCHIV', archiveTitle: 'Alles an<br>seinem Platz.', fileOne: 'Stromrechnung', fileTwo: 'Persönliches Dokument',
      arqvelloCategory: 'DIGITALES ARCHIV', arqvelloDescription: 'Wichtige Dokumente digitalisieren, ordnen und privat lokal verwalten.',
      financeKicker: 'MONATSÜBERSICHT', financeCaption: 'zur Planung verfügbar', cofliraCategory: 'PERSÖNLICHE FINANZEN',
      cofliraDescription: 'Einnahmen, Ausgaben und Ziele für ruhigere und klarere Entscheidungen.',
      miauforiaCategory: 'UNTERHALTUNG FÜR KATZEN', miauforiaDescription: 'Interaktive Spiele für Neugier und Wohlbefinden von Katzen.',
      sentinelaKicker: 'LOKALE ANALYSE', sentinelaScreen: 'Beobachten.<br>Verstehen.', sentinelaCategory: 'DIGITALE UNTERSUCHUNG',
      sentinelaDescription: 'Lokale technische Analysen, um ungewöhnliche Situationen verantwortungsvoll zu verstehen.',
      aboutEyebrow: 'ÜBER NEXULVI', aboutTitle: 'Ein unabhängiges Studio.<br><em>Produkte mit Sinn.</em>',
      aboutDescription: 'Nexulvi ist ein Unternehmen für digitale Produkte. Wir verbinden Strategie, Design und Engineering zu nützlichen, klaren und angenehmen Apps.',
      talkToUs: 'Lass uns reden', principleOneTitle: 'Nutzen zuerst', principleOneText: 'Jede Funktion löst einen echten Bedarf.',
      principleTwoTitle: 'Datenschutz als Standard', principleTwoText: 'Transparenz und Sorgfalt von Anfang an.',
      principleThreeTitle: 'Technologie verständlich', principleThreeText: 'Einfache Erlebnisse trotz komplexer Technik.',
      contactEyebrow: 'KONTAKT ZU NEXULVI', contactTitle: 'Eine Idee?<br><em>Lass uns reden.</em>',
      contactDescription: 'Fragen, Vorschläge oder Interesse an unseren Produkten? Schreib uns.', contactCta: 'E-Mail senden',
      footerTagline: 'Unabhängige digitale Produkte für das echte Leben.', backTop: 'Nach oben ↑', rights: 'Alle Rechte vorbehalten.'
    }
  };

  const languageNames = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' };

  function setLanguage(language) {
    const dictionary = translations[language] || translations.pt;
    root.lang = language === 'pt' ? 'pt-BR' : language;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const translation = dictionary[element.dataset.i18n];
      if (translation) element.innerHTML = translation;
    });
    if (languageStatus) languageStatus.textContent = `Idioma alterado para ${languageNames[language] || languageNames.pt}`;
    storage.set('nexulvi-language', language);
  }

  function setTheme(theme) {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    themeToggle.firstElementChild.textContent = isDark ? '☼' : '◐';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#111613' : '#f7f8f4');
    storage.set('nexulvi-theme', isDark ? 'dark' : 'light');
  }

  function setMenu(open) {
    mobileNav.toggleAttribute('hidden', !open);
    mobileNav.toggleAttribute('inert', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  const savedLanguage = storage.get('nexulvi-language') || 'pt';
  languageSelect.value = translations[savedLanguage] ? savedLanguage : 'pt';
  setLanguage(languageSelect.value);
  const savedTheme = storage.get('nexulvi-theme');
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  languageSelect.addEventListener('change', (event) => setLanguage(event.target.value));
  themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  });
  matchMedia('(min-width: 641px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
})();
