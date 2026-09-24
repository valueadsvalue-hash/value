'use client';
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

/** Feixe volumétrico barato: cone aditivo com gradiente e ruído no shader. */
export const LightShaft = forwardRef<THREE.Mesh, { color?: string; opacity?: number }>(function LightShaft({ color = '#ff9a4a', opacity = 0.14 }, ref) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
          void main(){
            float along = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
            float edge = pow(abs(dot(vN, vV)), 1.5);
            float streak = 0.75 + 0.25 * sin(vUv.x * 40.0 + uTime * 0.3) * sin(vUv.x * 13.0 - uTime * 0.2);
            gl_FragColor = vec4(uColor * along * edge * streak * uOpacity, 1.0);
          }`,
      }),
    [color, opacity],
  );
  const geometry = useMemo(() => new THREE.CylinderGeometry(0.2, 2.6, 14, 48, 1, true), []);
  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={5} />;
});
