import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const evidencias = join(root, 'evidencias');
const port = 4173;
const runs = 3;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = normalize(join(dist, pathname));
    if (!file.startsWith(dist)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const body = readFileSync(file);
      res.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} saiu com código ${code}`));
    });
  });
}

function findReport(prefix) {
  const jsonName = readdirSync(evidencias).find((name) => name.startsWith(prefix) && name.endsWith('.json'));
  const htmlName = readdirSync(evidencias).find((name) => name.startsWith(prefix) && name.endsWith('.html'));
  if (!jsonName) throw new Error(`Relatório não encontrado para ${prefix}`);
  return {
    jsonPath: join(evidencias, jsonName),
    htmlPath: htmlName ? join(evidencias, htmlName) : null,
  };
}

function summarize(jsonPath) {
  const lhr = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const metrics = lhr.audits.metrics?.details?.items?.[0] ?? {};
  const lcpNode = lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.node;
  const requests = (lhr.audits['network-requests']?.details?.items ?? []).map((item) => ({
    url: item.url,
    resourceType: item.resourceType,
    start: item.networkRequestTime,
    end: item.networkEndTime,
    transferSize: item.transferSize,
    status: item.statusCode,
    mime: item.mimeType,
  }));
  const consoleItems = lhr.audits['errors-in-console']?.details?.items ?? [];
  return {
    score: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    lcpSimulated: lhr.audits['largest-contentful-paint']?.numericValue ?? null,
    lcpDisplay: lhr.audits['largest-contentful-paint']?.displayValue ?? null,
    lcpObserved: metrics.observedLargestContentfulPaint ?? null,
    fcpObserved: metrics.observedFirstContentfulPaint ?? null,
    ttfbObserved: metrics.observedTimeToFirstByte ?? null,
    lcpElement: lcpNode?.snippet ?? lcpNode?.nodeLabel ?? null,
    consoleErrors: consoleItems.map((item) => item.description || item.source || JSON.stringify(item)),
    requests,
    throttling: lhr.configSettings?.throttling ?? null,
    formFactor: lhr.configSettings?.formFactor ?? null,
    userAgent: lhr.environment?.networkUserAgent ?? lhr.environment?.hostUserAgent ?? null,
    fetchTime: lhr.fetchTime,
  };
}

function isCriticalRequest(url) {
  return /\/(csr|ssg)\/$/.test(url) || /styles\.css$|app\.js$|events\.json$|event-1\.png$/.test(url);
}

function waterfallSvg(title, requests, maxMs = 70) {
  const interesting = requests
    .filter((item) => isCriticalRequest(item.url))
    .sort((a, b) => a.start - b.start);
  const labelWidth = 250;
  const chartWidth = 620;
  const row = 42;
  const height = 78 + interesting.length * row;
  const width = labelWidth + chartWidth + 36;
  const colors = {
    Document: '#1d4ed8',
    Stylesheet: '#7c3aed',
    Script: '#b45309',
    XHR: '#157347',
    Fetch: '#157347',
    Image: '#0f766e',
  };
  const ticks = [0, 20, 40, 60].map((ms) => {
    const x = labelWidth + (ms / maxMs) * chartWidth;
    return `<line x1="${x}" y1="46" x2="${x}" y2="${height - 16}" stroke="#e4eaf2"/>
    <text x="${x}" y="42" font-size="11" font-family="ui-sans-serif, system-ui, sans-serif" fill="#667085" text-anchor="middle">${ms} ms</text>`;
  }).join('\n');
  const bars = interesting.map((item, index) => {
    const name = item.url.replace(`http://127.0.0.1:${port}`, '') || '/';
    const x = labelWidth + ((item.start || 0) / maxMs) * chartWidth;
    const bar = Math.max(8, (((item.end || item.start || 0) - (item.start || 0)) / maxMs) * chartWidth);
    const y = 58 + index * row;
    const color = colors[item.resourceType] || '#667085';
    return `<text x="16" y="${y + 14}" font-size="13" font-family="ui-monospace, monospace" fill="#14213d">${escapeXml(name)}</text>
    <rect x="${x.toFixed(1)}" y="${y}" width="${bar.toFixed(1)}" height="20" rx="4" fill="${color}" />
    <text x="${(x + bar + 6).toFixed(1)}" y="${y + 14}" font-size="12" font-family="ui-sans-serif, system-ui, sans-serif" fill="#14213d">${Math.round(item.start)} ms</text>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="16" y="22" font-size="16" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" fill="#14213d">${escapeXml(title)}</text>
  ${ticks}
  ${bars}
</svg>`;
}

