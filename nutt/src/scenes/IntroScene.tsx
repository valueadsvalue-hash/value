'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { brand, logo } from '@/components/brand/logo';
import { createLogoGeometry, logoToWorld } from '@/models/logoGeometry';
import { clamp, easeIn, easeInOut, easeOut, lerp, range } from '@/utils/math';
import { store } from '@/utils/store';
import { setCamera, setLights } from './rig';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * ABERTURA — o símbolo nasce minúsculo, um brilho laranja o percorre, ganha volume
 * (extrusão animada) e, com o scroll, a câmera atravessa o "n": o visitante ENTRA na marca.
 */
const H = 2;

function useLogoMaterial() {
  return useMemo(() => {
    // corte diagonal laranja/marrom da identidade, em coordenadas do objeto
    const a = logoToWorld(logo.brown[0][0], logo.brown[0][1], H);
    const b = logoToWorld(logo.brown[1][0], logo.brown[1][1], H);
    const c = logoToWorld(100, 100, H);
    const side = Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
    const uniforms = {
      uSweep: { value: -3 },
      uGlint: { value: 0 },
      uEdge: { value: 0.0 },
      uA: { value: a },
      uB: { value: b },
      uSide: { value: side },
      uOrange: { value: new THREE.Color(brand.orange) },
      uBrown: { value: new THREE.Color(brand.brown) },
    };
    const mat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.28,
      sheen: 0.4,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ffb070'),
      envMapIntensity: 1,
    });
    mat.customProgramCacheKey = () => 'nutt-logo';
    mat.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, uniforms);
      s.vertexShader = s.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = position;');
      s.fragmentShader = s.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uSweep, uGlint, uEdge, uSide;\nuniform vec2 uA, uB;\nuniform vec3 uOrange, uBrown;\nvarying vec3 vObjPos;')
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
           vec2 dd = uB - uA;
           float sd = (dd.x * (vObjPos.y - uA.y) - dd.y * (vObjPos.x - uA.x)) * uSide;
           diffuseColor.rgb = mix(uOrange, uBrown, smoothstep(-0.004, 0.004, sd));`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
           float diag = vObjPos.x * 0.9 + vObjPos.y * 0.45;
           float band = exp(-pow((diag - uSweep) / 0.09, 2.0));
           float face = smoothstep(0.2, 0.9, abs(normalize(vNormal).z));
           totalEmissiveRadiance += vec3(1.0, 0.62, 0.3) * band * uGlint * (0.5 + 0.5 * face) * 1.6;
           float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 3.0);
           totalEmissiveRadiance += vec3(1.0, 0.42, 0.0) * uEdge * (0.25 + fres) * 0.6;`,
        );
    };
    return { mat, uniforms };
  }, []);
}

export default function IntroScene() {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const geometry = useMemo(() => createLogoGeometry(H, 0.36), []);
  const { mat, uniforms } = useLogoMaterial();
  const passage = useMemo(() => logoToWorld(logo.passage.x, logo.passage.y, H), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => {
    geometry.dispose();
    mat.dispose();
  }, [geometry, mat]);

  useChapterFrame('intro', group, ({ p, t, camera }) => {
    const i = store.intro; // 0–1, timeline de tempo da abertura
    const grow = easeInOut(range(i, 0.28, 0.82));
    const m = mesh.current;
    // símbolo pequeno e plano -> volume completo
    const sc = lerp(0.14, 1, grow);
    m.scale.set(sc, sc, Math.max(0.02, grow) * sc);
    uniforms.uSweep.value = lerp(-1.8, 1.8, easeInOut(range(i, 0.1, 0.42)));
    uniforms.uGlint.value = Math.sin(Math.PI * range(i, 0.08, 0.46)) * 1.2 + (store.reduced ? 0 : Math.max(0, Math.sin(t * 0.7 - 2)) * 0.05);
    uniforms.uEdge.value = lerp(0.6, 0.08, grow) * (1 - range(p, 0, 0.5));

    // scroll: o símbolo encara a câmera e ela atravessa o vão do "n"
    const fly = easeIn(range(p, 0.02, 1));
    const px = store.pointer.sx, py = store.pointer.sy;
    const settle = 1 - easeOut(range(p, 0, 0.35));
    m.rotation.y = lerp(-0.55, 0.12, grow) * settle + px * 0.18 * settle + (store.reduced ? 0 : Math.sin(t * 0.4) * 0.04 * settle);
    m.rotation.x = -py * 0.1 * settle + (store.reduced ? 0 : Math.cos(t * 0.35) * 0.02 * settle);
    m.position.y = (store.reduced ? 0 : Math.sin(t * 0.6) * 0.03) * settle;

    // composição de repouso: símbolo acima do centro, NUTT + tagline abaixo (DOM)
    const z = lerp(7.8, -2.6, fly);
    const y = lerp(-0.62, passage.y, easeInOut(range(p, 0, 0.7)));
    camPos.set(0, y, z);
    target.set(0, lerp(-0.62, passage.y, easeInOut(range(p, 0, 0.6))), z - 5);
    setCamera(camera, camPos, target, lerp(32, 48, easeIn(range(p, 0.4, 1))));

    setLights({
      key: ['#fff3e6', lerp(0.3, 1.8, grow) * (1 - fly * 0.8), [2.5, 3, 4]],
      rim: ['#FF6A00', lerp(2, 5, grow), [-3.5, 1.5, -2]],
      fill: ['#a34a1f', 0.25],
      env: lerp(0.15, 0.7, grow) * (1 - clamp(fly * 1.4)),
      background: '#000000',
      fog: 0,
      bloom: 0.7,
      focus: 6,
      bokeh: 0,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'intro' }}>
      <mesh ref={mesh} geometry={geometry} material={mat} />
    </group>
  );
}
