'use client';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createPeanutGeometry } from '@/models/peanut';
import { createPeanutMaterial, type PeanutUniforms } from '@/shaders/peanutMaterial';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';
import { Swarm } from './swarm';

export type SwarmHandle = { mesh: THREE.InstancedMesh; swarm: Swarm; uniforms: PeanutUniforms; setColors: (fn: (i: number, c: THREE.Color) => void) => void };

/** Muitos amendoins em um único draw call (instancing), com o mesmo material do grão herói. */
export const PeanutSwarm = forwardRef<SwarmHandle, { count: number; seed?: number; coat?: string }>(function PeanutSwarm({ count, seed = 1, coat }, ref) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const [ws, hs] = qualityByTier[store.tier].instSeg;
  const geometry = useMemo(() => createPeanutGeometry({ widthSegments: ws, heightSegments: hs, seed: 3 }), [ws, hs]);
  const { material, uniforms } = useMemo(() => createPeanutMaterial({ coat, lowQuality: true }), [coat]);
  const swarm = useMemo(() => new Swarm(count, seed), [count, seed]);

  useEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // variação natural de torra entre grãos
      const k = 0.78 + swarm.seed[i * 4 + 1] * 0.34;
      mesh.current.setColorAt(i, c.setRGB(k, k * (0.96 + swarm.seed[i * 4] * 0.04), k * 0.95));
    }
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [count, swarm]);

  useImperativeHandle(
    ref,
    () => ({
      mesh: mesh.current,
      swarm,
      uniforms,
      setColors: (fn) => {
        const c = new THREE.Color();
        for (let i = 0; i < count; i++) {
          fn(i, c);
          mesh.current.setColorAt(i, c);
        }
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
      },
    }),
    [swarm, uniforms, count],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
});
