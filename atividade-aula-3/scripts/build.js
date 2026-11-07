import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");
const saida = join(raiz, "public", "dist");

mkdirSync(saida, { recursive: true });

await esbuild.build({
  entryPoints: {
    csr: join(raiz, "src", "csr.js"),
    "ssr-hydrate": join(raiz, "src", "ssr-hydrate.js"),
  },
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  outdir: saida,
  entryNames: "[name]",
  logLevel: "info",
});

console.log("Build concluído: public/dist/csr.js e public/dist/ssr-hydrate.js");
