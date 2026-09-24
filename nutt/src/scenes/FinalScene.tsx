'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { cloud, logoFormation } from '@/utils/formations';
import { easeInOut, easeOut, lerp, range } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';
import { pointerRay, setCamera, setLights } from './rig';
import { PeanutSwarm, type SwarmHandle } from './shared/PeanutSwarm';
import { mixFormations } from './shared/swarm';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * FINAL — centenas de amendoins surgem ao longe, se organizam no símbolo NUTT, acendem,
 * e se dissolvem para abrir espaço ao CTA.
 */
export default function FinalScene() {
  const group = useRef<THREE.Group>(null!);
  const sw = useRef<SwarmHandle>(null!);
  const n = qualityByTier[store.tier].final;
  const f = useMemo(() => {
    const far = cloud(n, 16, -14, 40);
    const logo = logoFormation(n, 3.6, 41);
    const burst = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = logo[i * 3], y = logo[i * 3 + 1];
      const len = Math.hypot(x, y) + 0.2;
      burst[i * 3] = x + (x / len) * 7;
      burst[i * 3 + 1] = y + (y / len) * 7;
      burst[i * 3 + 2] = 3 + (i % 7);
    }
    return { far, logo, burst, tmp: new Float32Array(n * 3) };
  }, [n]);

  useChapterFrame('final', group, ({ p, t, dt, camera }) => {
    const s = sw.current;
    if (!s) return;
    const form = range(p, 0.08, 0.5);
    const dissolve = range(p, 0.66, 0.84);
    mixFormations(f.tmp, f.far, f.logo, form, s.swarm.seed, 0.45);
    mixFormations(s.swarm.target, f.tmp, f.burst, dissolve, s.swarm.seed, 0.3);
    // respiração sutil quando o símbolo está formado
    for (let i = 0; i < n; i++) {
      s.swarm.target[i * 3 + 2] += Math.sin(t * 0.8 + i) * 0.03 * form;
      s.swarm.scale[i] = 1 - easeOut(range(dissolve, 0.2 + s.swarm.seed[i * 4 + 3] * 0.4, 1));
    }
    if (store.pointer.active && !store.reduced) s.swarm.repel(pointerRay(camera, store.pointer.x, store.pointer.y), 0.5, 8 + store.pointer.speed * 60, 16);
    s.swarm.springs(dt);
    s.swarm.commit(s.mesh, lerp(0.16, 0.085, easeInOut(form)), t * 0.3 * (1 - form * 0.8));

    const lit = range(p, 0.44, 0.58) * (1 - dissolve);
    s.uniforms.uGlow.value = lerp(0.9, 0, form) + lit * 0.35;
    s.uniforms.uGlowNear.value = 3;
    s.uniforms.uGlowFar.value = 12;

    setCamera(camera, { x: Math.sin(t * 0.1) * 0.15, y: 0, z: lerp(10, 7.2, easeInOut(range(p, 0, 0.6))) }, { x: 0, y: 0, z: 0 }, 34);
    setLights({
      key: ['#fff0dc', lerp(1.2, 2.6, form), [2.5, 3, 5]],
      rim: ['#FF6A00', lerp(4, 12, lit), [-2.5, 1.5, -3]],
      fill: ['#a34a1f', 0.35],
      env: 0.8,
      background: '#000000',
      fog: lerp(0.04, 0.0, form),
      bloom: lerp(0.9, 0.7, form),
      focus: 7,
      bokeh: 0,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'final' }}>
      <PeanutSwarm ref={sw} count={n} seed={41} />
    </group>
  );
}
