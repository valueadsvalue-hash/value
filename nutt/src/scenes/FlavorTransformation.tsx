'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { featuredProduct } from '@/data/products';
import { site } from '@/data/site';
import { easeInOut, lerp, range } from '@/utils/math';
import { setCamera, setLights } from './rig';
import { IngredientField, type FieldControl, type FieldHandle } from './shared/IngredientField';
import { Peanut, type PeanutHandle } from './shared/Peanut';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * TRANSFORMAÇÃO — controlada pelo scroll:
 *   0%   amendoim tostado
 *   50%  ingredientes em espiral envolvendo o grão; a cobertura nasce pela máscara do shader
 *   100% produto NUTT: brilhante, texturizado, cristais cintilando
 * Totalmente reversível (voltar o scroll "desfaz" a cobertura).
 */
export default function FlavorTransformation() {
  const group = useRef<THREE.Group>(null!);
  const peanut = useRef<PeanutHandle>(null!);
  const field = useRef<FieldHandle>(null!);
  const product = useMemo(() => featuredProduct(site.featuredProductId), []);
  const ctl = useMemo<FieldControl>(() => ({ t: 0, p: 0, scale: 1, center: new THREE.Vector3(), radius: 1 }), []);
  const v = useMemo(() => ({ cam: new THREE.Vector3(), look: new THREE.Vector3(0, 0, 0) }), []);
  const accent = useMemo(() => new THREE.Color(product.accentColor), [product]);

  useChapterFrame('transformation', group, ({ p, t, camera }) => {
    const ang = lerp(-0.6, 0.9, easeInOut(p)) + t * 0.03;
    const dist = lerp(4.4, 3.1, easeInOut(range(p, 0.55, 1)));
    v.cam.set(Math.sin(ang) * dist, lerp(0.8, 0.25, p), Math.cos(ang) * dist);
    setCamera(camera, v.cam, v.look, 30);

    const pn = peanut.current;
    pn.group.rotation.set(0.25, t * 0.18 + p * 2.2, 0.55);
    pn.group.scale.setScalar(0.7);
    pn.uniforms.uCoat.value = easeInOut(range(p, 0.28, 0.82));
    pn.uniforms.uGloss.value = easeInOut(range(p, 0.62, 0.95));
    pn.uniforms.uSparkle.value = range(p, 0.78, 1);
    pn.uniforms.uGlow.value = 0;

    ctl.t = t;
    ctl.p = range(p, 0.08, 0.8);
    ctl.radius = 0.95;
    ctl.scale = range(p, 0.04, 0.16);
    field.current.update(ctl);

    const warm = range(p, 0.3, 1);
    setLights({
      key: ['#fff4ea', lerp(2.2, 2.8, warm), [2.5, 3.5, 3]],
      rim: [`#${new THREE.Color('#FF6A00').lerp(accent, warm * 0.5).getHexString()}`, lerp(4, 6.5, warm), [-3, 1.5, -3]],
      fill: ['#a34a1f', 0.4],
      env: lerp(0.8, 1.2, warm),
      background: '#000000',
      fog: 0,
      bloom: lerp(0.45, 0.8, range(p, 0.75, 1)),
      focus: dist,
      bokeh: 1.5,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'transformation' }}>
      <Peanut ref={peanut} coat={product.coating} seed={4} />
      <IngredientField ref={field} visuals={product.visuals} density={28} mode="spiral" seed={3} size={0.55} />
    </group>
  );
}
