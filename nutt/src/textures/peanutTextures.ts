import * as THREE from 'three';
import { fbm3, mulberry32 } from '@/utils/math';
import { makeCanvas, toTexture } from './canvas';

/**
 * Pele do amendoim tostado, gerada em canvas (sem download):
 *  - map: dourado com manchas de torra, veios longitudinais e pintas;
 *  - bump: veios em baixo-relevo + microtextura;
 *  - roughness: fosco com variações;
 *  - coatMask: ruído usado pelo shader para "crescer" a cobertura de sabor.
 * Amostragem cilíndrica => sem emenda em u = 0/1.
 */
export type PeanutTextures = {
  map: THREE.Texture;
  bump: THREE.Texture;
  roughness: THREE.Texture;
  coatMask: THREE.Texture;
};

let cached: PeanutTextures | null = null;

export function getPeanutTextures(size = 512): PeanutTextures {
  if (cached) return cached;
  const W = size, H = size / 2;
  const albedo = makeCanvas(W, H);
  const height = makeCanvas(W, H);
  const rough = makeCanvas(W, H);
  const mask = makeCanvas(W / 2, H / 2);

  const aImg = albedo.ctx.createImageData(W, H);
  const hImg = height.ctx.createImageData(W, H);
  const rImg = rough.ctx.createImageData(W, H);
  const TAU = Math.PI * 2;

  for (let y = 0; y < H; y++) {
    const v = y / H;
    // pontas mais tostadas
    const ends = Math.pow(Math.abs(v - 0.5) * 2, 3);
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const cx = Math.cos(u * TAU), cz = Math.sin(u * TAU);
      const big = fbm3(cx * 1.6, v * 3.2, cz * 1.6, 4);
      const mid = fbm3(cx * 5 + 3, v * 11, cz * 5, 3);
      // veios: ruído esticado ao longo de v (longitudinal)
      const vein = Math.abs(fbm3(cx * 9 + 7, v * 1.6, cz * 9, 3) - 0.5);
      const veinLine = Math.max(0, 1 - vein * 22);
      const speck = fbm3(cx * 40, v * 60, cz * 40, 1) > 0.8 ? 1 : 0;

      const roast = Math.min(1, 0.25 + big * 0.55 + ends * 0.45 + mid * 0.15);
      // paleta: creme dourado -> caramelo -> marrom torra
      let r = 226 - roast * 62, g = 178 - roast * 70, b = 116 - roast * 58;
      r -= veinLine * 16; g -= veinLine * 16; b -= veinLine * 12;
      r -= speck * 45; g -= speck * 40; b -= speck * 25;
      const i = (y * W + x) * 4;
      aImg.data[i] = r; aImg.data[i + 1] = g; aImg.data[i + 2] = b; aImg.data[i + 3] = 255;

      const hgt = 150 + (mid - 0.5) * 70 - veinLine * 45 - speck * 20;
      hImg.data[i] = hImg.data[i + 1] = hImg.data[i + 2] = hgt; hImg.data[i + 3] = 255;

      const ro = 150 + (big - 0.5) * 60 + veinLine * 40; // veios mais foscos
      rImg.data[i] = rImg.data[i + 1] = rImg.data[i + 2] = ro; rImg.data[i + 3] = 255;
    }
  }
  albedo.ctx.putImageData(aImg, 0, 0);
  height.ctx.putImageData(hImg, 0, 0);
  rough.ctx.putImageData(rImg, 0, 0);

  const mImg = mask.ctx.createImageData(W / 2, H / 2);
  for (let y = 0; y < H / 2; y++)
    for (let x = 0; x < W / 2; x++) {
      const u = x / (W / 2), v = y / (H / 2);
      const n = fbm3(Math.cos(u * TAU) * 2.5, v * 5, Math.sin(u * TAU) * 2.5, 4);
      const i = (y * (W / 2) + x) * 4;
      const val = Math.min(255, Math.max(0, (n - 0.2) * 1.6 * 255));
      mImg.data[i] = mImg.data[i + 1] = mImg.data[i + 2] = val; mImg.data[i + 3] = 255;
    }
  mask.ctx.putImageData(mImg, 0, 0);

  cached = {
    map: toTexture(albedo.c),
    bump: toTexture(height.c, false),
    roughness: toTexture(rough.c, false),
    coatMask: toTexture(mask.c, false),
  };
  return cached;
}

/** Textura de fatia cítrica / fruta (cacheada por cor). */
const fruitCache = new Map<string, THREE.Texture>();
export function fruitTexture(kind: 'slice' | 'berry', color: string, accent = '#ffffff') {
  const key = `${kind}${color}${accent}`;
  const hit = fruitCache.get(key);
  if (hit) return hit;
  const S = 256;
  const { c, ctx } = makeCanvas(S, S);
  const rnd = mulberry32(color.length * 13);
  if (kind === 'slice') {
    // topo/base do cilindro: casca, albedo branco e gomos translúcidos
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S * 0.44, 0, Math.PI * 2);
    ctx.fill();
    const segs = 10;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2 + 0.04, a1 = ((i + 1) / segs) * Math.PI * 2 - 0.04;
      const grd = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S * 0.4);
      grd.addColorStop(0, accent);
      grd.addColorStop(1, color);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(S / 2, S / 2);
      ctx.arc(S / 2, S / 2, S * 0.4, a0, a1);
      ctx.closePath();
      ctx.fill();
      // vesículas de suco
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      for (let k = 0; k < 14; k++) {
        const a = a0 + (a1 - a0) * rnd(), r = S * (0.08 + 0.3 * rnd());
        ctx.beginPath();
        ctx.moveTo(S / 2 + Math.cos(a) * r, S / 2 + Math.sin(a) * r);
        ctx.lineTo(S / 2 + Math.cos(a) * (r + 10), S / 2 + Math.sin(a) * (r + 10));
        ctx.stroke();
      }
    }
  } else {
    // fruta vermelha: sementes douradas e brilho
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 180; i++) {
      const x = rnd() * S, y = rnd() * S;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(x, y - 0.6, 1.4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const t = toTexture(c);
  fruitCache.set(key, t);
  return t;
}
