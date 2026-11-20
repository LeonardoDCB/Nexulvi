'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const vm = require('node:vm');
const commercial = require('./commercial');
const config = require('../site.config');

const root = path.resolve(__dirname, '..');
const output = process.env.BUILD_OUTPUT ? path.resolve(process.env.BUILD_OUTPUT) : path.join(root, 'dist');
if (output === root || !path.relative(root, output) || path.relative(root, output).startsWith('..') || path.isAbsolute(path.relative(root, output))) throw new Error('BUILD_OUTPUT precisa apontar para uma pasta de build dentro do projeto.');
const publicFiles = [
  '404.html', 'alongae.html', 'apps.css', 'apps.js', 'arqvello.html', 'coflira.html',
  'favicon.svg', 'index.html', 'language-picker.js', 'miauforia.html', 'privacidade-alongae.html',
  'privacidade-miauforia.html', 'privacidade-sentinela.html', 'robots.txt', 'script.js',
  'sentinela.html', 'site.webmanifest', 'sitemap.xml', 'styles.css',
  'aplicativos.html', 'commercial.css', 'commercial.js'
];
const localizedPages = [
  'index.html', 'alongae.html', 'arqvello.html', 'coflira.html', 'sentinela.html',
  'miauforia.html', 'privacidade-alongae.html', 'privacidade-miauforia.html',
  'privacidade-sentinela.html', '404.html'
];
const siteUrl = commercial.siteUrl.replace(/\/$/, '');
const expectedLocales = ['de-DE', 'en-GB', 'en-US', 'es-419', 'es-ES', 'fr-FR', 'hi-IN', 'id', 'it-IT', 'ja-JP', 'ko-KR', 'nl-NL', 'pl-PL', 'pt-PT', 'tr-TR'];
const translationSources = [...localizedPages, 'apps.js', 'script.js'];
function sourceDigest() {
  const hash = crypto.createHash('sha256');
  // O catálogo original foi movido sem mudanças. Mantemos o identificador histórico
  // do digest: as traduções continuam correspondendo exatamente à mesma fonte.
  for (const file of translationSources) hash.update(file).update('\0').update(fs.readFileSync(path.join(root, file === 'index.html' ? 'aplicativos.html' : file), 'utf8').replace(/\r\n/g, '\n'));
  return hash.digest('hex');
}
function validateLocalReferences(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1].replace(/&amp;/g, '&');
    if (!reference || reference.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(reference)) continue;
    const pathname = reference.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const basePath = new URL(commercial.siteUrl).pathname;
    if (pathname.startsWith('/') && !pathname.startsWith(basePath)) throw new Error(`Caminho fora da base ${basePath}: ${reference}`);
    const target = pathname.startsWith('/')
      ? path.join(output, pathname.slice(basePath.length))
      : path.resolve(path.dirname(file), pathname);
    if (!fs.existsSync(target)) throw new Error(`Recurso local não encontrado: ${path.relative(output, file)} -> ${reference}`);
  }
}

async function minify(file, loader) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const result = await esbuild.transform(source, { loader, minify: true, legalComments: 'none', target: 'es2020' });
  fs.writeFileSync(path.join(output, file), result.code);
}

