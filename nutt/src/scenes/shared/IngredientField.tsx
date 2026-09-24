'use client';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { IngredientVisual } from '@/data/ingredients';
import { ingredientGeometry, ingredientScale } from '@/models/ingredientGeometries';
import { fruitTexture } from '@/textures/peanutTextures';
import { mulberry32 } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';

export type FieldMode = 'tunnel' | 'orbit' | 'spiral';

/** Controle escrito pela cena dona a cada frame. */
export type FieldControl = {
  t: number;
  /** progresso da cena (usado pelo modo spiral) */
  p: number;
  /** escala global 0–1 (entrada/saída) */
  scale: number;
  center: THREE.Vector3;
  radius: number;
};

export type FieldHandle = { update: (c: FieldControl) => void };

type Props = {
  visuals: IngredientVisual[];
  density: number;
  mode: FieldMode;
  seed?: number;
  /** tunnel: extensão em Z */
  z?: [number, number];
  size?: number;
};

const FLAT = new Set(['shard', 'nib', 'crystal']);
const DOUBLE = new Set(['leaf', 'flake']);

function materialFor(v: IngredientVisual): THREE.Material | THREE.Material[] {
  const glossy = !!v.glossy;
  const base: THREE.MeshPhysicalMaterialParameters = {
    color: v.color,
    roughness: glossy ? 0.06 : v.kind === 'bean' ? 0.42 : v.kind === 'leaf' ? 0.55 : 0.68,
    clearcoat: glossy ? 1 : v.kind === 'bean' ? 0.35 : 0.1,
    clearcoatRoughness: 0.08,
    flatShading: FLAT.has(v.kind),
    side: DOUBLE.has(v.kind) ? THREE.DoubleSide : THREE.FrontSide,
    sheen: v.kind === 'berry' || v.kind === 'leaf' ? 0.5 : 0,
    sheenColor: new THREE.Color(v.accent ?? v.color),
    envMapIntensity: glossy ? 1.6 : 1,
  };
  if (v.kind === 'crystal') Object.assign(base, { transmission: 0, ior: 1.5, specularIntensity: 1, emissive: new THREE.Color(v.color).multiplyScalar(0.06) });
  if (v.kind === 'berry') return new THREE.MeshPhysicalMaterial({ ...base, color: '#ffffff', map: fruitTexture('berry', v.color, v.accent) });
  if (v.kind === 'slice') {
    const rind = new THREE.MeshPhysicalMaterial({ ...base, roughness: 0.5 });
    const cap = new THREE.MeshPhysicalMaterial({ ...base, color: '#ffffff', roughness: 0.25, clearcoat: 0.8, map: fruitTexture('slice', v.color, v.accent) });
    return [rind, cap, cap];
  }
  return new THREE.MeshPhysicalMaterial(base);
}

type Layer = {
  visual: IngredientVisual;
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  count: number;
  base: Float32Array; // xyz
  rnd: Float32Array; // 6 por instância
};

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const pv = new THREE.Vector3();
const sv = new THREE.Vector3();

/** Campo de ingredientes reais (instanciado por tipo). Tudo vem dos dados do sabor. */
export const IngredientField = forwardRef<FieldHandle, Props>(function IngredientField({ visuals, density, mode, seed = 11, z = [-2, -60], size = 1 }, ref) {
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const mul = qualityByTier[store.tier].ingredients;

  const layers = useMemo<Layer[]>(() => {
    const r = mulberry32(seed);
    return visuals.map((visual) => {
      const count = Math.max(3, Math.round(density * (visual.weight ?? 1) * mul));
      const base = new Float32Array(count * 3);
      const rnd = new Float32Array(count * 6);
      for (let i = 0; i < count; i++) {
        for (let k = 0; k < 6; k++) rnd[i * 6 + k] = r();
        if (mode === 'tunnel') {
          // alguns passam rente à câmera (corredor estreito), a maioria nas paredes do túnel
          const near = r() < 0.12;
          const a = r() * Math.PI * 2, rad = near ? 0.45 + r() * 0.5 : 1.1 + Math.sqrt(r()) * 4.2;
          base[i * 3] = Math.cos(a) * rad;
          base[i * 3 + 1] = Math.sin(a) * rad * 0.7;
          base[i * 3 + 2] = z[0] + r() * (z[1] - z[0]);
        } else {
          const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
          base[i * 3] = Math.cos(a) * s;
          base[i * 3 + 1] = u * 0.55;
          base[i * 3 + 2] = Math.sin(a) * s;
        }
      }
      return { visual, geometry: ingredientGeometry(visual.kind), material: materialFor(visual), count, base, rnd };
    });
  }, [visuals, density, mode, seed, z, mul]);

  useEffect(
    () => () =>
      layers.forEach((l) => (Array.isArray(l.material) ? l.material : [l.material]).forEach((mt) => mt.dispose())),
    [layers],
  );

  useImperativeHandle(ref, () => ({
    update(c) {
      layers.forEach((l, li) => {
        const mesh = meshes.current[li];
        if (!mesh) return;
        mesh.visible = c.scale > 0.001;
        if (!mesh.visible) return;
        const ks = ingredientScale[l.visual.kind] * size;
        for (let i = 0; i < l.count; i++) {
          const j = i * 3, k = i * 6, R = l.rnd;
          let x = l.base[j], y = l.base[j + 1], zz = l.base[j + 2];
          let scl = ks * (0.7 + R[k] * 0.6) * c.scale;
          if (mode === 'tunnel') {
            x += Math.sin(c.t * 0.3 + R[k + 1] * 6) * 0.15;
            y += Math.cos(c.t * 0.25 + R[k + 2] * 6) * 0.15;
          } else if (mode === 'orbit') {
            const rad = c.radius * (0.85 + R[k + 3] * 0.6);
            const ang = Math.atan2(zz, x) + c.t * (0.08 + R[k + 4] * 0.12) * (R[k + 5] > 0.5 ? 1 : -1);
            const len = Math.hypot(x, zz);
            x = c.center.x + Math.cos(ang) * len * rad;
            zz = c.center.z + Math.sin(ang) * len * rad;
            y = c.center.y + y * c.radius * 1.3 + Math.sin(c.t * 0.6 + R[k] * 6) * 0.06;
          } else {
            // spiral: do anel externo até a superfície do grão, com defasagem por instância
            const start = R[k + 3] * 0.35;
            let a = Math.min(1, Math.max(0, (c.p - start) / 0.6));
            a = a * a * (3 - 2 * a);
            const rad = c.radius * (2.6 - a * 1.75) * (0.8 + R[k + 4] * 0.4);
            const ang = Math.atan2(zz, x) + a * Math.PI * (2 + R[k + 5] * 2) + c.t * 0.15;
            x = c.center.x + Math.cos(ang) * rad;
            zz = c.center.z + Math.sin(ang) * rad;
            y = c.center.y + y * (2.2 - a * 1.4) * c.radius;
            scl *= 1 - Math.pow(a, 6); // absorvido pela cobertura
          }
          const spin = c.t * (0.2 + R[k + 4] * 0.5);
          e.set(R[k + 1] * 6.28 + spin, R[k + 2] * 6.28 + spin * 0.6, R[k + 3] * 6.28);
          q.setFromEuler(e);
          pv.set(x, y, zz);
          sv.set(scl, scl, scl);
          m.compose(pv, q, sv);
          mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
      });
    },
  }));

  return (
    <group>
      {layers.map((l, i) => (
        <instancedMesh
          key={`${l.visual.kind}${l.visual.color}`}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          args={[l.geometry, l.material, l.count]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
});
