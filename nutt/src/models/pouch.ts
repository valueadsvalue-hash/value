import * as THREE from 'three';
import { fbm3, smoothstep } from '@/utils/math';

/**
 * Pouch stand-up procedural: frente e verso "estufados", bordas seladas, solda superior
 * plana com serrilhado e leve amassado de filme. Grupo 0 = frente (rótulo), 1 = verso.
 * Dimensões em unidades de cena: largura 1, altura 1.45.
 */
export const POUCH = { w: 1, h: 1.45, depth: 0.2, seal: 0.1 };

export function createPouchGeometry(segX = 48, segY = 72) {
  const { w, h, depth, seal } = POUCH;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const puff = (u: number, v: number) => {
    // u,v em 0..1. Solda lateral fina, solda superior larga, fundo com sanfona.
    const sx = 1 - Math.pow(Math.abs(u * 2 - 1), 5);
    const top = 1 - seal / h;
    const sy = v > top ? 0 : Math.sqrt(Math.max(0, 1 - Math.pow((v - 0.42) / 0.58, 8)));
    const bottom = 1 + 0.35 * smoothstep(0.45, 0, v); // fundo mais volumoso (fica em pé)
    return Math.max(0, sx) * sy * bottom;
  };

  for (let side = 0; side < 2; side++) {
    const s = side === 0 ? 1 : -1;
    const start = positions.length / 3;
    for (let j = 0; j <= segY; j++) {
      const v = j / segY;
      for (let i = 0; i <= segX; i++) {
        const u = i / segX;
        const x = (u - 0.5) * w;
        const y = (v - 0.5) * h;
        const p = puff(u, v);
        // amassados do filme: baixa frequência + vincos perto das soldas
        const crinkle = (fbm3(u * 6 + side * 4, v * 9, side, 3) - 0.5) * 0.018 * (0.4 + p);
        let z = s * (depth * 0.5 * Math.sqrt(p) + crinkle * p + 0.002);
        // serrilhado na solda superior
        if (v > 1 - (seal * 0.55) / h) z += s * 0.0025 * Math.sin(u * 180);
        const xw = x * (1 - 0.035 * Math.sqrt(p)); // o volume "puxa" as laterais para dentro
        positions.push(side === 0 ? xw : xw, y, z);
        uvs.push(side === 0 ? u : 1 - u, v);
      }
    }
    const row = segX + 1;
    for (let j = 0; j < segY; j++)
      for (let i = 0; i < segX; i++) {
        const a = start + j * row + i, b = a + 1, c = a + row, d = c + 1;
        if (side === 0) indices.push(a, b, d, a, d, c);
        else indices.push(a, d, b, a, c, d);
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  const half = indices.length / 2;
  g.addGroup(0, half, 0);
  g.addGroup(half, half, 1);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
