'use strict';

const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config');
const siteUrl = new URL(process.env.SITE_URL || config.siteUrl);
if (!['https:', 'http:'].includes(siteUrl.protocol) || !siteUrl.pathname.endsWith('/')) throw new Error('siteUrl deve ser uma URL HTTP(S) com barra final.');
if (config.whatsapp && !/^[1-9]\d{9,14}$/.test(config.whatsapp)) throw new Error('WhatsApp inválido: use país, DDD e número, somente dígitos.');
const url = (file = '') => new URL(file, siteUrl).href;
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const contactUrl = (service) => {
  const message = service
    ? `Olá! Conheci a Nexulvi pelo site e gostaria de solicitar um orçamento para ${service.message}.`
    : 'Olá! Conheci a Nexulvi pelo site e gostaria de conversar sobre meu projeto.';
  return config.whatsapp
    ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`
    : `mailto:${config.email}?subject=${encodeURIComponent(service ? `Orçamento — ${service.name}` : 'Vamos conversar sobre meu projeto')}&body=${encodeURIComponent(message)}`;
};
const cta = (label = 'Solicitar um orçamento', service, className = 'button button-primary', placement = 'content') =>
  `<a class="${className}" href="${escape(contactUrl(service))}" data-track="quote_click" data-service="${service?.id || 'geral'}" data-placement="${placement}" data-channel="${config.whatsapp ? 'whatsapp' : 'email'}">${escape(label)}<span aria-hidden="true">↗</span></a>`;
const brand = `<a class="brand" href="./" aria-label="Nexulvi — início"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>NEXULVI</span></a>`;
const nav = `<a href="servicos.html">Serviços</a><a href="./#portfolio">Projetos</a><a href="./#products">Nossos apps</a><a href="sobre.html">O estúdio</a><a href="contato.html">Contato</a>`;
const header = `<a class="skip-link" href="#main-content">Pular para o conteúdo</a><header class="site-header sales-header" id="top">${brand}<nav class="desktop-nav" aria-label="Navegação principal">${nav}</nav><div class="header-tools">${cta('Vamos conversar', null, 'button button-primary header-cta', 'header')}<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Ativar modo escuro" aria-pressed="false"><span aria-hidden="true">◐</span></button><button class="menu-button" id="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="Navegação móvel" hidden inert>${nav}</nav></header>`;
function footer() {
  return `<footer class="site-footer page-shell sales-footer">
    <div class="footer-columns">
      <div>${brand}<p>Desenvolvimento digital com intenção.<br>Sites, sistemas e aplicativos para empresas.</p><p>${escape(config.city)} — ${escape(config.region)}, ${escape(config.country)}.<br>Atendimento local e remoto em todo o Brasil.</p></div>
      <div><h2>O que fazemos</h2>${config.services.map((s) => `<a href="${s.slug}.html">${escape(s.name)}</a>`).join('')}</div>
      <div><h2>Explore</h2><a href="./#portfolio">Portfólio e projetos</a><a href="aplicativos.html">Aplicativos próprios</a><a href="sobre.html">Sobre a Nexulvi</a><a href="contato.html">Contato</a><a href="privacidade.html">Privacidade do site</a></div>
      <div><h2>Vamos conversar</h2><a class="email-link" href="mailto:${escape(config.email)}">${escape(config.email)}</a>
        ${config.whatsapp ? `<a href="${escape(contactUrl())}">WhatsApp ↗</a>` : '<p>Orçamentos por e-mail.<br>Conte sua ideia para começar.</p>'}
        ${config.social.map((link) => `<a href="${escape(link)}" rel="noopener noreferrer">Rede oficial ↗</a>`).join('')}
        <div class="footer-apps">${config.apps.map((a) => `<a href="${a.id}.html">${escape(a.name)}</a>`).join('')}</div>
      </div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${escape(config.name)}. Todos os direitos reservados.</span><a href="#top">Voltar ao topo ↑</a></div>
    <nav aria-label="Orçamento rápido"><a class="mobile-quote" href="${escape(contactUrl())}" data-track="quote_click" data-channel="${config.whatsapp ? 'whatsapp' : 'email'}" data-placement="mobile">Conversar sobre meu projeto <span aria-hidden="true">↗</span></a></nav>
  </footer><script src="commercial.js" defer></script>`;
}
function head(title, description, file = '', extraSchema = []) {
  const graph = [
    { '@type': 'Organization', '@id': url('#organization'), name: config.name, url: url(), email: config.email,
      description: 'Estúdio de desenvolvimento de sites, sistemas e aplicativos em Birigui-SP, com atendimento a Araçatuba e todo o Brasil.',
      location: { '@type': 'Place', name: 'Birigui — São Paulo, Brasil' },
      areaServed: config.areas, ...(config.whatsapp ? { telephone: `+${config.whatsapp}` } : {}),
      ...(config.social.length ? { sameAs: config.social } : {}) },
    { '@type': 'WebSite', '@id': url('#website'), name: config.name, url: url(), inLanguage: 'pt-BR', publisher: { '@id': url('#organization') } },
    ...extraSchema
  ];
  if (file) graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: url() },
    { '@type': 'ListItem', position: 2, name: title.split(' | ')[0], item: url(file) }
  ] });
  return `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; form-action 'self'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="theme-color" content="#f7f8f4">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<link rel="canonical" href="${url(file)}"><meta property="og:url" content="${url(file)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="Nexulvi"><meta property="og:image" content="${url('assets/social-card.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Nexulvi — Sites, sistemas e aplicativos. Birigui-SP / Brasil."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${url('assets/social-card.png')}">
<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="manifest" href="site.webmanifest"><link rel="preload" href="assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="assets/fonts/fonts.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="commercial.css">
${config.searchConsoleVerification ? `<meta name="google-site-verification" content="${escape(config.searchConsoleVerification)}">` : ''}
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}
const paths = {
  window: '<rect x="3" y="4" width="22" height="19" rx="2"/><path d="M3 10h22M7 7h1m3 0h1M8 15h6m-6 4h11"/>',
  target: '<circle cx="14" cy="14" r="10"/><circle cx="14" cy="14" r="5"/><path d="m14 14 10-10m-5 0h5v5"/>',
  grid: '<rect x="4" y="4" width="8" height="8" rx="1"/><rect x="16" y="4" width="8" height="8" rx="1"/><rect x="4" y="16" width="8" height="8" rx="1"/><rect x="16" y="16" width="8" height="8" rx="1"/>',
  phone: '<rect x="7" y="2" width="14" height="24" rx="3"/><path d="M11 6h6m-4 16h2"/>',
  flow: '<rect x="2" y="10" width="7" height="8" rx="1"/><rect x="19" y="3" width="7" height="8" rx="1"/><rect x="19" y="19" width="7" height="7" rx="1"/><path d="M9 14h5V7h5m-5 7v9h5"/>'
};
function services() {
  return `<div class="services-grid">${config.services.map((s, i) => `<article class="service-card${i === 0 ? ' service-featured' : ''}"><div class="service-card-top"><svg width="32" height="32" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[s.icon]}</svg><span>0${i + 1}</span></div><h3><a href="${s.slug}.html" data-track="service_click" data-service="${s.id}">${escape(s.name)}</a></h3><p>${escape(s.short)}</p><div class="service-actions"><a href="${s.slug}.html" class="text-link">Conhecer solução <span aria-hidden="true">↗</span></a>${cta('Pedir orçamento', s, 'service-contact', 'service-card')}</div></article>`).join('')}<div class="service-card service-question"><span class="asterisk" aria-hidden="true">✳</span><h3>Ainda não sabe<br>qual caminho seguir?</h3><p>Não precisa saber o nome da solução. Comece contando sua necessidade.</p><a class="text-link" href="contato.html">Vamos descobrir juntos <span aria-hidden="true">↗</span></a></div></div>`;
}
function heroProof() {
  const project = config.portfolio.find((item) => item.authorized && item.image);
  if (!project) return `<div class="hero-proof-placeholder" aria-hidden="true">Sites feitos para necessidades reais.</div>`;
  return `<a class="hero-proof-image" href="#portfolio" aria-label="Ver o projeto ${escape(project.name)} no portfólio"><img src="${escape(project.image)}" width="1440" height="900" fetchpriority="high" alt="${escape(project.imageAlt)}"><span class="hero-proof-badge"><span class="status-dot" aria-hidden="true"></span> ${escape(project.type.toUpperCase())} · PROJETO REAL</span></a><div class="hero-proof-caption"><span>UM SITE PARA UM SERVIÇO LOCAL</span><span>${escape(project.name.toUpperCase())} ↗</span></div>`;
}
function portfolio() {
  return config.portfolio.filter((project) => project.authorized).map((project, index) =>
    `<section class="proof-section" id="${index === 0 ? 'portfolio' : `projeto-${index + 1}`}" aria-labelledby="proof-title-${index + 1}"><div class="page-shell proof-grid"><div><p class="eyebrow">${escape(project.client || 'PROJETO AUTORIZADO')} · ${escape(project.type.toUpperCase())}</p><h2 id="proof-title-${index + 1}">${escape(project.caseTitle || 'Um projeto real, pensado para')} <em>${escape(project.caseEmphasis || 'dar o próximo passo.')}</em></h2></div><div class="proof-copy"><p>${escape(project.caseIntro || project.description)}</p>${project.caseHighlights?.length ? `<ul>${project.caseHighlights.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}<p class="proof-disclosure">${escape(project.caseDisclosure || 'Projeto divulgado com autorização. Não representa métricas ou resultados não verificados.')}</p><div class="proof-actions"><a class="text-link" href="${escape(project.url)}" data-track="project_click" data-project="${escape(project.name)}" rel="noopener noreferrer">Visitar ${escape(project.name)} ↗</a><a class="text-link" href="#servicos">Quero conversar sobre um site <span aria-hidden="true">↓</span></a></div></div></div></section>`
  ).join('');
}
const faq = [
  ['Quanto custa desenvolver um site?', 'O valor depende do número de páginas, dos conteúdos, das funcionalidades e das integrações. Depois de entender sua necessidade, apresentamos uma proposta com escopo e condições. Não há um preço único que sirva para todos os projetos.'],
  ['A Nexulvi atende empresas de Araçatuba?', 'Sim. Nossa base é Birigui-SP e atendemos Araçatuba e a região noroeste paulista. A forma de atendimento e eventuais encontros são combinados conforme a necessidade e a disponibilidade.'],
  ['Vocês atendem clientes de outras cidades?', 'Sim. O atendimento remoto permite conversar, planejar e acompanhar projetos de qualquer cidade do Brasil. Alinhamos os canais de comunicação no início do trabalho.'],
  ['Posso solicitar um sistema personalizado?', 'Sim. Primeiro mapeamos o processo que você quer melhorar, as pessoas que usarão o sistema e as funcionalidades necessárias. A viabilidade e o escopo são avaliados antes do orçamento.'],
  ['Vocês desenvolvem aplicativos Android?', 'Sim. Desenvolvemos aplicativos Android e avaliamos outras plataformas conforme a viabilidade do projeto. Publicação, contas nas lojas e serviços externos têm condições específicas.'],
  ['Como funciona o orçamento?', 'Conte o que sua empresa faz, o problema que quer resolver e o que espera do projeto. Se já tiver referências, pode compartilhá-las. Conversamos para esclarecer os detalhes e definir uma proposta, sem coletar dados desnecessários.'],
  ['Quem é responsável pelo domínio e hospedagem?', 'Essas responsabilidades são definidas na proposta. Preferimos que o cliente mantenha a titularidade do domínio e das contas de infraestrutura. Registro, renovação, hospedagem e serviços de terceiros podem ter custos recorrentes, informados previamente.'],
  ['O site poderá ser atualizado futuramente?', 'Sim. A forma de atualização depende da solução contratada. Podemos planejar edição de conteúdo ou futuras evoluções. Manutenção, suporte e novas funcionalidades têm escopo e condições próprios.']
];
function finalCta() {
  return `<section class="contact page-shell" id="contact" aria-labelledby="contact-title"><div class="contact-panel"><div><p class="eyebrow">VAMOS CONSTRUIR O PRÓXIMO PASSO?</p><h2 id="contact-title">Sua próxima ideia<br>merece <em>sair do papel.</em></h2><p>Seja um site para sua empresa, um sistema para organizar processos ou um aplicativo personalizado, a Nexulvi pode ajudar você a planejar e desenvolver sua solução.</p></div><div>${cta('Conversar sobre meu projeto', null, 'button button-light', 'final')}<p class="channel-note">${config.whatsapp ? 'Conversa pelo WhatsApp. Sem formulário.' : 'Contato por e-mail. Sem formulário.'}</p></div></div></section>`;
}
function siteFormats() {
  return `<section class="site-formats" aria-labelledby="site-formats-title"><p class="eyebrow">DOIS FORMATOS PARA COMEÇAR</p><h2 id="site-formats-title">O tamanho certo para o seu momento.</h2><p class="formats-intro">Os formatos ajudam a iniciar a conversa. O escopo final é definido com você, sem pacote fechado que não considere as necessidades do negócio.</p><div class="formats-grid"><article><span class="format-index">01 / PRESENÇA ESSENCIAL</span><h3>Site de uma página</h3><p>Para apresentar um serviço ou negócio com uma narrativa direta e um próximo passo claro.</p><ul><li>Apresentação do negócio e da oferta</li><li>Seções definidas conforme o conteúdo necessário</li><li>Chamada para contato contextualizada</li></ul></article><article><span class="format-index">02 / EMPRESA COMPLETA</span><h3>Site institucional</h3><p>Para organizar diferentes áreas, serviços e informações em páginas próprias.</p><ul><li>Páginas organizadas por assunto</li><li>Serviços, empresa, contato e conteúdo relevante</li><li>Navegação planejada para celular e computador</li></ul></article></div><div class="proposal-clarity"><div><h3>O que deixa a proposta clara</h3><p>Quantidade de páginas, conteúdo, recursos e integrações incluídos — e o que fica fora do escopo.</p></div><div><h3>Custos recorrentes sem surpresa</h3><p>Domínio, hospedagem, ferramentas de terceiros e manutenção são discriminados quando aplicáveis.</p></div><div><h3>O que você pode preparar</h3><p>Uma descrição do negócio, serviços prioritários, região atendida, fotos e referências ajudam a planejar. Se algo ainda não existe, conversamos sobre isso.</p></div></div><p class="format-note">O orçamento é elaborado após entender o projeto. Não há preço único, prazo ou resultado de busca garantido.</p></section>`;
}
function appCards(root) {
  const catalog = fs.readFileSync(path.join(root, 'aplicativos.html'), 'utf8');
  const cards = catalog.match(/<article class="product-card[\s\S]*?<\/article>/g);
  if (!cards || cards.length !== config.apps.length) throw new Error('Inventário dos aplicativos divergente.');
  for (const app of config.apps) {
    if (!cards.some((card) => card.includes(`href="${app.id}.html"`) && card.includes(`<h3>${app.name}</h3>`) && card.includes(app.status.toUpperCase()))) throw new Error(`Aplicativo ou status perdido: ${app.name}`);
  }
  return `<div class="product-grid">${cards.join('\n').replace(/ data-i18n="[^"]+"/g, '').replace(/class="product-link" href="([^"]+)"/g, 'class="product-link" data-track="project_click" href="$1"')}</div>`;
}
function page(title, description, file, heading, intro, content, schema = []) {
  return `<!doctype html><html lang="pt-BR" data-theme="light"><head>${head(title, description, file, schema)}</head><body class="commercial">${header}<main id="main-content" tabindex="-1"><section class="page-shell inner-hero"><nav class="breadcrumbs" aria-label="Caminho de navegação"><a href="./">Início</a><span aria-hidden="true">/</span><span aria-current="page">${escape(title.split(' | ')[0])}</span></nav><p class="eyebrow">NEXULVI / BIRIGUI — SP / BRASIL</p><h1>${heading}</h1><p class="inner-lead">${intro}</p></section>${content}${finalCta()}</main>${footer()}</body></html>`;
}
function generate(output, root) {
  const write = (file, html) => fs.writeFileSync(path.join(output, file), html);
  const blocks = {
    HEAD: head('Criação de Sites em Birigui e Araçatuba | Nexulvi', 'Sites profissionais para empresas e prestadores de serviços. Base em Birigui-SP, atendimento em Araçatuba e em todo o Brasil. Converse com a Nexulvi.'),
    HEADER: header, HERO_CTA: cta(config.whatsapp ? 'Pedir orçamento pelo WhatsApp' : 'Pedir orçamento', config.services.find((service) => service.id === 'sites'), 'button button-primary', 'hero'),
    HERO_PROOF: heroProof(), SERVICES: services(), PORTFOLIO: portfolio(), APPS: appCards(root),
    FAQ: faq.map(([q, a]) => `<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join(''),
    FINAL_CTA: finalCta(), FOOTER: footer()
  };
  let home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [name, value] of Object.entries(blocks)) {
    if (!home.includes(`<!--${name}-->`)) throw new Error(`Bloco ausente na home: ${name}`);
    home = home.replace(`<!--${name}-->`, () => value);
  }
  // Renderiza as opções já existentes sem reconstruir o seletor no navegador.
  const catalog = fs.readFileSync(path.join(root, 'aplicativos.html'), 'utf8');
  const languageSelect = catalog.match(/<select id="language-select"[\s\S]*?<\/select>/)?.[0];
  if (!languageSelect) throw new Error('Seletor de idiomas original ausente.');
  home = home.replace(/<select id="language-select"[\s\S]*?<\/select>/, () => languageSelect.replace('id="language-select"', 'id="language-select" data-catalog-language'));
  write('index.html', home);
  const generated = ['index.html'];
  for (const s of config.services) {
    const file = `${s.slug}.html`;
    write(file, page(s.title, s.description, file, escape(s.headline), escape(s.intro),
      `<section class="page-shell detail-content"><div class="detail-summary"><div><h2>Para quem faz sentido</h2><p>${escape(s.audience)}</p></div><aside><p class="eyebrow">SEU PRÓXIMO PASSO</p><h2>Conte o que você precisa.</h2>${cta(undefined, s)}<p class="channel-note">Contato por ${config.whatsapp ? 'WhatsApp' : 'e-mail'}.</p></aside></div>${s.id === 'sites' ? siteFormats() : ''}<h2>O que podemos construir juntos</h2><div class="values-grid">${s.deliverables.map(([h, p], i) => `<article><span class="value-index">0${i + 1}</span><h3>${escape(h)}</h3><p>${escape(p)}</p></article>`).join('')}</div><div class="planning-note"><h2>Antes de começar</h2><p>${escape(s.planning)}</p><p>Base em ${escape(config.city)}-${escape(config.region)}. Atendimento a ${escape(config.areas.join(', '))}.</p><a class="text-link" href="./#processo">Conheça as etapas de contratação ↗</a></div><h2>Outras soluções para sua empresa</h2><nav class="related-services" aria-label="Serviços relacionados">${config.services.filter((other) => other.id !== s.id).map((other) => `<a href="${other.slug}.html">${escape(other.name)} ↗</a>`).join('')}</nav></section>`,
      [{ '@type': 'Service', name: s.name, serviceType: s.name, description: s.short, url: url(file), provider: { '@id': url('#organization') }, areaServed: config.areas }]));
    generated.push(file);
  }
  const extra = {
    'servicos.html': page('Serviços de desenvolvimento digital | Nexulvi', 'Sites, landing pages, sistemas, aplicativos e automações. Conheça as soluções da Nexulvi de Birigui-SP, com atendimento local e nacional.', 'servicos.html', 'Seu desafio.<br><em>A solução certa.</em>', 'Do site institucional ao sistema personalizado, a tecnologia precisa fazer sentido para a sua empresa.', `<section class="page-shell detail-content">${services()}</section>`),
    'sobre.html': page('Sobre a Nexulvi — Estúdio em Birigui-SP | Nexulvi', 'Conheça a Nexulvi, estúdio de desenvolvimento de sites, sistemas e aplicativos de Birigui-SP. Projetos próprios, comunicação próxima e soluções sob medida.', 'sobre.html', 'De Birigui.<br><em>Para novas possibilidades.</em>', 'A Nexulvi une desenvolvimento, design e atenção às pessoas para transformar necessidades reais em soluções digitais.', `<section class="page-shell prose-content"><h2>Um estúdio em construção, com trabalho para mostrar.</h2><p>Estamos iniciando nossa atuação comercial com experiência prática em desenvolvimento e projetos próprios. Criamos sites, landing pages, sistemas web, aplicativos e integrações, com escopo planejado para cada necessidade.</p><h2>Clareza é parte da entrega.</h2><p>Uma boa parceria começa por entender o problema. Priorizamos comunicação próxima, condições explícitas e participação do cliente nas validações. A tecnologia é um meio para construir algo útil, não um fim em si mesma.</p><h2>Produtos que também nascem aqui.</h2><p>Alongaê, ArqVello, Coflira, Miauforia e Sentinela são iniciativas próprias, em diferentes estágios de desenvolvimento. Não são apresentados como trabalhos contratados nem como aplicativos já lançados.</p><a class="text-link" href="aplicativos.html">Conhecer os aplicativos ↗</a><h2>Atendimento local e nacional.</h2><p>Nossa base é Birigui-SP. Atendemos Araçatuba, a região noroeste paulista e clientes de todo o Brasil remotamente. A forma de acompanhamento é combinada conforme cada projeto.</p></section>`),
    'contato.html': page('Contato e orçamento de sites e sistemas | Nexulvi', 'Converse com a Nexulvi sobre seu site, sistema ou aplicativo. Base em Birigui-SP, atendimento a Araçatuba e todo o Brasil. Solicite uma proposta.', 'contato.html', 'Toda boa solução<br>começa com um <em>olá.</em>', 'Conte sua ideia, o que precisa melhorar e para quem é o projeto. Não precisa ter tudo definido para começar a conversa.', `<section class="page-shell detail-content"><div class="contact-options"><article><p class="eyebrow">CONTATO DIRETO</p><h2>Vamos falar do seu projeto.</h2>${cta()}<p>Ou envie um e-mail para:</p><a class="email-link" href="mailto:${escape(config.email)}">${escape(config.email)}</a><p>${config.whatsapp ? 'O botão abre uma conversa com mensagem pronta no WhatsApp.' : 'Enquanto o WhatsApp não está disponível, atendemos por este e-mail. O botão abre seu aplicativo de e-mail; você também pode copiar o endereço.'}</p><button type="button" class="copy-email" data-copy-email="${escape(config.email)}">Copiar e-mail</button><p class="copy-status" role="status"></p></article><article><p class="eyebrow">PARA FACILITAR A CONVERSA</p><h2>O que vale compartilhar</h2><ul><li>O que sua empresa faz e onde atende.</li><li>O problema ou oportunidade que motivou o projeto.</li><li>Se precisa de site, sistema, aplicativo ou ainda quer avaliar.</li><li>Referências e necessidades que já conhece.</li></ul><p>Não envie senhas, documentos pessoais ou informações sensíveis no primeiro contato.</p><p>Base: Birigui — São Paulo. Atendimento: Birigui, Araçatuba, região e todo o Brasil. Não divulgamos endereço de escritório aberto ao público.</p></article></div></section>`),
    'privacidade.html': page('Privacidade do site | Nexulvi', 'Entenda o tratamento de dados no site institucional da Nexulvi: hospedagem estática, preferências locais, contatos externos e ausência de rastreamento publicitário.', 'privacidade.html', 'Privacidade com<br><em>transparência.</em>', 'Esta página trata do site institucional da Nexulvi. As políticas dos aplicativos são específicas e continuam disponíveis em suas páginas.',
      `<section class="page-shell prose-content"><h2>Navegação e hospedagem</h2><p>Este site é estático e hospedado no GitHub Pages. Não possui cadastro, formulário de captação, cookies publicitários ou scripts de analytics instalados pela Nexulvi. O provedor de hospedagem pode processar dados técnicos de acesso, como endereço IP, para operação e segurança. Consulte a <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener noreferrer">declaração de privacidade do GitHub</a>.</p><h2>Preferências no dispositivo</h2><p>O tema visual e a escolha de idioma podem ser armazenados no localStorage do seu navegador. São preferências locais, sem envio pela Nexulvi a um servidor de analytics. Você pode apagá-las pelas configurações do navegador.</p><h2>Contato por e-mail e WhatsApp</h2><p>Ao escolher um contato externo, você passa a utilizar seu provedor de e-mail ou o WhatsApp, quando disponível, sujeitos às respectivas políticas. As informações que você enviar serão usadas para responder à solicitação e avaliar o projeto, ou para cumprir obrigações decorrentes de eventual contratação. Compartilhe somente o necessário. Não há formulário ou banco de contatos neste site.</p><h2>Mensuração futura</h2><p>Os links têm identificadores técnicos para permitir uma futura integração de métricas. Atualmente, eventos ficam apenas na página durante a navegação: não são armazenados nem enviados. Qualquer futura ferramenta deverá ser avaliada quanto à finalidade, base legal, dados tratados e eventual necessidade de consentimento, com atualização desta política antes da ativação.</p><h2>Solicitações sobre seus dados</h2><p>Você pode pedir esclarecimentos, acesso, correção ou exclusão de informações enviadas no contato, respeitadas as obrigações legais aplicáveis. Fale com a Nexulvi em <a class="email-link" href="mailto:${escape(config.email)}">${escape(config.email)}</a>. Os dados de conversas não são mantidos além do necessário às finalidades informadas e às obrigações aplicáveis.</p><h2>Políticas dos aplicativos</h2><ul><li><a href="privacidade-alongae.html">Alongaê</a></li><li><a href="privacidade-miauforia.html">Miauforia</a></li><li><a href="privacidade-sentinela.html">Sentinela</a></li></ul></section>`)
  };
  for (const [file, html] of Object.entries(extra)) { write(file, html); generated.push(file); }
  return generated;
}
module.exports = { generate, siteUrl: siteUrl.href, contactUrl, escape };