async function build() {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(path.join(output, 'assets'), { recursive: true });

  for (const file of publicFiles) {
    const source = path.join(root, file);
    if (!fs.existsSync(source)) throw new Error(`Arquivo público ausente: ${file}`);
    fs.copyFileSync(source, path.join(output, file));
  }

  fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), {
    recursive: true,
    filter: (source) => !source.split(path.sep).includes('vendor')
  });
  const localized = path.join(root, 'localized');
  if (!fs.existsSync(localized)) throw new Error('Traduções não geradas. Execute node scripts/generate-locales.js antes do build.');
  const manifestPath = path.join(localized, 'manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error('Manifesto das traduções ausente; execute npm run localize.');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.sourceDigest !== sourceDigest()) throw new Error('O conteúdo-fonte mudou desde a última tradução; execute npm run localize e revise as alterações.');
  if (!Array.isArray(manifest.locales) || [...manifest.locales].sort().join('|') !== expectedLocales.join('|')) throw new Error('O manifesto não contém todos os idiomas esperados; execute npm run localize.');
  const pickerSource = fs.readFileSync(path.join(root, 'language-picker.js'), 'utf8');
  for (const locale of ['pt-BR', ...expectedLocales]) {
    if (!pickerSource.includes(`'${locale}'`)) throw new Error(`Idioma ausente no seletor: ${locale}`);
  }
  const localeDirectories = fs.readdirSync(localized, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (localeDirectories.length !== 15) throw new Error(`Esperados 15 diretórios localizados; encontrados ${localeDirectories.length}.`);
  if (localeDirectories.join('|') !== expectedLocales.join('|')) throw new Error(`Catálogo de idiomas inesperado: ${localeDirectories.join(', ')}`);
  for (const locale of localeDirectories) {
    for (const page of localizedPages) {
      const localizedPage = path.join(localized, locale, page);
      if (!fs.existsSync(localizedPage)) throw new Error(`Página localizada ausente: ${locale}/${page}`);
      const html = fs.readFileSync(localizedPage, 'utf8');
      if (!new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, 'i').test(html)) throw new Error(`Atributo lang inválido: ${locale}/${page}`);
      if (!html.includes('src="../language-picker.js"')) throw new Error(`Seletor de idioma ausente: ${locale}/${page}`);
      if (['alongae.html', 'arqvello.html', 'coflira.html', 'sentinela.html'].includes(page) && !html.includes('src="app-data.js"')) {
        throw new Error(`Traduções dinâmicas do app ausentes: ${locale}/${page}`);
      }
    }
    const appDataPath = path.join(localized, locale, 'app-data.js');
    if (!fs.existsSync(appDataPath)) throw new Error(`Dados localizados dos aplicativos ausentes: ${locale}/app-data.js`);
    const appData = fs.readFileSync(appDataPath, 'utf8');
    try { new Function(appData); } catch (error) { throw new Error(`JavaScript de tradução inválido em ${locale}/app-data.js: ${error.message}`); }
    for (const app of ['alongae', 'arqvello', 'coflira', 'sentinela']) {
      if (!appData.includes(`"${app}"`)) throw new Error(`Conteúdo do app ausente: ${locale}/${app}`);
    }
  }
  for (const locale of localeDirectories) {
    fs.cpSync(path.join(localized, locale), path.join(output, locale), {
      recursive: true,
      filter: (source) => path.basename(source) !== '.source-digest'
    });
  }
  const generatedPages = commercial.generate(output, root);
  for (const page of [...localizedPages, ...generatedPages, 'aplicativos.html']) validateLocalReferences(path.join(output, page));
  for (const locale of localeDirectories) {
    for (const page of localizedPages) validateLocalReferences(path.join(output, locale, page));
  }
  const locales = ['pt-BR', ...localeDirectories];
  for (const page of localizedPages.filter((entry) => entry !== '404.html')) {
    const file = path.join(output, page === 'index.html' ? 'aplicativos.html' : page);
    let html = fs.readFileSync(file, 'utf8');
    const alternates = locales.map((locale) => {
      const url = locale === 'pt-BR'
        ? `${siteUrl}/${page === 'index.html' ? 'aplicativos.html' : page}`
        : `${siteUrl}/${locale}/${page === 'index.html' ? '' : page}`;
      return `<link rel="alternate" hreflang="${locale}" href="${url}">`;
    }).join('') + `<link rel="alternate" hreflang="x-default" href="${siteUrl}/${page === 'index.html' ? 'aplicativos.html' : page}">`;
    html = html.replace(/<\/head>/i, `${alternates}</head>`);
    fs.writeFileSync(file, html);
  }
  const sitemapEntries = [];
  for (const page of localizedPages.filter((entry) => entry !== '404.html')) {
    const urls = Object.fromEntries(locales.map((locale) => [
      locale,
      locale === 'pt-BR'
        ? `${siteUrl}/${page === 'index.html' ? 'aplicativos.html' : page}`
        : `${siteUrl}/${locale}/${page === 'index.html' ? '' : page}`
    ]));
    const alternates = Object.entries(urls).map(([locale, url]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${url}"/>`).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urls['pt-BR']}"/>`;
    sitemapEntries.push(...Object.values(urls).map((url) => `  <url>\n    <loc>${url}</loc>\n${alternates}\n${xDefault}\n  </url>`));
  }
  sitemapEntries.push(...generatedPages.map((file) => `  <url><loc>${siteUrl}/${file === 'index.html' ? '' : file}</loc></url>`));
  fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries.join('\n')}\n</urlset>\n`);
  finalizePages(output, localeDirectories);
  fs.writeFileSync(path.join(output, 'robots.txt'), `# Em um project site, este arquivo não controla o robots.txt da raiz do host.\nUser-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  fs.writeFileSync(path.join(output, '.nojekyll'), '');
  await Promise.all([
    ...['styles.css', 'apps.css', 'commercial.css'].map((file) => minify(file, 'css')),
    ...['script.js', 'apps.js', 'commercial.js', 'language-picker.js'].map((file) => minify(file, 'js'))
  ]);
  console.log(`Build concluído em ${output}`);
}

function finalizePages(directory, locales) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of files) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { finalizePages(file, locales); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const relative = path.relative(output, file).replace(/\\/g, '/');
    let html = fs.readFileSync(file, 'utf8');
    html = html.replaceAll('https://leonardodcb.github.io/Nexulvi', siteUrl);
    html = html.replaceAll('leonardodacostabonfim@gmail.com', commercial.escape(config.email));
    const locale = locales.find((code) => relative.startsWith(`${code}/`));
    // As traduções antigas de index.html são o catálogo, não a home comercial.
    if (locale) html = html.replace(new RegExp(`(<link rel="alternate" hreflang="(?:pt-BR|x-default)" href=")${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(">)`, 'g'), `$1${siteUrl}/aplicativos.html$2`);
    const isCatalog = relative === 'aplicativos.html' || (locale && entry.name === 'index.html');
    if (relative === 'aplicativos.html') {
      html = html.replace(/(<link rel="canonical" href=")[^"]+"/, `$1${siteUrl}/aplicativos.html"`)
        .replace(/(<meta property="og:url" content=")[^"]+"/, `$1${siteUrl}/aplicativos.html"`);
    }
    if (isCatalog) {
      const home = locale ? '../' : './';
      html = html.replace('<main id="main-content">', `<aside class="catalog-back page-shell"><a href="${home}">Nexulvi · Sites, sistemas e aplicativos em Birigui-SP ↗ <span lang="en">(Services / Serviços)</span></a></aside><main id="main-content">`);
    }
    // Corrige a antiga âncora inexistente sem alterar fontes de tradução.
    html = html.replaceAll('index.html#solutions', locale ? 'index.html#products' : './#products');
    // Pré-renderiza o conteúdo existente dos apps, sem alterar suas funcionalidades.
    const app = html.match(/<body[^>]*data-app="([^"]+)"/)?.[1];
    if (app) {
      let pages;
      if (locale) {
        const sandbox = { window: {} };
        vm.runInNewContext(fs.readFileSync(path.join(output, locale, 'app-data.js'), 'utf8'), sandbox, { timeout: 1000 });
        pages = sandbox.window.__NEXULVI_APP_TRANSLATIONS;
      } else {
        const source = fs.readFileSync(path.join(root, 'apps.js'), 'utf8');
        const match = source.match(/const pages=window\.__NEXULVI_APP_TRANSLATIONS\|\|?(\{[\s\S]*?\n\s*\};)\s*const app=/);
        if (!match) throw new Error('Fonte de dados dos aplicativos não encontrada.');
        pages = vm.runInNewContext(`(${match[1].replace(/;\s*$/, '')})`, {}, { timeout: 1000 });
      }
      const text = pages[app].pt;
      const values = { ...text,
        features: text.features.map(([h, p], i) => `<article class="feature"><span class="feature-number">0${i + 1}</span><h3>${commercial.escape(h)}</h3><p>${commercial.escape(p)}</p></article>`).join(''),
        flow: text.flow.map((item, i) => `<div class="flow-step"><strong>0${i + 1}</strong><span>${commercial.escape(item)}</span></div>`).join(''),
        chips: text.chips.map((item) => `<span>${commercial.escape(item)}</span>`).join(''),
        faq: text.faq.map(([q, a]) => `<details><summary>${commercial.escape(q)}</summary><p>${commercial.escape(a)}</p></details>`).join('')
      };
      html = html.replace(/(<([a-z][\w-]*)\b[^>]*data-copy="([^"]+)"[^>]*>)\s*(<\/\2>)/gi, (_all, open, _tag, key, close) => {
        if (typeof values[key] !== 'string') throw new Error(`Conteúdo do app ausente: ${app}/${key}`);
        return open + values[key] + close;
      });
    }
    if (entry.name === '404.html') {
      const prefix = new URL(commercial.siteUrl).pathname;
      html = html.replace(/\b(href|src)="(assets\/[^"]+|favicon\.svg|language-picker\.js|index\.html)"/g, (_all, attr, resource) => `${attr}="${prefix}${resource === 'index.html' ? '' : resource}"`);
      // Mesmo uma URL inválida aninhada precisa carregar a fonte e o seletor.
      html = html.replace(/\b(href|src)="\.\.\/(assets\/[^"]+|favicon\.svg|language-picker\.js)"/g, (_all, attr, resource) => `${attr}="${prefix}${resource}"`);
    }
    if (!html.includes('name="twitter:card"')) html = html.replace('</head>', '<meta name="twitter:card" content="summary"></head>');
    if (!html.includes('rel="icon"')) html = html.replace('</head>', `<link rel="icon" href="${locale ? '../' : ''}favicon.svg" type="image/svg+xml"></head>`);
    fs.writeFileSync(file, html);
    validateLocalReferences(file);
  }
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
