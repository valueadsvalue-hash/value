'use client';
import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { products } from '@/data/products';
import { Pouch } from '@/scenes/shared/Pouch';
import { Studio } from '@/scenes/shared/Studio';
import { clamp, damp } from '@/utils/math';
import { detectTier } from '@/utils/quality';
import { PouchFallback } from './ProductInfo';

/**
 * Experiência da embalagem (página do sabor): pouch em estúdio, reage ao cursor com
 * rotação limitada (±18° / ±10°). Arrastar funciona no touch.
 */
function Tilted({ slug }: { slug: string }) {
  const g = useRef<THREE.Group>(null!);
  const product = products.find((p) => p.slug === slug)!;
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1);
      pointer.current.y = clamp(-(e.clientY / innerHeight) * 2 + 1, -1, 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    g.current.rotation.y = damp(g.current.rotation.y, pointer.current.x * 0.32 + Math.sin(t * 0.4) * 0.05, 4, dt);
    g.current.rotation.x = damp(g.current.rotation.x, -pointer.current.y * 0.17, 4, dt);
    g.current.position.y = Math.sin(t * 0.8) * 0.02;
  });
  return (
    <group ref={g}>
      <Pouch product={product} />
    </group>
  );
}

export default function PouchViewer({ slug }: { slug: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const { webgl } = detectTier();
    setOk(webgl && !matchMedia('(prefers-reduced-motion: reduce)').matches ? true : webgl);
    document.documentElement.classList.remove('is-loading', 'intro-pending');
  }, []);
  const product = products.find((p) => p.slug === slug)!;
  if (ok === false)
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <PouchFallback product={product} />
      </div>
    );
  if (ok === null) return null;
  return (
    <Canvas dpr={[1, 1.75]} camera={{ fov: 30, position: [0, 0.05, 3.1] }} gl={{ antialias: true }} aria-hidden>
      <color attach="background" args={[product.background]} />
      <directionalLight position={[2.5, 3, 4]} intensity={2.2} color="#fff1e2" />
      <directionalLight position={[-3.2, 1.2, -2]} intensity={9} color={product.accentColor} />
      <hemisphereLight args={['#1a1410', product.color, 0.4]} />
      <Studio />
      <Tilted slug={slug} />
      <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={5} blur={2.4} far={2} color="#000" />
    </Canvas>
  );
}
