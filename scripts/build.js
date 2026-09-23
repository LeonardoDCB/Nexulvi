'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicFiles = [
  '404.html', 'alongae.html', 'apps.css', 'apps.js', 'arqvello.html', 'coflira.html',
  'favicon.svg', 'index.html', 'privacidade-alongae.html', 'robots.txt', 'script.js',
  'site.webmanifest', 'sitemap.xml', 'stereo-scene.js', 'styles.css'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });

for (const file of publicFiles) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) throw new Error(`Arquivo público ausente: ${file}`);
  fs.copyFileSync(source, path.join(output, file));
}

for (const file of fs.readdirSync(path.join(root, 'assets'))) {
  fs.copyFileSync(path.join(root, 'assets', file), path.join(output, 'assets', file));
}

console.log(`Build concluído em ${output}`);
