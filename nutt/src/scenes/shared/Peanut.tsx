'use client';
import type { ThreeElements } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createPeanutGeometry } from '@/models/peanut';
import { createPeanutMaterial, type PeanutUniforms } from '@/shaders/peanutMaterial';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';

export type PeanutHandle = { group: THREE.Group; uniforms: PeanutUniforms; material: THREE.MeshPhysicalMaterial };

type Props = { coat?: string; half?: 1 | -1; seed?: number } & ThreeElements['group'];

/** Grão herói em alta resolução (macro, transformação, crunch). */
export const Peanut = forwardRef<PeanutHandle, Props>(function Peanut({ coat, half, seed = 1, ...rest }, ref) {
  const group = useRef<THREE.Group>(null!);
  const [ws, hs] = qualityByTier[store.tier].peanutSeg;
  const geometry = useMemo(() => createPeanutGeometry({ widthSegments: ws, heightSegments: hs, half, seed }), [ws, hs, half, seed]);
  const { material, uniforms } = useMemo(() => createPeanutMaterial({ coat, lowQuality: store.tier === 'low' }), [coat]);
  useImperativeHandle(ref, () => ({ group: group.current, uniforms, material }), [uniforms, material]);
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);
  return (
    <group ref={group} {...rest}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
});
