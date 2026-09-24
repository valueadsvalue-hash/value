'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { allIngredientVisuals } from '@/data/products';
import { cloud, drum, grid, rings } from '@/utils/formations';
import { easeInOut, lerp, range } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';
import { pointerRay, setCamera, setLights } from './rig';
import { IngredientField, type FieldControl, type FieldHandle } from './shared/IngredientField';
import { PeanutSwarm, type SwarmHandle } from './shared/PeanutSwarm';
import { mixFormations } from './shared/swarm';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * POR QUE NUTT — um benefício por vez; o mesmo enxame muda de formação:
 *  01 selecionado  -> mesa de seleção (poucos grãos acesos)
 *  02 naturais     -> esfera aberta com ingredientes orbitando
 *  03 artesanal    -> tambor de torra girando
 *  04 conecta      -> dois anéis entrelaçados
 */
export default function WhyScene() {
  const group = useRef<THREE.Group>(null!);
  const sw = useRef<SwarmHandle>(null!);
  const field = useRef<FieldHandle>(null!);
  const n = qualityByTier[store.tier].why;
  const visuals = useMemo(() => allIngredientVisuals().filter((_, i) => i % 2 === 0), []);
  const f = useMemo(() => {
    const drumBase = drum(n, 1.7, 3.2, 8);
    return {
      grid: grid(n, 0.34, 3),
      sphere: cloud(n, 2.1, 0, 12),
      drumBase,
      drum: new Float32Array(n * 3),
      rings: rings(n, 1.35, 5),
      a: new Float32Array(n * 3),
      b: new Float32Array(n * 3),
    };
  }, [n]);
  const ctl = useMemo<FieldControl>(() => ({ t: 0, p: 0, scale: 0, center: new THREE.Vector3(), radius: 2.6 }), []);
  const colored = useRef(-1);

  useChapterFrame('why', group, ({ p, t, dt, camera }) => {
    const s = sw.current;
    if (!s) return;
    group.current.position.x = store.mobile ? 0 : 1.5;
    const seg = Math.min(3, Math.floor(p * 4));
    const local = p * 4 - seg;

    // tambor: recalcula posições girando
    for (let i = 0; i < n; i++) {
      const a = f.drumBase[i * 3] + t * 0.5, x = f.drumBase[i * 3 + 1], r = f.drumBase[i * 3 + 2];
      f.drum[i * 3] = x;
      f.drum[i * 3 + 1] = Math.cos(a) * r;
      f.drum[i * 3 + 2] = Math.sin(a) * r;
    }
    const forms = [f.grid, f.sphere, f.drum, f.rings];
    // transição nas bordas de cada segmento
    const next = Math.min(3, seg + 1);
    const tr = seg < 3 ? easeInOut(range(local, 0.82, 1)) : 0;
    mixFormations(s.swarm.target, forms[seg], forms[next], tr, s.swarm.seed, 0.3);
    if (seg === 3) {
      // anéis girando lentamente
      const rot = t * 0.15;
      for (let i = 0; i < n; i++) {
        const j = i * 3, x = s.swarm.target[j], z = s.swarm.target[j + 2];
        s.swarm.target[j] = x * Math.cos(rot) - z * Math.sin(rot);
        s.swarm.target[j + 2] = x * Math.sin(rot) + z * Math.cos(rot);
      }
    }
    s.swarm.scale.fill(1);

    // 01: só alguns grãos "selecionados" ficam acesos
    const mode = seg === 0 ? 0 : 1;
    if (colored.current !== mode) {
      colored.current = mode;
      s.setColors((i, c) => {
        const k = 0.8 + s.swarm.seed[i * 4 + 1] * 0.3;
        if (mode === 0) return i % 11 === 0 ? c.setRGB(1.6, 1.25, 0.9) : c.setRGB(0.2, 0.19, 0.18);
        return c.setRGB(k, k * 0.97, k * 0.94);
      });
    }
    if (store.pointer.active && !store.reduced) s.swarm.repel(pointerRay(camera, store.pointer.x, store.pointer.y), 0.6, 10 + store.pointer.speed * 60, 14);
    s.swarm.springs(dt);
    s.swarm.commit(s.mesh, 0.13, t * 0.4);
    s.uniforms.uGlow.value = 0;

    ctl.t = t;
    ctl.scale = seg === 1 ? Math.sin(Math.PI * range(local, 0, 1)) ** 0.5 : 0;
    field.current.update(ctl);

    const camPoses = [
      [0, 2.6, 4.2, 0, -1.1, -1],
      [0, 0.3, 6.6, 0, 0, 0],
      [2.2, 1.2, 5.4, 0, 0, 0],
      [0, 0.4, 6.2, 0, 0, 0],
    ];
    const A = camPoses[seg], B = camPoses[next];
    const k = tr;
    setCamera(
      camera,
      { x: lerp(A[0], B[0], k) + Math.sin(t * 0.1) * 0.2, y: lerp(A[1], B[1], k), z: lerp(A[2], B[2], k) },
      { x: lerp(A[3], B[3], k), y: lerp(A[4], B[4], k), z: lerp(A[5], B[5], k) },
      32,
    );
    setLights({
      key: ['#fff0dc', 2.2, [3, 4, 4]],
      rim: ['#FF6A00', 7, [-3, 2, -3]],
      fill: ['#a34a1f', 0.4],
      env: 0.8,
      background: '#000000',
      fog: 0.02,
      bloom: 0.5,
      focus: 6,
      bokeh: 0,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'why' }}>
      <PeanutSwarm ref={sw} count={n} seed={31} />
      <IngredientField ref={field} visuals={visuals} density={10} mode="orbit" seed={17} size={0.7} />
    </group>
  );
}
