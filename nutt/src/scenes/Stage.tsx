'use client';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, DepthOfField, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { BloomEffect, DepthOfFieldEffect } from 'postprocessing';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getPeanutTextures } from '@/textures/peanutTextures';
import { damp } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { set, store, useStore } from '@/utils/store';
import CrunchScene from './CrunchScene';
import FinalScene from './FinalScene';
import FlavorTransformation from './FlavorTransformation';
import IngredientScene from './IngredientScene';
import IntroScene from './IntroScene';
import ManifestoScene from './ManifestoScene';
import PeanutUniverse from './PeanutUniverse';
import ProductsScene from './ProductsScene';
import { lightTarget } from './rig';
import { Dust } from './shared/Dust';
import { Studio } from './shared/Studio';
import WhyScene from './WhyScene';

/** Luzes fixas (número constante => sem recompilação); cenas só mudam os alvos. */
function LightRig() {
  const key = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.DirectionalLight>(null!);
  const fill = useRef<THREE.HemisphereLight>(null!);
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color('#000');
    scene.fog = new THREE.FogExp2('#000', 0);
  }, [scene]);
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-4 * Math.min(dt, 0.05));
    key.current.color.lerp(lightTarget.key.color, k);
    key.current.intensity = damp(key.current.intensity, lightTarget.key.intensity, 4, dt);
    key.current.position.lerp(lightTarget.key.position, k);
    rim.current.color.lerp(lightTarget.rim.color, k);
    rim.current.intensity = damp(rim.current.intensity, lightTarget.rim.intensity, 4, dt);
    rim.current.position.lerp(lightTarget.rim.position, k);
    fill.current.groundColor.lerp(lightTarget.fill.color, k);
    fill.current.intensity = damp(fill.current.intensity, lightTarget.fill.intensity, 4, dt);
    scene.environmentIntensity = damp(scene.environmentIntensity, lightTarget.env, 4, dt);
    (scene.background as THREE.Color).lerp(lightTarget.background, 1 - Math.exp(-2.5 * dt));
    const fog = scene.fog as THREE.FogExp2;
    fog.density = damp(fog.density, lightTarget.fog, 3, dt);
    fog.color.copy(scene.background as THREE.Color);
    // luzes direcionais apontam para o que a câmera olha
    key.current.target.position.copy(lightTarget.key.position).setZ(lightTarget.key.position.z - 4).setX(0).setY(0);
    rim.current.target.position.set(0, 0, lightTarget.rim.position.z + 3);
    key.current.target.updateMatrixWorld();
    rim.current.target.updateMatrixWorld();
  });
  return (
    <>
      <directionalLight ref={key} intensity={2} />
      <directionalLight ref={rim} intensity={4} />
      <hemisphereLight ref={fill} args={['#1a1410', '#a34a1f', 0.3]} />
    </>
  );
}

/** Amortece o ponteiro uma vez por frame (a paralaxe é aplicada em setCamera). */
function PointerDamping() {
  useFrame((_, dt) => {
    const p = store.pointer;
    p.sx = damp(p.sx, p.x, 3, dt);
    p.sy = damp(p.sy, p.y, 3, dt);
    p.speed = damp(p.speed, 0, 4, dt);
    store.impact = damp(store.impact, 0, 5, dt);
  });
  return null;
}

function Effects({ dof }: { dof: boolean }) {
  const bloom = useRef<BloomEffect>(null);
  const depth = useRef<DepthOfFieldEffect>(null);
  useFrame((_, dt) => {
    if (bloom.current) bloom.current.intensity = damp(bloom.current.intensity, lightTarget.bloom, 3, dt);
    if (depth.current) {
      depth.current.cocMaterial.focusDistance = damp(depth.current.cocMaterial.focusDistance, lightTarget.focus, 4, dt);
      depth.current.bokehScale = damp(depth.current.bokehScale, lightTarget.bokeh, 3, dt);
    }
  });
  const bloomEl = <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.2} intensity={0.6} radius={0.7} />;
  const vignette = <Vignette offset={0.28} darkness={0.72} />;
  return dof ? (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {bloomEl}
      <DepthOfField ref={depth} focusDistance={5} focusRange={2.2} bokehScale={0} />
      {vignette}
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {bloomEl}
      {vignette}
    </EffectComposer>
  );
}

/**
 * Pré-compila os shaders de todas as cenas durante o loader (evita travadas no meio do
 * scroll) e sinaliza o primeiro frame pronto.
 */
function Warmup({ onDone }: { onDone: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    set('loadProgress', Math.max(store.loadProgress, 0.72));
    store.warmup = true;
    scene.traverse((o) => {
      if (o.userData.chapter) o.visible = true;
    });
    const run = async () => {
      try {
        await gl.compileAsync(scene, camera);
      } catch {
        gl.compile(scene, camera);
      }
      if (cancelled) return;
      store.warmup = false;
      set('loadProgress', 0.94);
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && onDone()));
    };
    const id = setTimeout(run, 60);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [gl, scene, camera, onDone]);
  return null;
}

export default function Stage({ onReady }: { onReady: () => void }) {
  const tier = useStore((s) => s.tier);
  const owner = useStore((s) => s.owner);
  const q = qualityByTier[tier];
  const [dpr, setDpr] = useState(q.dpr[1]);
  // gera as texturas procedurais antes das cenas montarem
  const [texturesReady] = useState(() => {
    getPeanutTextures(tier === 'low' ? 256 : 512);
    set('loadProgress', Math.max(store.loadProgress, 0.6));
    return true;
  });

  return (
    <Canvas
      className="stage-canvas"
      dpr={[q.dpr[0], dpr]}
      frameloop={owner === null ? 'never' : 'always'}
      gl={{ antialias: !q.post, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 32, near: 0.05, far: 160, position: [0, 0, 6.4] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.25))} onIncline={() => setDpr((d) => Math.min(q.dpr[1], d + 0.25))} />
      <AdaptiveDpr pixelated={false} />
      <LightRig />
      <Studio />
      {texturesReady && (
        <Suspense fallback={null}>
          <IntroScene />
          <PeanutUniverse />
          <IngredientScene />
          <FlavorTransformation />
          <CrunchScene />
          <ManifestoScene />
          <ProductsScene />
          <WhyScene />
          <FinalScene />
          <Warmup onDone={onReady} />
        </Suspense>
      )}
      <Dust />
      <PointerDamping />
      {q.post && <Effects dof={q.dof} />}
    </Canvas>
  );
}
