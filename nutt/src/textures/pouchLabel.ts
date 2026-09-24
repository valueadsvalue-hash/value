import * as THREE from 'three';
import type { Product } from '@/data/products';
import { logo } from '@/components/brand/logo';
import { makeCanvas, toTexture } from './canvas';

/**
 * Rótulo do pouch gerado a partir dos dados do sabor. Preto dominante, símbolo e wordmark
 * em laranja com "verniz localizado" (roughness menor => brilho só no símbolo), faixa fina
 * na cor do sabor. Substituível por textura real (KTX2) quando houver arte-final.
 */
const cache = new Map<string, { map: THREE.Texture; roughness: THREE.Texture; back: THREE.Texture }>();

const fontFamily = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim();
  return v || 'Nunito, sans-serif';
};
const textFamily = () => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-text').trim();
  return v || 'Manrope, sans-serif';
};

export function pouchLabel(p: Product) {
  const hit = cache.get(p.id);
  if (hit) return hit;
  const W = 1024, H = 1484;
  const base = makeCanvas(W, H);
  const rough = makeCanvas(W, H);
  const back = makeCanvas(W, H);
  const d = fontFamily(), t = textFamily();
  const sealH = (0.1 / 1.45) * H;

  for (const [ctx, isBack] of [[base.ctx, false], [back.ctx, true]] as const) {
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, W, H);
    // microtextura de filme soft-touch
    const img = ctx.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 7;
      img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    // solda superior: serrilhado
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, W, sealH);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = 0; x < W; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, sealH * 0.55);
      ctx.stroke();
    }
    // furo de pendurar
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(W / 2, sealH * 0.45, 34, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isBack) {
      ctx.fillStyle = 'rgba(255,106,0,0.9)';
      ctx.font = `800 64px ${d}`;
      ctx.textAlign = 'center';
      ctx.fillText('SABOR QUE CONECTA.', W / 2, H * 0.42);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `500 30px ${t}`;
      ctx.fillText('Amendoins artesanais gourmet', W / 2, H * 0.47);
      ctx.fillText(p.name, W / 2, H * 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.strokeRect(W * 0.2, H * 0.6, W * 0.6, H * 0.18);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = `500 22px ${t}`;
      ctx.fillText('INFORMAÇÃO NUTRICIONAL', W / 2, H * 0.62 + 30);
    }
  }

  const ctx = base.ctx;
  ctx.textAlign = 'center';
  // símbolo
  const sym = new Path2D(logo.path);
  const drawSymbol = (c: CanvasRenderingContext2D, fill: string) => {
    c.save();
    const s = 2.2;
    c.translate(W / 2 - (logo.viewBox.w * s) / 2, H * 0.2);
    c.scale(s, s);
    c.fillStyle = fill;
    c.fill(sym);
    c.restore();
  };
  drawSymbol(ctx, '#FF6A00');
  // wordmark
  ctx.fillStyle = '#FF6A00';
  ctx.font = `900 250px ${d}`;
  ctx.fillText('NUTT', W / 2, H * 0.58);
  // linha de categoria
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = `600 30px ${t}`;
  ctx.letterSpacing = '12px';
  ctx.fillText('AMENDOIM ARTESANAL', W / 2, H * 0.635);
  ctx.letterSpacing = '0px';
  // faixa do sabor
  ctx.fillStyle = p.color;
  ctx.fillRect(W * 0.18, H * 0.7, W * 0.64, 6);
  ctx.fillStyle = '#f3ece3';
  let size = 76;
  ctx.font = `800 ${size}px ${d}`;
  while (ctx.measureText(p.name.toUpperCase()).width > W * 0.8 && size > 40) ctx.font = `800 ${(size -= 4)}px ${d}`;
  ctx.fillText(p.name.toUpperCase(), W / 2, H * 0.79);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `500 30px ${t}`;
  ctx.fillText(p.subtitle, W / 2, H * 0.835);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 28px ${t}`;
  ctx.fillText(`PESO LÍQUIDO ${p.weight.toUpperCase()}`, W / 2, H * 0.93);

  // roughness: filme fosco (claro) com verniz localizado (escuro) no símbolo e wordmark
  const r = rough.ctx;
  r.fillStyle = 'rgb(175,175,175)';
  r.fillRect(0, 0, W, H);
  r.fillStyle = 'rgb(210,210,210)';
  r.fillRect(0, 0, W, sealH);
  drawSymbol(r, 'rgb(40,40,40)');
  r.fillStyle = 'rgb(55,55,55)';
  r.textAlign = 'center';
  r.font = `900 250px ${d}`;
  r.fillText('NUTT', W / 2, H * 0.58);

  // Canvas tem origem no topo; a UV da geometria tem v=0 embaixo => flipY padrão resolve.
  const out = { map: toTexture(base.c), roughness: toTexture(rough.c, false), back: toTexture(back.c) };
  cache.set(p.id, out);
  return out;
}

/** Palavra gigante renderizada como textura (usada atrás do grão no CRUNCH). */
export function wordTexture(word: string, color = '#FF6A00') {
  const { c, ctx } = makeCanvas(2048, 512);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 360px ${fontFamily()}`;
  ctx.fillText(word, 1024, 270);
  return toTexture(c);
}
