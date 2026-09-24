'use client';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createCrumbGeometry } from '@/models/peanut';
import { createPeanutMaterial } from '@/shaders/peanutMaterial';

export type BurstHandle = { burst: (at: THREE.Vector3, power?: number) => void };

const PER = 16;
const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const s = new THREE.Vector3();
const pos = new THREE.Vector3();

/** Estilhaços temporais (easter egg do clique): pool fixo, sem alocação por clique. */
export const BurstPool = forwardRef<BurstHandle, { bursts?: number; size?: number }>(function BurstPool({ bursts = 4, size = 0.05 }, ref) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const n = bursts * PER;
  const geometry = useMemo(() => createCrumbGeometry(), []);
  const { material } = useMemo(() => createPeanutMaterial({ lowQuality: true }), []);
  const state = useMemo(
    () => ({ origin: new Float32Array(n * 3), vel: new Float32Array(n * 3), born: new Float32Array(n).fill(-99), next: 0 }),
    [n],
  );
  const clock = useRef(0);

  useImperativeHandle(ref, () => ({
    burst(at, power = 1) {
      const slot = state.next;
      state.next = (state.next + 1) % bursts;
      for (let k = 0; k < PER; k++) {
        const i = slot * PER + k;
        state.origin.set([at.x, at.y, at.z], i * 3);
        const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, sp = (1.2 + Math.random() * 2.2) * power;
        const r = Math.sqrt(1 - u * u);
        state.vel.set([Math.cos(a) * r * sp, u * sp + 1, Math.sin(a) * r * sp], i * 3);
        state.born[i] = clock.current;
      }
    },
  }));

  useFrame((_, dt) => {
    clock.current += dt;
    const t0 = clock.current;
    let any = false;
    for (let i = 0; i < n; i++) {
      const age = t0 - state.born[i];
      const alive = age >= 0 && age < 1.6;
      if (!alive) {
        m.makeScale(0, 0, 0);
        mesh.current.setMatrixAt(i, m);
        continue;
      }
      any = true;
      const j = i * 3;
      pos.set(
        state.origin[j] + state.vel[j] * age,
        state.origin[j + 1] + state.vel[j + 1] * age - 2.4 * age * age,
        state.origin[j + 2] + state.vel[j + 2] * age,
      );
      e.set(age * 7 + i, age * 5 + i * 2, 0);
      q.setFromEuler(e);
      const sc = size * (0.6 + ((i * 37) % 10) / 12) * (1 - Math.pow(age / 1.6, 3));
      s.set(sc, sc, sc);
      m.compose(pos, q, s);
      mesh.current.setMatrixAt(i, m);
    }
    mesh.current.visible = any;
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <instancedMesh ref={mesh} args={[geometry, material, n]} frustumCulled={false} />;
});
