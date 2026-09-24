'use client';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { softSprite } from '@/textures/canvas';
import { mulberry32 } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store } from '@/utils/store';

/**
 * Poeira de luz em torno da câmera (partículas em "caixa" que acompanha a câmera, com wrap).
 * Dá profundidade e sensação de ar/tostagem sem custo relevante.
 */
export function Dust({ color = '#ffb070', size = 0.045, opacity = 0.5, box = 14 }) {
  const count = qualityByTier[store.tier].dust;
  const ref = useRef<THREE.Points>(null!);
  const { geometry, base } = useMemo(() => {
    const r = mulberry32(42);
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) base[i] = (r() - 0.5) * box;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(base), 3));
    return { geometry: g, base };
  }, [count, box]);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        map: softSprite(),
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [size, color, opacity],
  );

  useFrame(({ camera, clock }) => {
    const pts = ref.current;
    if (!pts || store.owner === null) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const t = clock.elapsedTime;
    const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
    const h = box / 2;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      // deriva lenta + wrap na caixa centrada na câmera
      const x = base[j] + Math.sin(t * 0.05 + i) * 0.3;
      const y = base[j + 1] + t * 0.03 + Math.cos(t * 0.04 + i * 0.7) * 0.2;
      const z = base[j + 2];
      arr[j] = cx + ((((x - cx) % box) + box + h) % box) - h;
      arr[j + 1] = cy + ((((y - cy) % box) + box + h) % box) - h;
      arr[j + 2] = cz + ((((z - cz) % box) + box + h) % box) - h;
    }
    pos.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
