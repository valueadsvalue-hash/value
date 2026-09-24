import * as THREE from 'three';
import { fbm3, smoothstep } from '@/utils/math';

/**
 * Grão de amendoim procedural (sem casca): elipsoide levemente arqueado, ponta do gérmen mais
 * estreita, sulco da divisão dos cotilédones e micro-irregularidades.
 * Eixo longo = Y. `half` gera uma das metades (face interna plana) para o CRUNCH.
 * Atributo `aFlat` marca a face interna (1) para o shader colori-la em creme.
 */
export type PeanutOptions = { widthSegments?: number; heightSegments?: number; half?: 1 | -1; seed?: number };

export function createPeanutGeometry({ widthSegments = 96, heightSegments = 64, half, seed = 1 }: PeanutOptions = {}) {
  const g = new THREE.SphereGeometry(1, widthSegments, heightSegments);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const flat = new Float32Array(pos.count);
  const v = new THREE.Vector3();
  const o = seed * 3.1;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = v.x, ny = v.y, nz = v.z;
    // Perfil: ponta do gérmen (+Y) mais fina, base arredondada.
    const taper = 1 - 0.06 * smoothstep(0.2, 1, ny) + 0.04 * smoothstep(0, -1, ny);
    // perfil de amendoim: mais cheio no meio, pontas arredondadas (não pontiagudas)
    const belly = 1 + 0.05 * (1 - ny * ny);
    let rx = 0.66 * taper * belly, ry = 0.98, rz = 0.57 * taper * belly;
    // Sulco entre os cotilédones (plano x = 0), visível na borda do grão.
    const groove = Math.exp(-Math.pow(nx / 0.085, 2)) * (1 - Math.abs(ny) * 0.4);
    const n = fbm3(nx * 2.2 + o, ny * 2.2, nz * 2.2, 3) - 0.5;
    const fine = fbm3(nx * 9 + o, ny * 9, nz * 9, 2) - 0.5;
    const r = 1 + n * 0.07 + fine * 0.012 - groove * 0.045;
    rx *= r; ry *= r; rz *= r;
    let x = nx * rx, y = ny * ry, z = nz * rz;
    // Leve curvatura (grão "rim"), e o nó do gérmen na ponta.
    z += 0.07 * (ny * ny - 0.35);
    y += 0.05 * Math.exp(-Math.pow((1 - ny) / 0.08, 2));

    if (half) {
      // metade +1 mantém x >= 0; metade -1 mantém x <= 0 (espelhada no mesmo sistema).
      const side = x * half;
      if (side < 0) {
        x = 0;
        flat[i] = 1;
        // face interna levemente côncava + bolsa do gérmen
        const germ = Math.exp(-(Math.pow((y - 0.72) / 0.16, 2) + Math.pow(z / 0.12, 2)));
        const dish = 1 - Math.min(1, (y * y) / 0.9 + (z * z) / 0.3);
        // afunda levemente para dentro da própria metade (côncavo) e marca o gérmen
        x = half * (0.004 + dish * 0.018 + germ * 0.02);
      }
    }
    pos.setXYZ(i, x, y, z);
  }
  g.setAttribute('aFlat', new THREE.BufferAttribute(flat, 1));
  g.computeVertexNormals();

  if (half) {
    const nrm = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) if (flat[i] > 0.5) nrm.setXYZ(i, -half, 0, 0);
    nrm.needsUpdate = true;
  }
  g.computeBoundingSphere();
  return g;
}

/** Geometria do fragmento (migalha) do crunch: poliedro irregular facetado. */
export function createCrumbGeometry(seed = 7) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const rnd = (i: number) => fbm3(i * 1.7 + seed, i * 0.3, seed, 1);
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) * (0.7 + rnd(i) * 0.6), pos.getY(i) * (0.45 + rnd(i + 9) * 0.5), pos.getZ(i) * (0.7 + rnd(i + 3) * 0.6));
  }
  g.computeVertexNormals();
  g.setAttribute('aFlat', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(0.35), 1));
  return g;
}
