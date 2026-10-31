'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const output = process.env.BUILD_OUTPUT ? path.resolve(process.env.BUILD_OUTPUT) : path.join(root, 'dist');
const publicFiles = [
  '404.html', 'alongae.html', 'apps.css', 'apps.js', 'arqvello.html', 'coflira.html',
  'favicon.svg', 'index.html', 'language-picker.js', 'miauforia.html', 'privacidade-alongae.html',
  'privacidade-miauforia.html', 'privacidade-sentinela.html', 'robots.txt', 'script.js',
  'sentinela.html', 'site.webmanifest', 'sitemap.xml', 'styles.css'
];
const localizedPages = [
  'index.html', 'alongae.html', 'arqvello.html', 'coflira.html', 'sentinela.html',
  'miauforia.html', 'privacidade-alongae.html', 'privacidade-miauforia.html',
  'privacidade-sentinela.html', '404.html'
];
const siteUrl = 'https://leonardodcb.github.io/Nexulvi';
const expectedLocales = ['de-DE', 'en-GB', 'en-US', 'es-419', 'es-ES', 'fr-FR', 'hi-IN', 'id', 'it-IT', 'ja-JP', 'ko-KR', 'nl-NL', 'pl-PL', 'pt-PT', 'tr-TR'];
const translationSources = [...localizedPages, 'apps.js', 'script.js'];
function sourceDigest() {
  const hash = crypto.createHash('sha256');
  for (const file of translationSources) hash.update(file).update('\0').update(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n'));
  return hash.digest('hex');
}
function validateLocalReferences(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1].replace(/&amp;/g, '&');
    if (!reference || reference.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(reference)) continue;
    const pathname = reference.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const target = pathname.startsWith('/')
      ? path.join(output, pathname.replace(/^\/+/, ''))
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
  for (const page of localizedPages) validateLocalReferences(path.join(output, page));
  for (const locale of localeDirectories) {
    for (const page of localizedPages) validateLocalReferences(path.join(output, locale, page));
  }
  const locales = ['pt-BR', ...localeDirectories];
  for (const page of localizedPages.filter((entry) => entry !== '404.html')) {
    const file = path.join(output, page);
    let html = fs.readFileSync(file, 'utf8');
    const alternates = locales.map((locale) => {
      const url = locale === 'pt-BR'
        ? `${siteUrl}/${page === 'index.html' ? '' : page}`
        : `${siteUrl}/${locale}/${page === 'index.html' ? '' : page}`;
      return `<link rel="alternate" hreflang="${locale}" href="${url}">`;
    }).join('') + `<link rel="alternate" hreflang="x-default" href="${siteUrl}/${page === 'index.html' ? '' : page}">`;
    html = html.replace(/<\/head>/i, `${alternates}</head>`);
    fs.writeFileSync(file, html);
  }
  const sitemapEntries = [];
  for (const page of localizedPages.filter((entry) => entry !== '404.html')) {
    const urls = Object.fromEntries(locales.map((locale) => [
      locale,
      locale === 'pt-BR'
        ? `${siteUrl}/${page === 'index.html' ? '' : page}`
        : `${siteUrl}/${locale}/${page === 'index.html' ? '' : page}`
    ]));
    const alternates = Object.entries(urls).map(([locale, url]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${url}"/>`).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urls['pt-BR']}"/>`;
    sitemapEntries.push(...Object.values(urls).map((url) => `  <url>\n    <loc>${url}</loc>\n${alternates}\n${xDefault}\n  </url>`));
  }
  fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapEntries.join('\n')}\n</urlset>\n`);
  await Promise.all([
    ...['styles.css', 'apps.css'].map((file) => minify(file, 'css')),
    ...['script.js', 'apps.js'].map((file) => minify(file, 'js'))
  ]);
  console.log(`Build concluído em ${output}`);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
