import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCard, renderDocument } from './markup.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const events = JSON.parse(readFileSync(join(root, 'shared/data/events.json'), 'utf8'));

rmSync(dist, { recursive: true, force: true });

function writeVersion(strategy, html) {
  const target = join(dist, strategy.toLowerCase());
  mkdirSync(target, { recursive: true });
  cpSync(join(root, 'shared/styles.css'), join(target, 'styles.css'));
  cpSync(join(root, 'shared/assets'), join(target, 'assets'), { recursive: true });
  cpSync(join(root, strategy.toLowerCase(), 'app.js'), join(target, 'app.js'));
  writeFileSync(join(target, 'index.html'), html);
  return target;
}

const csrDir = writeVersion('CSR', renderDocument({
  strategy: 'CSR',
  description: 'Catálogo de eventos montado no navegador depois do JavaScript.',
  status: 'Carregando eventos...',
  cardsHtml: '',
}));
mkdirSync(join(csrDir, 'data'), { recursive: true });
cpSync(join(root, 'shared/data/events.json'), join(csrDir, 'data/events.json'));

const cardsHtml = events.map((event) => renderCard(event)).join('\n');
writeVersion('SSG', renderDocument({
  strategy: 'SSG',
  description: `Catálogo de eventos do fim de semana. Em destaque: ${events[0].title}.`,
  status: `${events.length} eventos disponíveis`,
  cardsHtml,
}));

writeFileSync(join(dist, 'index.html'), `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Aula 3 — builds de produção</title>
</head>
<body>
  <h1>Aula 3 — builds de produção</h1>
  <ul>
    <li><a href="csr/">CSR</a></li>
    <li><a href="ssg/">SSG</a></li>
  </ul>
</body>
</html>
`);

const csrHtml = readFileSync(join(dist, 'csr/index.html'), 'utf8');
const ssgHtml = readFileSync(join(dist, 'ssg/index.html'), 'utf8');
if (csrHtml.includes('Festival') || csrHtml.includes('event-1.png')) {
  throw new Error('O HTML do CSR não pode trazer o catálogo nem a imagem de LCP.');
}
if (!ssgHtml.includes('Festival de Música no Parque') || !ssgHtml.includes('fetchpriority="high"')) {
  throw new Error('O HTML do SSG precisa trazer o catálogo e a imagem de LCP.');
}
if (ssgHtml.includes('events.json')) {
  throw new Error('O SSG não deve pedir events.json.');
}

console.log('Build gravado em dist/csr e dist/ssg');
