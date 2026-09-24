'use client';
import type { ThreeElements } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { forwardRef, Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Product } from '@/data/products';
import { createPouchGeometry } from '@/models/pouch';
import { pouchLabel } from '@/textures/pouchLabel';
import { makeCanvas, toTexture } from '@/textures/canvas';

let sharedGeometry: THREE.BufferGeometry | null = null;
let microBump: THREE.Texture | null = null;

/** Microtextura do filme (soft-touch) compartilhada por todos os pouches. */
function getMicroBump() {
  if (microBump) return microBump;
  const { c, ctx } = makeCanvas(256, 256);
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 60;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  microBump = toTexture(c, false, true);
  microBump.repeat.set(6, 8);
  return microBump;
}

function ProceduralPouch({ product }: { product: Product }) {
  const geometry = useMemo(() => (sharedGeometry ??= createPouchGeometry()), []);
  const materials = useMemo(() => {
    const label = pouchLabel(product);
    const bump = getMicroBump();
    const common = {
      roughness: 1,
      metalness: 0,
      clearcoat: 0.18,
      clearcoatRoughness: 0.45,
      bumpMap: bump,
      bumpScale: 0.35,
      sheen: 0.25,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ff9a4a'),
      envMapIntensity: 0.9,
    };
    const front = new THREE.MeshPhysicalMaterial({ ...common, map: label.map, roughnessMap: label.roughness });
    const back = new THREE.MeshPhysicalMaterial({ ...common, map: label.back, roughness: 0.7 });
    return [front, back];
  }, [product]);
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);
  return <mesh geometry={geometry} material={materials} />;
}

function GLTFPouch({ url }: { url: string }) {
  // Pipeline pronto para o modelo real: Draco servido localmente em /draco/.
  const { scene } = useGLTF(url, '/draco/');
  const clone = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={clone} />;
}

type Props = { product: Product } & ThreeElements['group'];

/** Pouch NUTT: GLB real quando `product.model` existe; senão, procedural a partir dos dados. */
export const Pouch = forwardRef<THREE.Group, Props>(function Pouch({ product, ...rest }, ref) {
  return (
    <group ref={ref} {...rest}>
      {product.model ? (
        <Suspense fallback={<ProceduralPouch product={product} />}>
          <GLTFPouch url={product.model} />
        </Suspense>
      ) : (
        <ProceduralPouch product={product} />
      )}
    </group>
  );
});