function escapeXml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function fileSize(path) {
  return statSync(path).size;
}

mkdirSync(evidencias, { recursive: true });
const server = await startServer();
console.log(`Servindo dist em http://127.0.0.1:${port}`);

const versions = ['csr', 'ssg'];
for (const version of versions) {
  for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
    const prefix = `${version}-${runIndex}`;
    console.log(`\nLighthouse ${prefix}`);
    await run('npx', [
      '--yes',
      'lighthouse',
      `http://127.0.0.1:${port}/${version}/`,
      '--preset=desktop',
      '--only-categories=performance',
      '--output=json',
      '--output=html',
      `--output-path=${join(evidencias, prefix)}`,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
      '--quiet',
    ]);
  }
}

const summary = {
  protocol: {
    port,
    runs,
    preset: 'desktop',
    cache: 'no-store no servidor; Lighthouse limpa o perfil a cada rodada',
    gzip: false,
    server: 'Node estático em dist/, sem live reload e sem source map',
  },
  files: {
    csrHtml: fileSize(join(dist, 'csr/index.html')),
    ssgHtml: fileSize(join(dist, 'ssg/index.html')),
    csrJs: fileSize(join(dist, 'csr/app.js')),
    ssgJs: fileSize(join(dist, 'ssg/app.js')),
    eventsJson: fileSize(join(dist, 'csr/data/events.json')),
    lcpImage: fileSize(join(dist, 'csr/assets/event-1.png')),
    css: fileSize(join(dist, 'csr/styles.css')),
  },
  versions: {},
};

for (const version of versions) {
  const all = [];
  for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
    const report = findReport(`${version}-${runIndex}`);
    all.push({ ...summarize(report.jsonPath), htmlPath: report.htmlPath, jsonPath: report.jsonPath });
  }
  const ordered = [...all].sort((a, b) => a.lcpObserved - b.lcpObserved);
  const median = ordered[1];
  summary.versions[version] = {
    lcpObserved: all.map((item) => Math.round(item.lcpObserved)),
    lcpSimulated: all.map((item) => Math.round(item.lcpSimulated)),
    scores: all.map((item) => item.score),
    median: {
      score: median.score,
      lcpObserved: Math.round(median.lcpObserved),
      lcpSimulated: Math.round(median.lcpSimulated),
      lcpDisplay: median.lcpDisplay,
      fcpObserved: Math.round(median.fcpObserved),
      ttfbObserved: Math.round(median.ttfbObserved),
      lcpElement: median.lcpElement,
      consoleErrors: median.consoleErrors,
      requests: median.requests,
      htmlReport: median.htmlPath,
      throttling: median.throttling,
      formFactor: median.formFactor,
      userAgent: median.userAgent,
    },
  };
}

for (const version of versions) {
  writeFileSync(join(evidencias, `${version}-waterfall.svg`), waterfallSvg(
    `${version.toUpperCase()} — caminho até a imagem de LCP`,
    summary.versions[version].median.requests,
  ));
}
writeFileSync(join(evidencias, 'resumo.json'), JSON.stringify(summary, null, 2));
console.log('\nResumo gravado em evidencias/resumo.json');

async function screenshot(url, file, width, height) {
  await run('google-chrome', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--virtual-time-budget=8000',
    `--window-size=${width},${height}`,
    `--screenshot=${file}`,
    url,
  ]);
}

for (const version of versions) {
  const medianHtml = summary.versions[version].median.htmlReport;
  if (medianHtml) {
    const stableReport = join(evidencias, `${version}-lighthouse.html`);
    copyFileSync(medianHtml, stableReport);
    summary.versions[version].median.htmlReport = stableReport;
  }
  await screenshot(
    `file://${join(evidencias, `${version}-lighthouse.html`)}`,
    join(evidencias, `${version}-lighthouse.png`),
    1100,
    820,
  );
  await screenshot(
    `http://127.0.0.1:${port}/${version}/`,
    join(evidencias, `${version}-pagina.png`),
    1280,
    900,
  );
  await screenshot(
    `file://${join(evidencias, `${version}-waterfall.svg`)}`,
    join(evidencias, `${version}-waterfall.png`),
    960,
    version === 'csr' ? 340 : 300,
  );
}

writeFileSync(join(evidencias, 'resumo.json'), JSON.stringify(summary, null, 2));
server.close();
