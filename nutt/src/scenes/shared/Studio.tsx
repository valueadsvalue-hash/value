'use client';
import { Environment, Lightformer } from '@react-three/drei';

/**
 * Estúdio fotográfico: softboxes (Lightformers) renderizados uma única vez num env map.
 * É o "HDRI controlado" — reflexos de estúdio sem baixar nenhum arquivo.
 */
export function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2} color="#fff4ea" position={[0, 4, 3]} scale={[6, 1.2, 1]} rotation-x={Math.PI / 2.4} />
      <Lightformer form="rect" intensity={1.2} color="#ffe2c4" position={[4, 1, 2]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2.5} />
      <Lightformer form="rect" intensity={3} color="#ff6a00" position={[-5, 0.5, -1]} scale={[1.2, 6, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="ring" intensity={0.8} color="#a34a1f" position={[0, -3, -4]} scale={3} />
    </Environment>
  );
}
