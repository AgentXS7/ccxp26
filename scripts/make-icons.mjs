import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// 5x7 glyphs para "SP" e "2026"
const GLYPHS = {
  S: [
    '01111',
    '10000',
    '10000',
    '01110',
    '00001',
    '00001',
    '11110',
  ],
  P: [
    '11110',
    '10001',
    '10001',
    '11110',
    '10000',
    '10000',
    '10000',
  ],
  '2': [
    '01110',
    '10001',
    '00001',
    '00110',
    '01000',
    '10000',
    '11111',
  ],
  '0': [
    '01110',
    '10001',
    '10011',
    '10101',
    '11001',
    '10001',
    '01110',
  ],
  '6': [
    '01110',
    '10000',
    '10000',
    '11110',
    '10001',
    '10001',
    '01110',
  ],
};

function drawRoundedRectStroke(u, v, pad, r, thick) {
  const x = Math.abs(u - 0.5);
  const y = Math.abs(v - 0.5);
  const half = 0.5 - pad - r;
  const dx = Math.max(x - half, 0);
  const dy = Math.max(y - half, 0);
  const d = Math.sqrt(dx * dx + dy * dy) - r;
  return Math.abs(d) < thick;
}

function drawFourPointStar(u, v, cx, cy, size) {
  const dx = Math.abs(u - cx) / size;
  const dy = Math.abs(v - cy) / size;
  // Astroide para estrela de 4 pontas clássica estilo HoYoLAB
  return Math.pow(dx, 0.55) + Math.pow(dy, 0.55) < 1.0;
}

function sampleGlyphText(u, v, text, startX, startY, charW, charH, gap) {
  for (let idx = 0; idx < text.length; idx++) {
    const ch = text[idx];
    const grid = GLYPHS[ch];
    if (!grid) continue;
    const gx0 = startX + idx * (charW + gap);
    if (u >= gx0 && u < gx0 + charW && v >= startY && v < startY + charH) {
      const col = Math.min(4, Math.floor(((u - gx0) / charW) * 5));
      const row = Math.min(6, Math.floor(((v - startY) / charH) * 7));
      if (grid[row][col] === '1') return true;
    }
  }
  return false;
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;

      // Gradiente diagonal fundo HoYoLAB (#192246 -> #0C0F1D)
      const t = (u * 0.45 + v * 0.55);
      let r = 25 * (1 - t) + 12 * t;
      let g = 34 * (1 - t) + 15 * t;
      let b = 70 * (1 - t) + 29 * t;

      // Halo radial índigo no topo-centro
      const distHalo = Math.hypot(u - 0.5, v - 0.28);
      const halo = Math.max(0, 1 - distHalo / 0.55);
      r += halo * halo * 45;
      g += halo * halo * 60;
      b += halo * halo * 125;

      // Moldura dourada fina (HoYoLAB adventure border)
      if (drawRoundedRectStroke(u, v, 0.055, 0.14, 0.008)) {
        r = 229;
        g = 184;
        b = 105;
      }

      // Estrela 4 pontas no topo
      if (drawFourPointStar(u, v, 0.5, 0.21, 0.075)) {
        r = 229;
        g = 184;
        b = 105;
      }

      // Texto "SP" central
      if (sampleGlyphText(u, v, 'SP', 0.235, 0.34, 0.23, 0.29, 0.07)) {
        r = 242;
        g = 245;
        b = 255;
      }

      // Texto "2026" embaixo em Periwinkle
      if (sampleGlyphText(u, v, '2026', 0.235, 0.695, 0.105, 0.135, 0.037)) {
        r = 128;
        g = 152;
        b = 255;
      }

      const idx = (y * size + x) * 4;
      buf[idx] = Math.min(255, Math.max(0, Math.round(r)));
      buf[idx + 1] = Math.min(255, Math.max(0, Math.round(g)));
      buf[idx + 2] = Math.min(255, Math.max(0, Math.round(b)));
      buf[idx + 3] = 255;
    }
  }
  return encodePNG(size, size, buf);
}

const outDir = path.resolve('public');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icon-512.png'), renderIcon(512));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), renderIcon(192));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), renderIcon(180));
console.log('PWA icons generated successfully!');
