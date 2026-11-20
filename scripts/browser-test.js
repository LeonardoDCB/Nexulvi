'use strict';
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config');
const base = process.env.TEST_URL || `http://127.0.0.1:4173${new URL(config.siteUrl).pathname}`;
const artifacts = path.resolve(__dirname, '../test-results');

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
  const failures = [];
  const results = [];
  try {
    for (const width of [360, 390, 768, 1024, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      page.on('pageerror', (error) => failures.push(`${width}: ${error.message}`));
      page.on('console', (message) => { if (message.type() === 'error') failures.push(`${width}: ${message.text()}`); });
      page.on('response', (response) => { if (response.status() >= 400) failures.push(`${width}: HTTP ${response.status()} ${response.url()}`); });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.product-miauforia img').scrollIntoViewIfNeeded();
      await page.locator('.product-miauforia img').evaluate((image) => image.decode());
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.product-card').count(), 5);
      assert.equal(await page.locator('.footer-columns h2').first().evaluate((element) => getComputedStyle(element).fontSize), '16px', 'Hierarquia do rodapé deve manter rótulos legíveis sem competir com títulos de seção.');
      for (const theme of ['light', 'dark']) {
        if (await page.getAttribute('html', 'data-theme') !== theme) await page.locator('#theme-toggle').click();
        const metrics = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
        assert.ok(metrics.content <= metrics.viewport, `Overflow em ${width}/${theme}: ${JSON.stringify(metrics)}`);
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
        const violations = audit.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) }));
        if (violations.length) failures.push({ width, theme, violations });
        results.push({ width, theme, violations: violations.length });
        await page.screenshot({ path: path.join(artifacts, `home-${width}-${theme}.png`), fullPage: true });
        await page.screenshot({ path: path.join(artifacts, `hero-${width}-${theme}.png`) });
      }
      await page.locator('#theme-toggle').click();
      const savedTheme = await page.getAttribute('html', 'data-theme');
      await page.reload();
      assert.equal(await page.getAttribute('html', 'data-theme'), savedTheme);
      if (width <= 1024) {
        await page.locator('#menu-toggle').click();
        assert.equal(await page.getAttribute('#menu-toggle', 'aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.getAttribute('#menu-toggle', 'aria-expanded'), 'false');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'menu-toggle');
        await page.locator('#menu-toggle').click();
        await page.locator('#mobile-nav a').first().click();
        assert.ok(page.url().endsWith('/servicos.html'));
      }
      await context.close();
    }
    const secondaryContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await secondaryContext.newPage();
    const pages = ['servicos.html', 'sobre.html', 'contato.html', 'privacidade.html', 'aplicativos.html', ...config.services.map((s) => `${s.slug}.html`), ...config.apps.map((a) => `${a.id}.html`), 'en-US/index.html', 'en-US/alongae.html'];
    for (const file of pages) {
      const errors = [];
      const listener = (error) => errors.push(error.message);
      page.on('pageerror', listener);
      const response = await page.goto(new URL(file, base).href);
      assert.equal(response.status(), 200, file);
      assert.equal(await page.locator('h1').count(), 1, file);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow: ${file}`);
      assert.deepEqual(errors, [], file);
      if (['contato.html', 'criacao-de-sites.html', 'servicos.html', 'privacidade.html'].includes(file)) {
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        if (audit.violations.length) failures.push({ file, violations: audit.violations });
        await page.screenshot({ path: path.join(artifacts, file.replace('.html', '-390.png')), fullPage: true });
      }
      if (file === 'aplicativos.html' || config.apps.some((app) => file === `${app.id}.html`)) {
        const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        if (audit.violations.length) failures.push({ file, violations: audit.violations });
      }
      page.off('pageerror', listener);
    }
    await page.goto(base);
    const portfolioImage = page.locator('.hero-proof-image img');
    assert.equal(await portfolioImage.count(), 1);
    await portfolioImage.scrollIntoViewIfNeeded();
    await portfolioImage.evaluate((image) => image.decode());
    assert.ok(await portfolioImage.evaluate((image) => image.naturalWidth >= 900 && image.naturalHeight >= 560), 'A captura real do portfólio não carregou.');
    await page.screenshot({ path: path.join(artifacts, 'portfolio-amanda-390.png'), fullPage: true });
    await page.locator('.proof-actions a[data-project="Amanda Pet Sitter"]').click();
    assert.ok(page.url().startsWith('https://amandapetsitter.com/'));
    await page.goto(base);
    await page.locator('summary').first().click();
    assert.ok(await page.locator('details').first().getAttribute('open') !== null);
    await page.locator('#language-select').selectOption('en-US');
    await page.waitForURL('**/en-US/index.html');
    assert.equal(await page.getAttribute('html', 'lang'), 'en-US');
    await page.locator('#language-select').selectOption('pt-BR');
    await page.waitForURL('**/aplicativos.html');
    await page.goto(new URL('sitemap.xml', base).href);
    assert.equal(await page.locator('parsererror').count(), 0, 'XML do sitemap inválido.');
    await page.goto(new URL('nao-existe/rota', base).href);
    assert.ok((await page.locator('a', { hasText: 'Voltar para a Nexulvi' }).getAttribute('href')).endsWith(new URL(base).pathname));
    await page.locator('a', { hasText: 'Voltar para a Nexulvi' }).click();
    assert.equal(new URL(page.url()).pathname, new URL(base).pathname);
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const staticPage = await noJs.newPage();
    for (const file of ['', 'criacao-de-sites.html', 'alongae.html', 'en-US/alongae.html']) {
      await staticPage.goto(new URL(file, base).href);
      assert.equal(await staticPage.locator('h1').count(), 1);
      if (file.includes('alongae')) assert.ok((await staticPage.locator('[data-copy="lead"]').textContent()).length > 30);
      assert.ok((await staticPage.locator('main').textContent()).length > 500);
    }
    await noJs.close();
    await page.goto(base);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
    fs.writeFileSync(path.join(artifacts, 'browser-report.json'), JSON.stringify({ results, failures }, null, 2));
    assert.deepEqual(failures, [], 'Falhas de acessibilidade, execução ou recursos. Veja test-results/browser-report.json.');
    console.log(`Browser: ${results.length} combinações largura/tema, ${pages.length} páginas, menu, tema persistente, FAQ, idiomas, 404 e conteúdo sem JS verificados.`);
  } finally {
    fs.writeFileSync(path.join(artifacts, 'browser-report.json'), JSON.stringify({ results, failures }, null, 2));
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
