'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config');
const { contactUrl, siteUrl } = require('../scripts/commercial');
const root = path.resolve(__dirname, '..');
const dist = path.resolve(process.env.BUILD_OUTPUT || path.join(root, 'dist'));
const read = (file) => fs.readFileSync(path.join(dist, file), 'utf8');
const allFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? allFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);

test('artefato estático completo, metadados e canonicals', () => {
  const titles = new Set();
  for (const name of ['index.html', 'servicos.html', 'sobre.html', 'contato.html', 'privacidade.html', ...config.services.map((s) => `${s.slug}.html`)]) {
    const html = read(name);
    assert.match(html, /<html lang="pt-BR"/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, name);
    assert.match(html, /<meta name="description" content="[^"]{40,}"/);
    assert.match(html, /property="og:image" content="https?:\/\/[^"]+social-card.png"/);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);
    assert.ok(html.includes(`rel="canonical" href="${new URL(name === 'index.html' ? '' : name, siteUrl).href}"`), name);
    assert.ok(!/<!--(?:HEAD|HEADER|SERVICES|APPS|FAQ|FOOTER)-->/g.test(html), name);
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title), `Título repetido: ${title}`);
    titles.add(title);
    for (const schema of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(schema[1]);
      assert.equal(data['@context'], 'https://schema.org');
      assert.ok(!JSON.stringify(data).includes('aggregateRating'));
    }
  }
  assert.ok(fs.statSync(path.join(dist, 'assets/social-card.png')).size > 1000);
  assert.ok(fs.statSync(path.join(dist, 'assets/amanda-petsitter-preview.webp')).size > 10000);
});

test('cinco aplicativos preservados e conteúdo pré-renderizado em todos os idiomas', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'localized/manifest.json'), 'utf8'));
  for (const prefix of ['', ...manifest.locales.map((l) => `${l}/`)]) {
    for (const app of config.apps) {
      const html = read(`${prefix}${app.id}.html`);
      assert.match(html, /<h1\b/);
      assert.ok(!/data-copy="[^"]+">\s*<\//.test(html), `${prefix}${app.id}`);
      assert.ok(!/href="https:\/\/play.google.com/.test(html), 'Não inventar publicação.');
    }
  }
  const home = read('index.html');
  for (const app of config.apps) {
    assert.ok(home.includes(`<h3>${app.name}</h3>`));
    assert.ok(home.includes(app.status.toUpperCase()));
    assert.ok(home.includes(`href="${app.id}.html"`));
  }
  assert.ok(read('aplicativos.html').includes(`rel="canonical" href="${siteUrl}aplicativos.html"`));
  assert.ok(read('en-US/index.html').includes(`hreflang="pt-BR" href="${siteUrl}aplicativos.html"`));
});

test('todos os links locais, recursos e âncoras existem', () => {
  const base = new URL(siteUrl);
  for (const file of allFiles(dist).filter((f) => f.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    const relative = path.relative(dist, file).replace(/\\/g, '/');
    const source = new URL(relative, base);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const reference = match[1].replace(/&amp;/g, '&');
      const resolved = new URL(reference, source);
      if (resolved.origin !== base.origin || !['http:', 'https:'].includes(resolved.protocol)) continue;
      assert.ok(resolved.pathname.startsWith(base.pathname), `${relative} sai da base: ${reference}`);
      let target = decodeURIComponent(resolved.pathname.slice(base.pathname.length));
      if (!target || target.endsWith('/')) target += 'index.html';
      const targetFile = path.join(dist, target);
      assert.ok(fs.existsSync(targetFile), `${relative} -> ${reference}`);
      if (resolved.hash && target.endsWith('.html')) {
        const id = decodeURIComponent(resolved.hash.slice(1));
        const targetHtml = fs.readFileSync(targetFile, 'utf8');
        assert.ok(targetHtml.includes(`id="${id}"`) || targetHtml.includes(`name="${id}"`), `Âncora ausente ${relative} -> ${reference}`);
      }
    }
  }
});

test('sitemap só lista páginas existentes e indexáveis', () => {
  const xml = read('sitemap.xml');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes(siteUrl));
  for (const entry of urls) {
    assert.ok(entry.startsWith(siteUrl));
    const file = entry.slice(siteUrl.length) || 'index.html';
    const html = read(file.endsWith('/') ? `${file}index.html` : file);
    assert.ok(!html.includes('content="noindex"'));
  }
  assert.match(read('404.html'), /content="noindex"/);
});

test('contato real, mensagens contextuais e autorização de portfólio', () => {
  const home = read('index.html');
  const sites = read('criacao-de-sites.html');
  const selectedWa = new URL(contactUrl());
  assert.equal(selectedWa.hostname, 'wa.me');
  assert.equal(selectedWa.pathname, '/5518996999595');
  assert.match(home, /class="hero-proof-image"/);
  assert.match(home, /Amanda Pet Sitter/);
  assert.match(home, /assets\/amanda-petsitter-preview\.webp/);
  assert.match(home, /Projeto para cliente/);
  assert.match(home, /href="https:\/\/amandapetsitter\.com"/);
  assert.match(home, /Seu trabalho merece ser encontrado/);
  assert.match(home, /data-service="sites"/);
  assert.ok(!home.includes('studio-canvas'), 'A ilustração conceitual antiga não deve substituir o projeto real.');
  assert.match(sites, /Site de uma página/);
  assert.match(sites, /Site institucional/);
  assert.match(sites, /Custos recorrentes sem surpresa/);
  assert.ok(home.includes(config.email));
  if (!config.whatsapp) {
    assert.ok(!home.includes('https://wa.me/'));
    for (const service of config.services) {
      const link = new URL(contactUrl(service));
      assert.equal(link.protocol, 'mailto:');
      assert.ok(link.searchParams.get('body').includes(service.message));
    }
  }
  for (const project of config.portfolio.filter((p) => !p.authorized)) {
    assert.ok(!home.includes(project.name), 'Projeto não autorizado apareceu na home.');
    assert.ok(!home.includes(project.url));
  }
  assert.ok(!/<script[^>]+src="https?:/.test(home), 'Scripts externos não foram autorizados.');
});

test('WhatsApp configurado gera mensagens específicas, sem gravar número em artefatos', () => {
  const original = config.whatsapp;
  // Fixture sintética de teste, nunca usada como contato do site.
  config.whatsapp = '5511000000000';
  try {
    for (const service of config.services) {
      const link = new URL(contactUrl(service));
      assert.equal(link.origin, 'https://wa.me');
      assert.equal(link.pathname, `/${config.whatsapp}`);
      assert.ok(link.searchParams.get('text').includes(service.message));
    }
  } finally { config.whatsapp = original; }
});
