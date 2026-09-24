'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { tunnel } from '@/utils/formations';
import { audio } from '@/utils/audio';
import { clamp, easeInOut, easeOut, lerp, range } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';
import { pointerRay, setCamera, setLights } from './rig';
import { BurstPool, type BurstHandle } from './shared/BurstPool';
import { Peanut, type PeanutHandle } from './shared/Peanut';
import { PeanutSwarm, type SwarmHandle } from './shared/PeanutSwarm';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * UNIVERSO — pontos de luz laranja à distância que, conforme a câmera se aproxima, revelam-se
 * amendoins. Reagem ao cursor (repulsão proporcional à velocidade) e ao clique (crunch).
 * Depois, um único grão toma o centro e a câmera faz o macro.
 */
const Z_START = 2;
const Z_END = -58;
const HERO_Z = -52;

export default function PeanutUniverse() {
  const group = useRef<THREE.Group>(null!);
  const swarmRef = useRef<SwarmHandle>(null!);
  const hero = useRef<PeanutHandle>(null!);
  const bursts = useRef<BurstHandle>(null!);
  const count = qualityByTier[store.tier].universe;
  const base = useMemo(() => tunnel(count, 0.9, 6.5, Z_START, Z_END, 21), [count]);
  const popped = useMemo(() => new Float32Array(count).fill(-99), [count]);
  const tmp = useMemo(() => ({ cam: new THREE.Vector3(), look: new THREE.Vector3(), v: new THREE.Vector3(), lastClick: 0 }), []);

  useChapterFrame('universe', group, ({ p, t, dt, camera }) => {
    const sw = swarmRef.current;
    if (!sw) return;
    const { swarm, mesh, uniforms } = sw;

    // câmera: viagem pelo campo, desaceleração até o grão herói, macro
    const travel = easeInOut(range(p, 0, 0.62));
    const macro = easeInOut(range(p, 0.7, 1));
    const camZ = lerp(Z_START + 4, HERO_Z + 3.4, travel) - macro * 1.55;
    const orbit = macro * 0.9;
    tmp.cam.set(
      Math.sin(t * 0.13) * 0.25 * (1 - travel) + Math.sin(orbit) * 1.4 * macro,
      Math.cos(t * 0.11) * 0.18 * (1 - travel) + macro * 0.25,
      camZ + (1 - Math.cos(orbit)) * 1.2 * macro,
    );
    tmp.look.set(0, 0, lerp(camZ - 6, HERO_Z, range(p, 0.45, 0.65)));
    setCamera(camera, tmp.cam, tmp.look, lerp(38, 29, macro));

    // grão herói entra em cena e ocupa o centro
    const heroIn = easeOut(range(p, 0.48, 0.66));
    const h = hero.current;
    h.group.visible = heroIn > 0.001;
    h.group.position.set(0, 0, HERO_Z);
    h.group.scale.setScalar(lerp(0.2, 0.62, heroIn));
    h.group.rotation.set(0.35 + Math.sin(t * 0.2) * 0.1, t * 0.12 + macro * 1.6, 0.9 - macro * 0.5);
    h.uniforms.uGlow.value = 1 - heroIn;

    // enxame: alvo = túnel, os demais se apagam quando o herói chega
    const fadeOthers = range(p, 0.5, 0.68);
    swarm.target.set(base);
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      swarm.target[j + 1] += Math.sin(t * 0.25 + i) * 0.12;
      const since = t - popped[i];
      const pop = since < 0.12 ? 1 - since / 0.12 : since < 4 ? 0 : clamp((since - 4) / 0.8);
      const hide = clamp((fadeOthers - swarm.seed[i * 4 + 3] * 0.4) / 0.6);
      swarm.scale[i] = (popped[i] < -50 ? 1 : pop) * (1 - hide);
    }
    // cursor: repulsão (easter egg: rápido demais e eles fogem)
    if (store.pointer.active && !store.reduced) {
      const ray = pointerRay(camera, store.pointer.x, store.pointer.y);
      swarm.repel(ray, 0.9, 12 + store.pointer.speed * 90, 22);
    }
    swarm.springs(dt);
    swarm.commit(mesh, 0.24, t * 0.35);

    // pontos de luz -> amendoins (brilho some com a proximidade)
    uniforms.uGlow.value = lerp(1.1, 0.5, range(p, 0, 0.5));
    uniforms.uGlowNear.value = 2.5;
    uniforms.uGlowFar.value = lerp(9, 14, range(p, 0, 0.5));

    // clique num grão = CRUNCH
    const c = store.click;
    if (c && c.t !== tmp.lastClick) {
      tmp.lastClick = c.t;
      const ray = pointerRay(camera, c.x, c.y);
      const idx = swarm.pick(ray, 0.45, 18);
      if (idx >= 0) {
        swarm.position(idx, tmp.v);
        bursts.current.burst(tmp.v, 0.7);
        popped[idx] = t;
        audio.crunch(0.55);
      }
    }

    setLights({
      key: ['#ffe9d2', lerp(0.6, 2.4, range(p, 0.1, 0.6)), macro > 0 ? [4, 1.5, HERO_Z + 1] : [2, 4, camZ + 2]],
      rim: ['#FF6A00', lerp(3, 7, macro), [-3, 1, HERO_Z - 2]],
      fill: ['#a34a1f', 0.35],
      env: lerp(0.25, 0.9, range(p, 0.2, 0.7)),
      background: '#000000',
      fog: lerp(0.06, 0.035, travel),
      bloom: lerp(1.1, 0.5, range(p, 0, 0.6)),
      focus: macro > 0 ? tmp.cam.distanceTo(h.group.position) : 6,
      bokeh: macro * 4,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'universe' }}>
      <PeanutSwarm ref={swarmRef} count={count} seed={21} />
      <Peanut ref={hero} seed={2} />
      <BurstPool ref={bursts} bursts={4} size={0.045} />
    </group>
  );
}
