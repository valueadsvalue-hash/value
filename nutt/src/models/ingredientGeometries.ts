import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { IngredientKind } from '@/data/ingredients';
import { fbm3, mulberry32 } from '@/utils/math';

/**
 * Geometrias procedurais normalizadas (~1 unidade) de cada tipo de ingrediente.
 * São "stand-ins" elegantes — substituíveis por scans/fotos reais via `model` no dado.
 */
const jitter = (g: THREE.BufferGeometry, amt: number, seed: number) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = fbm3(x * 2 + seed, y * 2, z * 2, 2) - 0.5;
    p.setXYZ(i, x * (1 + n * amt), y * (1 + n * amt), z * (1 + n * amt));
  }
  return g;
};

const deform = (g: THREE.BufferGeometry, fn: (v: THREE.Vector3) => void) => {
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    fn(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
};

function drop() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    const a = t * Math.PI;
    // lágrima: base esférica, ponta afinando
    const r = Math.sin(a) * (0.55 + 0.45 * Math.pow(1 - t, 0.8)) * 0.62;
    pts.push(new THREE.Vector2(r, -Math.cos(a) * 0.8 + 0.35 * t * t));
  }
  return new THREE.LatheGeometry(pts, 32);
}

function slice() {
  const g = new THREE.CylinderGeometry(1, 1, 0.16, 48, 1);
  g.rotateX(Math.PI / 2);
  return g;
}

function berry() {
  const g = new THREE.SphereGeometry(0.62, 32, 24);
  return deform(g, (v) => {
    const t = (v.y + 0.62) / 1.24; // 0 base .. 1 ombro
    const k = 0.72 + 0.28 * Math.sin(t * Math.PI * 0.5);
    v.x *= k;
    v.z *= k;
    v.y *= 1.15;
    const bumps = fbm3(v.x * 14, v.y * 14, v.z * 14, 1) * 0.025;
    v.multiplyScalar(1 + bumps);
  });
}

function shard(seed: number) {
  const g = new THREE.IcosahedronGeometry(0.8, 0);
  jitter(g, 0.9, seed);
  g.scale(1.1, 0.28, 0.8);
  g.computeVertexNormals();
  return g;
}

function bean() {
  const g = new THREE.SphereGeometry(0.6, 36, 24);
  return deform(g, (v) => {
    v.x *= 0.78;
    v.y *= 1.05;
    v.z *= 0.56;
    if (v.z > 0) v.z *= 0.55; // face plana
    const groove = Math.exp(-Math.pow(v.x / 0.05, 2)) * (v.z > 0 ? 1 : 0);
    v.z -= groove * 0.09;
    v.x += 0.04 * Math.sin(v.y * 4) * (v.z > 0 ? 1 : 0.2); // sulco em "S"
  });
}

function nib(seed: number) {
  const g = new THREE.DodecahedronGeometry(0.5, 0);
  jitter(g, 1.1, seed);
  g.scale(1, 0.7, 0.85);
  g.computeVertexNormals();
  return g;
}

function crystal(seed: number) {
  const g = new THREE.OctahedronGeometry(0.45, 0);
  jitter(g, 0.5, seed);
  g.scale(1, 1.25, 0.9);
  g.computeVertexNormals();
  return g;
}

function flake() {
  const g = new THREE.PlaneGeometry(1.4, 0.26, 16, 2);
  return deform(g, (v) => {
    v.z = Math.sin(v.x * 2.2) * 0.25 + v.y * v.y * 1.2;
    v.y *= 1 - Math.pow(Math.abs(v.x) / 0.7, 3) * 0.6;
  });
}

function leaf() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.8);
  s.bezierCurveTo(0.55, -0.4, 0.5, 0.4, 0, 0.9);
  s.bezierCurveTo(-0.5, 0.4, -0.55, -0.4, 0, -0.8);
  const g = new THREE.ShapeGeometry(s, 16);
  return deform(g, (v) => {
    v.z = v.x * v.x * 0.5 + Math.sin(v.y * 2) * 0.08;
  });
}

function stick() {
  // canela: casca enrolada em espiral (seção extrudada)
  const shape = new THREE.Shape();
  const turns = 1.7, n = 60, th = 0.035;
  const outer: THREE.Vector2[] = [], inner: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * turns * Math.PI * 2;
    const r = 0.22 - (i / n) * 0.1;
    outer.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    inner.push(new THREE.Vector2(Math.cos(a) * (r - th), Math.sin(a) * (r - th)));
  }
  shape.setFromPoints([...outer, ...inner.reverse()]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -1);
  g.computeVertexNormals();
  return g;
}

function star() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const pod = new THREE.SphereGeometry(0.25, 12, 8);
    deform(pod, (v) => {
      v.x *= 2.1;
      v.y *= 0.9;
      v.z *= 0.8;
      if (v.y > 0) v.y *= 0.4 + Math.abs(v.x) * 0.3;
    });
    pod.translate(0.5, 0, 0);
    pod.rotateY((i / 8) * Math.PI * 2);
    parts.push(pod);
  }
  const g = mergeGeometries(parts)!;
  g.computeVertexNormals();
  return g;
}

const cache = new Map<IngredientKind, THREE.BufferGeometry>();

export function ingredientGeometry(kind: IngredientKind): THREE.BufferGeometry {
  const hit = cache.get(kind);
  if (hit) return hit;
  const seed = mulberry32(kind.length * 97)() * 10;
  const g = {
    drop,
    slice,
    berry,
    shard: () => shard(seed),
    bean,
    nib: () => nib(seed),
    crystal: () => crystal(seed),
    flake,
    leaf,
    stick,
    star,
  }[kind]();
  g.computeBoundingSphere();
  cache.set(kind, g);
  return g;
}

/** Escala base por tipo (tamanho relativo na cena). */
export const ingredientScale: Record<IngredientKind, number> = {
  drop: 0.34,
  slice: 0.62,
  berry: 0.5,
  shard: 0.42,
  bean: 0.36,
  nib: 0.24,
  crystal: 0.16,
  flake: 0.36,
  leaf: 0.5,
  stick: 0.42,
  star: 0.42,
};
