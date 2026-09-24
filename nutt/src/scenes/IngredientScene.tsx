'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { allIngredientVisuals } from '@/data/products';
import { easeInOut, easeOut, lerp, range } from '@/utils/math';
import { setCamera, setLights } from './rig';
import { IngredientField, type FieldControl, type FieldHandle } from './shared/IngredientField';
import { LightShaft } from './shared/LightShaft';
import { Peanut, type PeanutHandle } from './shared/Peanut';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * INGREDIENTES — o grão gira ("mas NUTT não para no amendoim"), a câmera acelera e
 * atravessa um túnel de ingredientes reais em câmera lenta. Os ingredientes vêm de
 * products.ts (união de todos os sabores) — nada hardcoded.
 */
const TUNNEL: [number, number] = [-4, -64];

export default function IngredientScene() {
  const group = useRef<THREE.Group>(null!);
  const field = useRef<FieldHandle>(null!);
  const peanut = useRef<PeanutHandle>(null!);
  const shaft = useRef<THREE.Mesh>(null!);
  const visuals = useMemo(() => allIngredientVisuals(), []);
  const ctl = useMemo<FieldControl>(() => ({ t: 0, p: 0, scale: 1, center: new THREE.Vector3(), radius: 1 }), []);
  const v = useMemo(() => ({ cam: new THREE.Vector3(), look: new THREE.Vector3() }), []);

  useChapterFrame('ingredients', group, ({ p, t, camera }) => {
    // 0–0.33: grão em rotação; 0.33–0.95: travessia; fim: desacelera no "INGREDIENTES REAIS"
    const intro = range(p, 0, 0.34);
    const travel = easeInOut(range(p, 0.3, 0.97));
    const z = lerp(2.4, -54, travel);
    const sway = Math.sin(travel * Math.PI * 3) * 0.35;
    v.cam.set(sway, Math.cos(travel * Math.PI * 2) * 0.2 + 0.05, z);
    v.look.set(sway * 0.4, 0, z - 6);
    setCamera(camera, v.cam, v.look, lerp(34, 44, Math.sin(Math.PI * travel)), Math.sin(travel * Math.PI * 2) * 0.05);

    const pn = peanut.current;
    pn.group.rotation.set(0.3, t * 0.25 + intro * 2.4, 0.4 + intro * 0.3);
    pn.group.position.set(0, -easeOut(range(p, 0.3, 0.42)) * 1.2, 0);
    pn.group.scale.setScalar(0.62);
    pn.group.visible = p < 0.45;

    ctl.t = t;
    ctl.scale = easeOut(range(p, 0.2, 0.38));
    field.current.update(ctl);

    if (shaft.current) {
      shaft.current.position.set(1.2, 4, z - 7);
      shaft.current.rotation.set(0, 0, -0.35);
      (shaft.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    }

    setLights({
      key: ['#fff0dc', 2.6, [3, 5, z + 1]],
      rim: ['#FF6A00', 6, [-4, -1, z - 5]],
      fill: ['#a34a1f', 0.45],
      env: 0.95,
      background: '#000000',
      fog: lerp(0.02, 0.05, range(p, 0.3, 0.5)),
      bloom: 0.5,
      focus: 3.2,
      bokeh: range(p, 0.35, 0.45) * 5,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'ingredients' }}>
      <Peanut ref={peanut} seed={2} />
      <IngredientField ref={field} visuals={visuals} density={34} mode="tunnel" z={TUNNEL} seed={9} />
      <LightShaft ref={shaft} opacity={0.12} />
    </group>
  );
}
