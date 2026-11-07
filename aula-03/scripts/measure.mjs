import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(root, "..");
const port = 4727;
const debugPort = 9333;
const runs = 3;
const base = `http://127.0.0.1:${port}`;

const server = spawn(
  "python3",
  ["-m", "http.server", String(port), "--bind", "127.0.0.1"],
  { cwd: repo, stdio: "ignore" }
);
const chrome = spawn("google-chrome", [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  `--remote-debugging-port=${debugPort}`,
  "--user-data-dir=/tmp/chrome-aula-03",
  "about:blank"
], { stdio: "ignore" });

try {
  await waitFor(`${base}/aula-03/dist/csr/`);
  const version = await waitJson(`http://127.0.0.1:${debugPort}/json/version`);
  const browser = new WebSocket(version.webSocketDebuggerUrl);
  await onceOpen(browser);
  const cdp = createClient(browser);

  const summary = {
    measuredAt: new Date().toISOString(),
    conditions: {
      server: base,
      cache: "disabled",
      latencyMs: 40,
      downloadBytesPerSec: 1_280_000,
      runs
    },
    files: await fileFacts(),
    csr: await sample(cdp, `${base}/aula-03/dist/csr/`),
    ssg: await sample(cdp, `${base}/aula-03/dist/ssg/`)
  };
  browser.close();

  const evidence = resolve(root, "evidencias");
  await mkdir(evidence, { recursive: true });
  await writeFile(resolve(evidence, "resumo.json"), JSON.stringify(summary, null, 2));
  await writeFile(resolve(evidence, "csr-waterfall.svg"), waterfall(summary.csr.median.requests, "CSR"));
  await writeFile(resolve(evidence, "ssg-waterfall.svg"), waterfall(summary.ssg.median.requests, "SSG"));
  console.log(JSON.stringify({
    csrLcp: summary.csr.lcp,
    ssgLcp: summary.ssg.lcp,
    csrNoJs: summary.csr.withoutJs.includesFestival,
    ssgNoJs: summary.ssg.withoutJs.includesFestival,
    csrDetail: summary.csr.median.detailTitle,
    ssgDetail: summary.ssg.median.detailTitle,
    csrLcpUrl: summary.csr.median.lcpUrl,
    ssgLcpUrl: summary.ssg.median.lcpUrl,
    csrErrors: summary.csr.runs.map((run) => run.exceptions),
    ssgErrors: summary.ssg.runs.map((run) => run.exceptions)
  }, null, 2));
} finally {
  server.kill();
  chrome.kill();
}

async function fileFacts() {
  const names = [
    ["csrHtml", "dist/csr/index.html"],
    ["ssgHtml", "dist/ssg/index.html"],
    ["csrJs", "dist/csr/app.js"],
    ["ssgJs", "dist/ssg/app.js"],
    ["csrJson", "dist/csr/data/events.json"],
    ["css", "dist/csr/styles.css"],
    ["image", "../assets/event-1.png"]
  ];
  const facts = {};
  for (const [key, path] of names) {
    const file = resolve(root, path);
    const text = key === "image" ? null : await readFile(file, "utf8");
    facts[key] = {
      bytes: (await stat(file)).size,
      hasFestival: text ? text.includes("Festival de Música no Parque") : false,
      hasEventsJson: text ? text.includes("events.json") : false
    };
  }
  return facts;
}

async function sample(cdp, url) {
  const runsOut = [];
  for (let index = 0; index < runs; index += 1) {
    runsOut.push(await visit(cdp, url, false));
  }
  const withoutJs = await visit(cdp, url, true);
  const lcp = runsOut.map((run) => run.lcp).sort((a, b) => a - b);
  const median = runsOut[runsOut.findIndex((run) => run.lcp === lcp[1])] ?? runsOut[0];
  return { lcp, medianLcp: lcp[1], median, withoutJs, runs: runsOut };
}

