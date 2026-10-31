'use strict';

// Generates committed, static language variants. Google Translate is used only
// while generating the files; visitors never send page content to a translator.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'localized');
const translationCachePath = path.join(root, '.localization-cache.json');
const siteUrl = 'https://leonardodcb.github.io/Nexulvi';
const locales = [
  ['pt-BR', 'pt-BR'], ['en-US', 'en-US'], ['es-ES', 'es-ES'], ['en-GB', 'en-GB'],
  ['es-419', 'es-419'], ['de-DE', 'de-DE'], ['fr-FR', 'fr-FR'], ['it-IT', 'it-IT'],
  ['pt-PT', 'pt-PT'], ['nl-NL', 'nl-NL'], ['ja-JP', 'ja-JP'], ['ko-KR', 'ko-KR'],
  ['hi-IN', 'hi-IN'], ['id', 'id'], ['tr-TR', 'tr-TR'], ['pl-PL', 'pl-PL']
];
const htmlFiles = [
  'index.html', 'alongae.html', 'arqvello.html', 'coflira.html', 'sentinela.html',
  'miauforia.html', 'privacidade-alongae.html', 'privacidade-miauforia.html',
  'privacidade-sentinela.html', '404.html'
];
let savedTranslations = {};
try { savedTranslations = JSON.parse(fs.readFileSync(translationCachePath, 'utf8')); } catch { /* Start with an empty cache. */ }
const textCache = new Map(Object.entries(savedTranslations));
const persistTranslationCache = () => fs.writeFileSync(translationCachePath, JSON.stringify(Object.fromEntries(textCache)));
function shieldBrands(value) {
  const protectedNames = [];
  const text = value.replace(/Nexulvi|Alongaê|ArqVello|Coflira|Sentinela|Miauforia/gi, (brand) => {
    const marker = `ZXQNXV${protectedNames.length}QXZ`;
    protectedNames.push([marker, brand]);
    return marker;
  });
  return { text, restore: (translated) => protectedNames.reduce((result, [marker, brand]) => result.replace(new RegExp(marker, 'gi'), brand), translated) };
}
const translationSources = [...htmlFiles, 'apps.js', 'script.js'];
function sourceDigest() {
  const hash = crypto.createHash('sha256');
  for (const file of translationSources) hash.update(file).update('\0').update(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n'));
  return hash.digest('hex');
}
const entityMap = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const decode = (value) => value.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity) => entityMap[entity]);
const encode = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateBatch(values, language) {
  const unique = [...new Set(values)].filter((value) => value.trim() && /\p{L}/u.test(value));
  const missing = unique.filter((value) => !textCache.has(`${language}\0${value}`));
  for (let offset = 0; offset < missing.length;) {
    let batch = missing.slice(offset, offset + 12);
    const makeRequest = (html) => `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=pt&tl=${encodeURIComponent(language)}&q=${encodeURIComponent(html)}`;
    const makeBatchHtml = (items) => `<div>${items.map((value, index) => `<span data-i="${index}">${encode(value)}</span>`).join('')}</div>`;
    while (batch.length > 1 && makeRequest(makeBatchHtml(batch.map((value) => shieldBrands(value).text))).length > 6500) batch = batch.slice(0, -1);
    const shielded = batch.map(shieldBrands);
    const html = makeBatchHtml(shielded.map((value) => value.text));
    const url = makeRequest(html);
    let result;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        const response = await fetch(url, { headers: { 'user-agent': 'Nexulvi-localization-builder/1.0' }, signal: AbortSignal.timeout(20000) });
        if (!response.ok) {
          const error = new Error(`Translation service returned ${response.status}`);
          error.retryAfter = Number(response.headers.get('retry-after')) || 0;
          throw error;
        }
        const payload = await response.json();
        result = typeof payload?.[0] === 'string'
          ? payload[0]
          : payload?.[0]?.map((segment) => segment?.[0] || '').join('') || '';
        const translated = new Map();
        for (const match of result.matchAll(/<span data-i=['"](\d+)['"]>([\s\S]*?)<\/span>/gi)) translated.set(Number(match[1]), decode(match[2]));
        if (translated.size !== batch.length) {
          for (let index = 0; index < batch.length; index += 1) {
            const single = `<div><span data-i="0">${encode(shielded[index].text)}</span></div>`;
            const singleUrl = makeRequest(single);
            const singleResponse = await fetch(singleUrl, { headers: { 'user-agent': 'Nexulvi-localization-builder/1.0' }, signal: AbortSignal.timeout(20000) });
            if (!singleResponse.ok) {
              const error = new Error(`Translation service returned ${singleResponse.status}`);
              error.retryAfter = Number(singleResponse.headers.get('retry-after')) || 0;
              throw error;
            }
            const singlePayload = await singleResponse.json();
            const singleHtml = typeof singlePayload?.[0] === 'string'
              ? singlePayload[0]
              : singlePayload?.[0]?.map((segment) => segment?.[0] || '').join('') || '';
            const translatedText = singleHtml.match(/<span data-i=['"]0['"]>([\s\S]*?)<\/span>/i)?.[1];
            textCache.set(`${language}\0${batch[index]}`, translatedText === undefined ? batch[index] : shielded[index].restore(decode(translatedText)));
            persistTranslationCache();
            await sleep(220);
          }
          break;
        }
        batch.forEach((value, index) => textCache.set(`${language}\0${value}`, shielded[index].restore(translated.get(index))));
        persistTranslationCache();
        break;
      } catch (error) {
        if (attempt === 5) throw error;
        const backoff = Math.min(Math.max(error.retryAfter * 1000, 5000 * (2 ** attempt)), 120000);
        await sleep(backoff);
      }
    }
    await sleep(750);
    offset += batch.length;
  }
  return values.map((value) => textCache.get(`${language}\0${value}`) || value);
}

function splitHtml(html) {
  return html.match(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]+>|[^<]+/gi) || [];
}

async function localizeHtml(source, locale, language, homeTranslations) {
  const tokens = splitHtml(source);
  const refs = [];
  const values = [];
  let inLanguageSelect = false;
  tokens.forEach((token, tokenIndex) => {
    if (/^<select\b/i.test(token) && /\bid=['"](?:language-select|app-language)['"]/i.test(token)) inLanguageSelect = true;
    if (inLanguageSelect) {
      if (/^<\/select/i.test(token)) inLanguageSelect = false;
      if (!/^<select\b/i.test(token)) return;
    }
    if (/^<(?:script|style)\b/i.test(token) || /^<!--/.test(token)) return;
    if (!token.startsWith('<')) {
      const match = token.match(/^(\s*)([\s\S]*?)(\s*)$/);
      const content = decode(match[2]);
      if (content.trim() && /\p{L}/u.test(content)) {
        refs.push({ tokenIndex, kind: 'text', prefix: match[1], suffix: match[3], valueIndex: values.length });
        values.push(content);
      }
      return;
    }
    if (!token.startsWith('<')) return;
    const tagName = token.match(/^<([\w-]+)/)?.[1]?.toLowerCase();
    const translatable = (attribute, value) => {
      if (['alt', 'title', 'aria-label', 'placeholder'].includes(attribute)) return true;
      return attribute === 'content' && tagName === 'meta' && /(?:description|og:title|og:description|twitter:title|twitter:description)/i.test(token);
    };
    const pattern = /\b(alt|title|aria-label|placeholder|content)=(['"])(.*?)\2/gi;
    let match;
    while ((match = pattern.exec(token))) {
      const attribute = match[1].toLowerCase();
      if (!translatable(attribute, match[3]) || !/\p{L}/u.test(decode(match[3]))) continue;
      refs.push({ tokenIndex, kind: 'attribute', start: match.index + match[0].indexOf(match[3]), length: match[3].length, valueIndex: values.length });
      values.push(decode(match[3]));
    }
  });
  const translations = await translateBatch(values, language);
  const schemaScripts = [];
  tokens.forEach((token, tokenIndex) => {
    const match = token.match(/^(<script\b[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script\s*>)$/i);
    if (!match) return;
    try {
      const data = JSON.parse(match[2]);
      if (typeof data.description === 'string') schemaScripts.push({ tokenIndex, match, data });
    } catch { /* Keep malformed or unsupported structured data unchanged. */ }
  });
  const schemaDescriptions = await translateBatch(schemaScripts.map(({ data }) => data.description), language);
  schemaScripts.forEach(({ tokenIndex, match, data }, index) => {
    data.description = schemaDescriptions[index];
    tokens[tokenIndex] = `${match[1]}${JSON.stringify(data)}${match[3]}`;
  });
  for (const ref of refs.filter((entry) => entry.kind === 'text')) {
    tokens[ref.tokenIndex] = `${ref.prefix}${encode(translations[ref.valueIndex])}${ref.suffix}`;
  }
  const byToken = new Map();
  for (const ref of refs.filter((entry) => entry.kind === 'attribute')) {
    if (!byToken.has(ref.tokenIndex)) byToken.set(ref.tokenIndex, []);
    byToken.get(ref.tokenIndex).push(ref);
  }
  for (const [index, attributes] of byToken) {
    let tag = tokens[index];
    for (const ref of attributes.sort((a, b) => b.start - a.start)) {
      tag = `${tag.slice(0, ref.start)}${encode(translations[ref.valueIndex])}${tag.slice(ref.start + ref.length)}`;
    }
    tokens[index] = tag;
  }
  let html = tokens.join('');
  if (sourceFileForCanonical === 'index.html' && homeTranslations) {
    for (const [key, value] of Object.entries(homeTranslations)) {
      const pattern = new RegExp(`(<([a-z][\\w:-]*)\\b[^>]*\\bdata-i18n=["']${key}["'][^>]*>)[\\s\\S]*?(<\\/\\2>)`, 'gi');
      html = html.replace(pattern, (_match, opening, _tagName, closing) => `${opening}${value}${closing}`);
    }
  }
  html = html.replace(/(<html\b[^>]*\blang=)(['"])[^'"]*\2/i, `$1"${locale}"`);
  const canonicalPath = sourceFileForCanonical === 'index.html' ? '' : sourceFileForCanonical;
  html = html.replace(/<link\b([^>]*\brel=['"]canonical['"][^>]*?)\bhref=['"][^'"]*['"]([^>]*)>/i, (_match, before, after) => `<link${before}href="${siteUrl}/${locale}/${canonicalPath}"${after}>`);
  html = html.replace(/(href|src)=(['"])(assets\/|styles\.css|apps\.css|script\.js|apps\.js|language-picker\.js|favicon\.svg|site\.webmanifest)([^'"]*)\2/gi, '$1=$2../$3$4$2');
  const alternates = locales.map(([code]) => {
    const target = code === 'pt-BR' ? `${siteUrl}/${canonicalPath}` : `${siteUrl}/${code}/${canonicalPath}`;
    return `<link rel="alternate" hreflang="${code}" href="${target}">`;
  }).join('') + `<link rel="alternate" hreflang="x-default" href="${siteUrl}/${canonicalPath}">`;
  html = html.replace(/<\/head>/i, `${alternates}</head>`);
  html = html.replace(/<meta\s+property=['"]og:url['"]\s+content=['"][^'"]*['"]\s*\/?\s*>/i, `<meta property="og:url" content="${siteUrl}/${locale}/${canonicalPath}">`);
  html = html.replace(/<meta\s+property=['"]og:locale['"]\s+content=['"][^'"]*['"]\s*\/?\s*>/i, `<meta property="og:locale" content="${locale.replace('-', '_')}">`);
  if (['ja-JP', 'ko-KR', 'hi-IN'].includes(locale)) {
    const family = locale === 'hi-IN' ? 'system-ui,"Noto Sans Devanagari",sans-serif' : 'system-ui,"Noto Sans CJK JP","Noto Sans CJK KR",sans-serif';
    html = html.replace(/<\/head>/i, `<style>html:lang(${locale}) body{font-family:${family}}html:lang(${locale}) h1,html:lang(${locale}) h2,html:lang(${locale}) h3,html:lang(${locale}) .app-tagline{letter-spacing:normal}</style></head>`);
  }
  if (/data-app=/.test(html)) html = html.replace(/<script\s+src="\.\.\/apps\.js"/i, `<script src="app-data.js"></script><script src="../apps.js"`);
  return html;
}

let sourceFileForCanonical = '';
function flatten(value, prefix = [], output = []) {
  if (typeof value === 'string') output.push({ path: prefix, value });
  else if (Array.isArray(value)) value.forEach((item, index) => flatten(item, [...prefix, index], output));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => flatten(item, [...prefix, key], output));
  return output;
}
function setPath(object, pathParts, value) {
  let current = object;
  pathParts.forEach((part, index) => {
    if (index === pathParts.length - 1) current[part] = value;
    else current = current[part];
  });
}

function extractAppData() {
  const source = fs.readFileSync(path.join(root, 'apps.js'), 'utf8');
  const match = source.match(/const pages=window\.__NEXULVI_APP_TRANSLATIONS\|\|?(\{[\s\S]*?\n\s*\};)\s*const app=/);
  if (!match) throw new Error('Could not extract app translation source');
  return new Function(`return ${match[1].replace(/;\s*$/, '')}`)();
}

function extractHomeData() {
  const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
  const match = source.match(/const translations\s*=\s*(\{[\s\S]*?\n\s*\};)\s*\n\s*const languageNames/);
  if (!match) throw new Error('Could not extract homepage translation source');
  return new Function(`return ${match[1].replace(/;\s*$/, '')}`)();
}

async function translateAppData(appData, locale, language) {
  const localized = {};
  for (const [app, versions] of Object.entries(appData)) {
    const base = versions.pt;
    const entries = flatten(base);
    const translated = await translateBatch(entries.map((entry) => entry.value), language);
    const result = structuredClone(base);
    entries.forEach((entry, index) => setPath(result, entry.path, translated[index]));
    localized[app] = { pt: result };
  }
  return `window.__NEXULVI_STATIC_LOCALE=true;window.__NEXULVI_APP_TRANSLATIONS=${JSON.stringify(localized)};`;
}

async function main() {
  if (process.argv.includes('--inspect')) {
    const appData = extractAppData();
    console.log(Object.entries(appData).map(([app, languages]) => `${app}: ${Object.keys(languages).join(', ')}`).join('\n'));
    console.log(`Homepage: ${Object.keys(extractHomeData()).join(', ')}`);
    return;
  }
  const resume = process.argv.includes('--resume');
  if (!resume) fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  const digest = sourceDigest();
  const appData = extractAppData();
  const homeData = extractHomeData();
  for (const [locale, language] of locales) {
    if (locale === 'pt-BR') continue; // Existing root pages remain the canonical Brazilian Portuguese URLs.
    const directory = path.join(output, locale);
    const localeComplete = htmlFiles.every((file) => fs.existsSync(path.join(directory, file))) && fs.existsSync(path.join(directory, 'app-data.js'));
    const digestPath = path.join(directory, '.source-digest');
    const localeDigest = fs.existsSync(digestPath) ? fs.readFileSync(digestPath, 'utf8').trim() : '';
    if (resume && localeComplete && localeDigest === digest) {
      console.log(`Resumed ${locale} from existing output`);
      continue;
    }
    fs.mkdirSync(directory, { recursive: true });
    for (const file of htmlFiles) {
      const sourcePath = path.join(root, file);
      const source = fs.readFileSync(sourcePath, 'utf8');
      sourceFileForCanonical = file;
      const homeLanguage = { 'en-US': 'en', 'es-ES': 'es', 'de-DE': 'de', 'fr-FR': 'fr' }[locale];
      const translated = await localizeHtml(source, locale, language, homeLanguage ? homeData[homeLanguage] : null);
      fs.writeFileSync(path.join(directory, file), translated);
    }
    const appTranslations = await translateAppData(appData, locale, language);
    fs.writeFileSync(path.join(directory, 'app-data.js'), appTranslations);
    fs.writeFileSync(digestPath, `${digest}\n`);
    console.log(`Generated ${locale}`);
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ locales: locales.filter(([locale]) => locale !== 'pt-BR').map(([locale]) => locale), sourceDigest: digest }, null, 2) + '\n');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
