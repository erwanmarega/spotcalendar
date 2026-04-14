import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makePNG(w, h, getColor) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA

  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getColor(x, y, w, h);
      const i = y * (1 + w * 4) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }

  const chunk = (type, data) => {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crcBuf]);
  };

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Dessine l'icône à la taille donnée
function iconColor(x, y, w, h) {
  const s = w / 128;

  const GREEN     = [0x1d, 0xb9, 0x54, 0xff];
  const DARK_GRN  = [0x16, 0x8f, 0x40, 0xff];
  const WHITE     = [0xff, 0xff, 0xff, 0xff];
  const TRANSP    = [0, 0, 0, 0];

  // Fond arrondi
  const cr = Math.round(24 * s);
  const inRounded = (px, py) => {
    if (px < 0 || px >= w || py < 0 || py >= h) return false;
    const corners = [
      [cr, cr], [w - 1 - cr, cr],
      [cr, h - 1 - cr], [w - 1 - cr, h - 1 - cr],
    ];
    if (px >= cr && px <= w - 1 - cr) return true;
    if (py >= cr && py <= h - 1 - cr) return true;
    return corners.some(([cx, cy]) => (px - cx) ** 2 + (py - cy) ** 2 <= cr * cr);
  };

  if (!inRounded(x, y)) return TRANSP;

  // Corps du calendrier (rectangle blanc)
  const cL = Math.round(16 * s);
  const cR = w - Math.round(16 * s);
  const cT = Math.round(24 * s);
  const cB = h - Math.round(16 * s);
  const cHeaderB = Math.round(52 * s);
  const cCorner = Math.round(6 * s);

  // Anneaux du calendrier (vertical, dépassent en haut)
  const ringW = Math.round(8 * s);
  const ringH = Math.round(20 * s);
  const ringY  = Math.round(14 * s);
  const ring1X = Math.round(36 * s);
  const ring2X = Math.round(84 * s);

  const inRing1 = x >= ring1X && x <= ring1X + ringW && y >= ringY && y <= ringY + ringH;
  const inRing2 = x >= ring2X && x <= ring2X + ringW && y >= ringY && y <= ringY + ringH;
  if (inRing1 || inRing2) return WHITE;

  // Corps calendrier
  const inCal = (() => {
    if (x < cL || x > cR || y < cT || y > cB) return false;
    const corners = [
      [cL + cCorner, cT + cCorner],
      [cR - cCorner, cT + cCorner],
      [cL + cCorner, cB - cCorner],
      [cR - cCorner, cB - cCorner],
    ];
    if (x >= cL + cCorner && x <= cR - cCorner) return true;
    if (y >= cT + cCorner && y <= cB - cCorner) return true;
    return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= cCorner * cCorner);
  })();

  if (!inCal) return GREEN;

  // En-tête vert foncé
  if (y <= cHeaderB) return DARK_GRN;

  // Grille de points verts sur fond blanc
  const gL = cL + Math.round(12 * s);
  const gR = cR - Math.round(12 * s);
  const gT = cHeaderB + Math.round(12 * s);
  const gB = cB - Math.round(10 * s);
  const cols = 4, rows = 3;
  const cellW = (gR - gL) / cols;
  const cellH = (gB - gT) / rows;
  const dotR = Math.max(1, Math.round(4.5 * s));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = gL + (col + 0.5) * cellW;
      const cy = gT + (row + 0.5) * cellH;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= dotR * dotR) return GREEN;
    }
  }

  return WHITE;
}

mkdirSync(join(__dirname, 'public', 'icons'), { recursive: true });

for (const size of [16, 48, 128]) {
  const png = makePNG(size, size, iconColor);
  writeFileSync(join(__dirname, 'public', 'icons', `icon${size}.png`), png);
  console.log(`✓ icon${size}.png`);
}