async function visit(cdp, url, disableJs) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const requests = new Map();
  const exceptions = [];
  cdp.listen(sessionId, (message) => {
    if (message.method === "Network.requestWillBeSent") {
      const { requestId, request, timestamp, type } = message.params;
      requests.set(requestId, {
        url: request.url,
        type,
        start: timestamp,
        encoded: 0
      });
    }
    if (message.method === "Network.loadingFinished") {
      const row = requests.get(message.params.requestId);
      if (row) {
        row.encoded = message.params.encodedDataLength;
        row.done = true;
      }
    }
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params.exceptionDetails?.text || "exception");
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      exceptions.push("console.error");
    }
  });
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  }, sessionId);
  await cdp.send("Network.enable", {}, sessionId);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 40,
    downloadThroughput: 1_280_000,
    uploadThroughput: 1_280_000
  }, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: "window.__lcp=null;try{new PerformanceObserver((list)=>{const last=list.getEntries().at(-1);window.__lcp={startTime:last.startTime,url:last.url||''}}).observe({type:'largest-contentful-paint',buffered:true})}catch(error){window.__lcpError=String(error)}"
  }, sessionId);
  if (disableJs) {
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: true }, sessionId);
  }
  const load = cdp.wait(sessionId, "Page.loadEventFired");
  await cdp.send("Page.navigate", { url }, sessionId);
  await load;
  if (!disableJs) {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const image = [...requests.values()].find((row) => row.url.includes("event-1.png") && row.done);
      if (image) break;
      await delay(50);
    }
    await delay(300);
  }
  const snapshot = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const lcp = window.__lcp || performance.getEntriesByType("largest-contentful-paint").at(-1);
      const resources = performance.getEntriesByType("resource").map((entry) => ({
        name: entry.name,
        start: entry.startTime,
        duration: entry.duration,
        transfer: entry.transferSize
      }));
      const navigation = performance.getEntriesByType("navigation")[0];
      const day = document.querySelector('[name="day"]');
      const category = document.querySelector('[name="category"]');
      let saturday = null;
      let empty = null;
      if (!${disableJs ? "true" : "false"} && day) {
        day.value = "sabado";
        category.value = "todas";
        document.querySelector("#filters").requestSubmit();
        saturday = document.querySelector("#status").textContent;
        day.value = "sexta";
        category.value = "esporte";
        document.querySelector("#filters").requestSubmit();
        empty = document.querySelector("#status").textContent;
        day.value = "todos";
        category.value = "todas";
        document.querySelector("#filters").requestSubmit();
      }
      const detailButton = document.querySelector(".card:not([hidden]) [data-detail]");
      detailButton?.click();
      const detailOpen = document.querySelector("#detail").open;
      const detailTitle = document.querySelector("#detail-title").textContent;
      if (detailOpen) document.querySelector("#detail").close();
      return {
        lcp: lcp ? lcp.startTime : null,
        lcpUrl: lcp ? lcp.url : "",
        detailOpen,
        detailTitle,
        resources,
        ttfb: navigation ? navigation.responseStart : null,
        text: document.body.innerText.slice(0, 500),
        cards: document.querySelectorAll(".card").length,
        saturday,
        empty
      };
    })()`,
    returnByValue: true
  }, sessionId);
  await cdp.send("Target.closeTarget", { targetId });
  const value = snapshot.result?.value ?? snapshot.result;
  if (!value) throw new Error(JSON.stringify(snapshot));
  const rows = [...requests.values()]
    .map((row) => ({ ...row, startMs: 0 }))
    .sort((a, b) => a.start - b.start);
  const origin = rows[0]?.start ?? 0;
  for (const row of rows) row.startMs = Math.round((row.start - origin) * 1000);
  return {
    lcp: value.lcp,
    lcpUrl: value.lcpUrl,
    ttfb: value.ttfb,
    cards: value.cards,
    saturday: value.saturday,
    empty: value.empty,
    includesFestival: value.text.includes("Festival de Música"),
    detailOpen: value.detailOpen,
    detailTitle: value.detailTitle,
    textStart: value.text.slice(0, 180),
    exceptions,
    requests: rows.map(({ url: requestUrl, type, startMs, encoded }) => ({
      url: requestUrl.replace(base, ""),
      type,
      startMs,
      encoded
    })),
    resources: value.resources
  };
}

function waterfall(requests, title) {
  const interesting = requests.filter((row) => row.type === "Document" || /styles\.css|app\.js|events\.json|event-1\.png/.test(row.url));
  const max = Math.max(80, ...interesting.map((row) => row.startMs));
  const width = 760;
  const scale = 430 / max;
  const rows = interesting.map((row, index) => {
    const y = 48 + index * 28;
    const x = 188 + row.startMs * scale;
    return `<text x="8" y="${y + 12}" font-size="13">${short(row.url)}</text><rect x="${x.toFixed(1)}" y="${y}" width="12" height="16" fill="#0f6e56"/><text x="${(x + 16).toFixed(1)}" y="${y + 13}" font-size="12">${row.startMs} ms</text>`;
  });
  const height = 56 + interesting.length * 28;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f7f1e7"/>
  <text x="8" y="28" font-size="16" font-family="Georgia">${title} — início de cada request</text>
  <g font-family="ui-sans-serif, sans-serif" fill="#1c1915">${rows.join("")}</g>
</svg>
`;
}

function short(url) {
  return url.split("/").slice(-2).join("/");
}

function createClient(browser) {
  let next = 0;
  const pending = new Map();
  const waiters = [];
  browser.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve: done, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else done(message.result);
      return;
    }
    for (const waiter of waiters) waiter(message);
  });
  return {
    send(method, params = {}, sessionId) {
      const id = ++next;
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      browser.send(JSON.stringify(payload));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    listen(sessionId, fn) {
      waiters.push((message) => {
        if (message.sessionId === sessionId) fn(message);
      });
    },
    wait(sessionId, method) {
      return new Promise((resolve) => {
        const wrapped = (message) => {
          if (message.sessionId === sessionId && message.method === method) {
            waiters.splice(waiters.indexOf(wrapped), 1);
            resolve(message);
          }
        };
        waiters.push(wrapped);
      });
    }
  };
}

async function waitFor(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch { /* server still booting */ }
    await delay(100);
  }
  throw new Error(`sem resposta de ${url}`);
}

async function waitJson(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch { /* chrome still booting */ }
    await delay(100);
  }
  throw new Error(`sem resposta de ${url}`);
}

function onceOpen(socket) {
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
