import * as THREE from 'three';
import type { Product } from '@/data/products';
import { brand, drawSymbol, drawWordmark, logo } from '@/components/brand/logo';
import { mulberry32 } from '@/utils/math';
import { site } from '@/data/site';
import { makeCanvas, toTexture } from './canvas';

/**
 * Rótulo do pouch gerado a partir dos dados do sabor, seguindo a embalagem da identidade:
 * pouch preto fosco, aba laranja com o "n" na solda superior, wordmark "nutt" em dois tons,
 * nome do sabor em minúsculas no canto, peso, e um cluster de amendoins caramelizados.
 * Verniz localizado (roughness baixa) só na aba e no wordmark.
 * Substituível por textura real (KTX2) quando houver arte-final.
 */
const cache = new Map<string, { map: THREE.Texture; roughness: THREE.Texture; back: THREE.Texture }>();

const cssFont = (name: string, fallback: string) => {
  const v = getComputedStyle(document.body).getPropertyValue(name).trim();
  return v || fallback;
};
const displayFont = () => cssFont('--font-display', 'Sniglet, sans-serif');

const W = 1024;
const H = 1484;
const SEAL = (0.1 / 1.45) * H;

function film(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(0, 0, W, H);
  // microtextura soft-touch + leve vinheta
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 7;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const v = ctx.createRadialGradient(W / 2, H * 0.45, W * 0.2, W / 2, H * 0.5, W * 0.9);
  v.addColorStop(0, 'rgba(255,255,255,0.025)');
  v.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  // solda superior serrilhada
  ctx.fillStyle = '#121110';
  ctx.fillRect(0, 0, W, SEAL);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  for (let x = 0; x < W; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x, SEAL * 0.55);
    ctx.stroke();
  }
}

/** Aba laranja da solda superior, com o "n" recortado. */
function tab(ctx: CanvasRenderingContext2D, fill: string, symbolFill: string) {
  const tw = 128, th = SEAL * 2.1, x = W / 2 - tw / 2, r = 22;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x + tw, 0);
  ctx.lineTo(x + tw, th - r);
  ctx.quadraticCurveTo(x + tw, th, x + tw - r, th);
  ctx.lineTo(x + r, th);
  ctx.quadraticCurveTo(x, th, x, th - r);
  ctx.closePath();
  ctx.fill();
  const sh = th * 0.42;
  const sw = (sh / logo.viewBox.h) * logo.viewBox.w;
  drawSymbol(ctx, W / 2 - sw / 2, th - sh - 22, sh, { orange: symbolFill, brown: symbolFill });
}

