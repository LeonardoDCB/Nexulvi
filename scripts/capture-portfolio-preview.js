'use strict';

const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {});
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    });
    await page.goto('https://amandapetsitter.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    const jpeg = await page.screenshot({
      type: 'jpeg',
      quality: 72,
      animations: 'disabled',
      timeout: 30000
    });
    const optimized = await page.evaluate(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 625;
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', 0.78);
    }, `data:image/jpeg;base64,${jpeg.toString('base64')}`);
    fs.writeFileSync(
      path.resolve(__dirname, '../assets/amanda-petsitter-preview.webp'),
      Buffer.from(optimized.split(',')[1], 'base64')
    );
    console.log('Captura otimizada salva em assets/amanda-petsitter-preview.webp');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
