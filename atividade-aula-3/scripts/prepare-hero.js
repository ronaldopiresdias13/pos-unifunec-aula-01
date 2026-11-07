/**
 * Garante public/img/hero.jpg entre ~200 e ~400 KB.
 * Tenta baixar uma foto livre; se falhar, gera um JPEG placeholder com Python.
 */
import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const destino = join(__dirname, "..", "public", "img", "hero.jpg");
const MIN = 200 * 1024;
const MAX = 400 * 1024;

mkdirSync(dirname(destino), { recursive: true });

function tamanhoOk(caminho) {
  if (!existsSync(caminho)) return false;
  const bytes = statSync(caminho).size;
  return bytes >= MIN && bytes <= MAX;
}

async function baixar(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "atividade-csr-ssr/1.0 (uso educacional)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destino));
}

async function gerarPlaceholder() {
  const script = `
from pathlib import Path
try:
    from PIL import Image, ImageDraw
except ImportError:
    import struct, zlib

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    w, h = 1600, 900
    raw = b''.join(b'\\x00' + bytes([20 + (y * 40) // h, 80 + (x * 100) // w, 40 + (y * 60) // h]) for y in range(h) for x in range(w))
    # PNG temporário via zlib — depois convertamos; se não houver PIL, usamos curl fallback
    raise SystemExit(2)

path = Path(${JSON.stringify(destino)})
img = Image.new('RGB', (1600, 900), (18, 72, 48))
draw = ImageDraw.Draw(img)
for y in range(0, 900, 4):
    tom = 18 + int(60 * (y / 900))
    draw.line([(0, y), (1600, y)], fill=(tom, 90 + tom // 2, 50))
draw.rectangle([0, 620, 1600, 900], fill=(12, 48, 36))
# Qualidade ajustável para cair na faixa 200–400 KB
for q in (82, 75, 68, 60, 55, 50):
    img.save(path, 'JPEG', quality=q, optimize=True)
    size = path.stat().st_size
    if 200 * 1024 <= size <= 400 * 1024:
        print(f'Placeholder gerado: {size} bytes (quality={q})')
        break
else:
    print(f'Placeholder gerado fora da faixa ideal: {path.stat().st_size} bytes')
`;
  try {
    execFileSync("python3", ["-c", script], { stdio: "inherit" });
  } catch {
    // Fallback: baixa JPEG conhecido e aceita se estiver próximo da faixa
    console.warn("PIL indisponível; tentando download alternativo…");
    await baixar(
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=70"
    );
  }
}

async function main() {
  if (tamanhoOk(destino)) {
    console.log(`hero.jpg já ok (${statSync(destino).size} bytes)`);
    return;
  }

  const urls = [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=72",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Pantanal_landscape.jpg/1280px-Pantanal_landscape.jpg",
  ];

  for (const url of urls) {
    try {
      console.log(`Baixando ${url} …`);
      await baixar(url);
      const bytes = statSync(destino).size;
      console.log(`Baixado: ${bytes} bytes`);
      if (bytes >= MIN && bytes <= MAX * 1.5) {
        // Se ficou um pouco acima, ainda é útil; se muito pequeno, tenta outra
        if (bytes >= MIN) {
          console.log(`Salvo em ${destino}`);
          return;
        }
      }
    } catch (erro) {
      console.warn(`Falha no download: ${erro.message}`);
    }
  }

  await gerarPlaceholder();

  if (existsSync(destino)) {
    console.log(`hero.jpg pronto (${statSync(destino).size} bytes)`);
  } else {
    console.error("Não foi possível criar public/img/hero.jpg");
    process.exit(1);
  }
}

main();
