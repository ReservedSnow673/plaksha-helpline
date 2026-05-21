/**
 * Generates minimal branded PNG assets for Expo prebuild (icon + adaptive icon).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const WIDTH = 1024;
const HEIGHT = 1024;
const BRAND = { r: 14, g: 35, b: 86, a: 255 };
const ACCENT = { r: 37, g: 99, b: 235, a: 255 };

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(path, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  let offset = 0;
  for (let y = 0; y < HEIGHT; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < WIDTH; x++) {
      const p = pixels(y, x);
      raw[offset++] = p.r;
      raw[offset++] = p.g;
      raw[offset++] = p.b;
      raw[offset++] = p.a;
    }
  }
  const idat = deflateSync(raw);
  const png = Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return writeFile(path, png);
}

function iconPixels(y, x) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const dx = x - cx;
  const dy = y - cy;
  const inCircle = dx * dx + dy * dy < (WIDTH * 0.38) ** 2;
  const inCross =
    Math.abs(dx) < WIDTH * 0.08 && Math.abs(dy) < WIDTH * 0.28
      ? true
      : Math.abs(dy) < WIDTH * 0.08 && Math.abs(dx) < WIDTH * 0.28;
  if (inCircle && inCross) return { r: 255, g: 255, b: 255, a: 255 };
  if (inCircle) return ACCENT;
  return BRAND;
}

await mkdir(assetsDir, { recursive: true });
await writePng(join(assetsDir, 'icon.png'), iconPixels);
await writePng(join(assetsDir, 'adaptive-icon.png'), iconPixels);
console.log('Wrote apps/mobile/assets/icon.png and adaptive-icon.png');
