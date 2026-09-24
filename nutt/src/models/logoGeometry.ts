import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { logo } from '@/components/brand/logo';

/** Converte ponto do viewBox do SVG em coordenadas da geometria centralizada. */
export const logoScale = (height: number) => height / logo.viewBox.h;

export function logoToWorld(px: number, py: number, height: number) {
  const s = logoScale(height);
  return new THREE.Vector2((px - logo.viewBox.w / 2) * s, -(py - logo.viewBox.h / 2) * s);
}

/** Símbolo NUTT extrudado com bisel arredondado (ver logo.ts para trocar pelo oficial). */
export function createLogoGeometry(height = 2, depth = 0.34) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${logo.viewBox.w} ${logo.viewBox.h}"><path d="${logo.path}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
  const s = logoScale(height);
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth: depth / s,
    bevelEnabled: true,
    bevelThickness: 3.2,
    bevelSize: 2.6,
    bevelSegments: 8,
    curveSegments: 48,
  });
  g.scale(s, -s, s);
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  // centraliza pelo viewBox (não pela bbox) para bater com logoToWorld
  g.translate((-logo.viewBox.w / 2) * s, (logo.viewBox.h / 2) * s, -(bb.max.z + bb.min.z) / 2);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
