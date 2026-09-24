'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { copy } from '@/data/copy';
import { featuredProduct } from '@/data/products';
import { site } from '@/data/site';
import { lerp, range } from '@/utils/math';
import { setCamera, setLights } from './rig';
import { Peanut, type PeanutHandle } from './shared/Peanut';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * MANIFESTO — respiro. Quase tudo preto; um grão distante recebe um fio de luz que
 * "respira" a cada palavra. A tipografia é a protagonista (DOM).
 */
export default function ManifestoScene() {
  const group = useRef<THREE.Group>(null!);
  const peanut = useRef<PeanutHandle>(null!);
  const product = useMemo(() => featuredProduct(site.featuredProductId), []);
  const beats = copy.manifesto.beats;

  useChapterFrame('manifesto', group, ({ p, t, camera }) => {
    setCamera(camera, { x: 0, y: 0, z: lerp(9, 6.5, p) }, { x: 0, y: 0, z: 0 }, 30);
    // pulso de luz a cada beat
    let pulse = 0;
    for (const b of beats) {
      const k = range(p, b.at[0], b.at[1]);
      if (k > 0 && k < 1) pulse = Math.max(pulse, Math.sin(k * Math.PI));
    }
    const pn = peanut.current;
    pn.group.position.set(lerp(1.6, 0, range(p, 0.72, 0.9)), lerp(-0.2, -1.25, range(p, 0.72, 0.9)), -2.5);
    pn.group.rotation.set(0.4, t * 0.1, 0.8 + p * 1.5);
    pn.group.scale.setScalar(0.7);
    pn.uniforms.uCoat.value = range(p, 0.45, 0.62);
    pn.uniforms.uGloss.value = range(p, 0.5, 0.7);
    pn.uniforms.uSparkle.value = range(p, 0.6, 0.8);

    setLights({
      key: ['#ffe6cc', 0.15 + pulse * 0.5, [2, 2, 3]],
      rim: ['#FF6A00', 1.5 + pulse * 6, [-3, 1, -4]],
      fill: ['#a34a1f', 0.08],
      env: 0.15 + pulse * 0.2,
      background: '#000000',
      fog: 0,
      bloom: 0.6,
      focus: 8,
      bokeh: 0,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'manifesto' }}>
      <Peanut ref={peanut} coat={product.coating} seed={7} />
    </group>
  );
}