/** Cluster de amendoins caramelizados (ilustração do conteúdo, como na embalagem). */
function cluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, seed: number, tint: string) {
  const r = mulberry32(seed);
  const pts: { x: number; y: number; rx: number; ry: number; a: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const ang = r() * Math.PI * 2, d = Math.sqrt(r()) * R;
    pts.push({ x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d * 0.95, rx: 26 + r() * 16, ry: 18 + r() * 10, a: r() * Math.PI });
  }
  pts.sort((a, b) => a.y - b.y);
  const base = new THREE.Color(tint);
  const dark = `#${base.clone().multiplyScalar(0.28).getHexString()}`;
  const mid = `#${base.clone().multiplyScalar(0.75).getHexString()}`;
  const hi = `#${base.clone().lerp(new THREE.Color('#ffd08a'), 0.55).getHexString()}`;
  // sombra de contato do cluster
  const sh = ctx.createRadialGradient(cx, cy + R * 0.3, R * 0.2, cx, cy + R * 0.3, R * 1.2);
  sh.addColorStop(0, 'rgba(0,0,0,0.6)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(cx - R * 1.3, cy - R, R * 2.6, R * 2.6);
  for (const p of pts) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    const g = ctx.createRadialGradient(-p.rx * 0.3, -p.ry * 0.4, 1, 0, 0, p.rx * 1.1);
    g.addColorStop(0, hi);
    g.addColorStop(0.45, mid);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    // grão levemente irregular (casquinha de caramelo)
    for (let k = 0; k <= 16; k++) {
      const t = (k / 16) * Math.PI * 2;
      const wob = 1 + Math.sin(t * 5 + p.a * 7) * 0.06;
      const px = Math.cos(t) * p.rx * wob, py = Math.sin(t) * p.ry * wob;
      if (k) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,220,0.55)';
    ctx.beginPath();
    ctx.ellipse(-p.rx * 0.35, -p.ry * 0.45, p.rx * 0.18, p.ry * 0.12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function pouchLabel(p: Product) {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const front = makeCanvas(W, H);
  const rough = makeCanvas(W, H);
  const back = makeCanvas(W, H);
  const d = displayFont();
  const lines = p.label ?? p.name.toLowerCase().split(/\s+(?=\S+$)/);

  // ---------- frente ----------
  const ctx = front.ctx;
  film(ctx);
  tab(ctx, brand.orange, '#0a0908');
  drawWordmark(ctx, W / 2, H * 0.36, W * 0.66);
  // nome do sabor (canto inferior esquerdo) + peso, como no board
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = brand.orange;
  ctx.font = `400 58px ${d}`;
  lines.forEach((l, i) => ctx.fillText(l.toLowerCase(), W * 0.08, H * 0.72 + i * 64));
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = `400 46px ${d}`;
  ctx.fillText(p.weight.replace(/\s+/g, ''), W * 0.08, H * 0.72 + lines.length * 64 + 30);
  // faixa fina na cor do sabor
  ctx.fillStyle = p.color;
  ctx.fillRect(W * 0.08, H * 0.72 - 88, 64, 5);
  cluster(ctx, W * 0.72, H * 0.8, W * 0.2, p.id.length * 31, p.coating === '#7a3510' ? '#c0621f' : p.coating);

  // ---------- roughness: filme fosco, verniz na aba e no wordmark ----------
  const r = rough.ctx;
  r.fillStyle = 'rgb(178,178,178)';
  r.fillRect(0, 0, W, H);
  r.fillStyle = 'rgb(210,210,210)';
  r.fillRect(0, 0, W, SEAL);
  tab(r, 'rgb(60,60,60)', 'rgb(60,60,60)');
  drawWordmark(r, W / 2, H * 0.36, W * 0.66, { orange: 'rgb(48,48,48)', brown: 'rgb(48,48,48)', black: '#000' });
  // cluster com brilho de caramelo
  r.fillStyle = 'rgb(70,70,70)';
  r.beginPath();
  r.arc(W * 0.72, H * 0.8, W * 0.21, 0, Math.PI * 2);
  r.fill();

  // ---------- verso ----------
  const b = back.ctx;
  film(b);
  tab(b, brand.orange, '#0a0908');
  drawWordmark(b, W * 0.3, H * 0.2, W * 0.36);
  b.textAlign = 'left';
  b.fillStyle = brand.orange;
  b.font = `400 40px ${d}`;
  const words = p.subtitle.toLowerCase().split(' ');
  let line = '', y = H * 0.3;
  for (const w of words) {
    if (b.measureText(`${line} ${w}`).width > W * 0.6 && line) {
      b.fillText(line, W * 0.12, y);
      line = w;
      y += 50;
    } else line = line ? `${line} ${w}` : w;
  }
  b.fillText(line, W * 0.12, y);
  // três atributos (ícones simples em traço)
  const attrs = p.characteristics.slice(0, 3);
  b.strokeStyle = brand.orange;
  b.lineWidth = 5;
  b.lineCap = 'round';
  attrs.forEach((a, i) => {
    const cx = W * (0.2 + i * 0.28), cy = H * 0.48;
    b.beginPath();
    b.arc(cx, cy, 36, 0, Math.PI * 2);
    b.stroke();
    b.fillStyle = 'rgba(255,255,255,0.7)';
    b.font = `400 30px ${d}`;
    b.textAlign = 'center';
    b.fillText(a.toLowerCase(), cx, cy + 86);
  });
  b.textAlign = 'left';
  b.fillStyle = brand.orange;
  b.font = `800 32px ${d}`;
  b.fillText('INGREDIENTES', W * 0.12, H * 0.64);
  b.fillStyle = 'rgba(255,255,255,0.7)';
  b.font = `400 32px ${d}`;
  const ing = (p.ingredientsFull ?? p.ingredients.join(', ')).replace(/^ingredientes:\s*/i, '');
  let l2 = '', y2 = H * 0.68;
  for (const w of ing.split(' ')) {
    if (b.measureText(`${l2} ${w}`).width > W * 0.7 && l2) {
      b.fillText(l2, W * 0.12, y2);
      l2 = w;
      y2 += 42;
    } else l2 = l2 ? `${l2} ${w}` : w;
  }
  b.fillText(l2, W * 0.12, y2);
  b.strokeStyle = 'rgba(255,106,0,0.4)';
  b.lineWidth = 2;
  b.strokeRect(W * 0.12, H * 0.84, W * 0.76, H * 0.07);
  b.fillStyle = 'rgba(255,255,255,0.55)';
  b.font = `400 30px ${d}`;
  b.fillText(site.instagramHandle, W * 0.16, H * 0.885);

  // Canvas tem origem no topo; a UV da geometria tem v=0 embaixo => flipY padrão resolve.
  const out = { map: toTexture(front.c), roughness: toTexture(rough.c, false), back: toTexture(back.c) };
  cache.set(p.id, out);
  return out;
}

/** Palavra gigante renderizada como textura (usada atrás do grão no crunch). */
export function wordTexture(word: string, color = brand.orange) {
  const { c, ctx } = makeCanvas(2048, 512);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 400px ${displayFont()}`;
  ctx.fillText(word, 1024, 250);
  return toTexture(c);
}
