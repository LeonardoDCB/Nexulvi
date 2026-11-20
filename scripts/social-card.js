'use strict';
// Exporta arte vetorial própria para PNG compatível com compartilhamento social.
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../assets/social-card.svg')).href);
    await page.screenshot({ path: path.resolve(__dirname, '../assets/social-card.png') });
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
