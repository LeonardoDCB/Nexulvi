'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicFiles = [
  '404.html', 'alongae.html', 'apps.css', 'apps.js', 'arqvello.html', 'coflira.html',
  'favicon.svg', 'index.html', 'miauforia.html', 'privacidade-alongae.html',
  'privacidade-miauforia.html', 'privacidade-sentinela.html', 'robots.txt', 'script.js',
  'sentinela.html', 'site.webmanifest', 'sitemap.xml', 'stereo-scene.js', 'styles.css'
];

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

  fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  await Promise.all([
    ...['styles.css', 'apps.css'].map((file) => minify(file, 'css')),
    ...['script.js', 'apps.js', 'stereo-scene.js'].map((file) => minify(file, 'js'))
  ]);
  console.log(`Build concluído em ${output}`);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
