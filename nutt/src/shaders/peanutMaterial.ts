import * as THREE from 'three';
import { getPeanutTextures } from '@/textures/peanutTextures';

/**
 * Material PBR do amendoim com extensão GLSL (onBeforeCompile) — o PBR do Three continua
 * responsável pela luz; o shader só adiciona o que conta a história:
 *  uCoat     0→1  cobertura de sabor crescendo pela máscara de ruído (transformação)
 *  uGloss    0→1  brilho de calda (clearcoat + roughness baixa)
 *  uSparkle  0→1  cristais de açúcar/sal cintilando com o ângulo de visão
 *  uGlow     0→1  brilho laranja "partícula" (antes de descobrirmos que é amendoim)
 *  aFlat          face interna das metades (creme, sem cobertura)
 */
export type PeanutUniforms = {
  uCoat: { value: number };
  uGloss: { value: number };
  uSparkle: { value: number };
  uGlow: { value: number };
  /** Distâncias (view space) em que o brilho some: perto = amendoim real, longe = luz. */
  uGlowNear: { value: number };
  uGlowFar: { value: number };
  uCoatColor: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uFlatColor: { value: THREE.Color };
  uCoatMask: { value: THREE.Texture };
};

export function createPeanutMaterial(opts: { coat?: string; instanced?: boolean; lowQuality?: boolean } = {}) {
  const tex = getPeanutTextures();
  const uniforms: PeanutUniforms = {
    uCoat: { value: 0 },
    uGloss: { value: 0 },
    uSparkle: { value: 0 },
    uGlow: { value: 0 },
    uGlowNear: { value: -1 },
    uGlowFar: { value: 0 },
    uCoatColor: { value: new THREE.Color(opts.coat ?? '#9a4a14') },
    uGlowColor: { value: new THREE.Color('#FF6A00') },
    uFlatColor: { value: new THREE.Color('#e8cfa0') },
    uCoatMask: { value: tex.coatMask },
  };

  const mat = new THREE.MeshPhysicalMaterial({
    map: tex.map,
    bumpMap: opts.lowQuality ? null : tex.bump,
    bumpScale: 1.4,
    roughnessMap: tex.roughness,
    roughness: 0.78,
    metalness: 0,
    clearcoat: 0.0001, // habilita o caminho de clearcoat no shader (controlado por uGloss)
    clearcoatRoughness: 0.12,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color('#ffc890'),
  });
  mat.customProgramCacheKey = () => `peanut-${opts.lowQuality ? 'lq' : 'hq'}`;

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute float aFlat;
         varying float vFlat;
         varying vec2 vUvP;
         varying vec3 vObjN;`,
      )
      .replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
         vUvP = uv;
         vFlat = aFlat;
         vObjN = normal;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uCoat, uGloss, uSparkle, uGlow, uGlowNear, uGlowFar;
         uniform vec3 uCoatColor, uGlowColor, uFlatColor;
         uniform sampler2D uCoatMask;
         varying float vFlat;
         varying vec2 vUvP;
         varying vec3 vObjN;
         float nuttHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
         float coatAmt;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
         float m = texture2D(uCoatMask, vUvP).r;
         coatAmt = smoothstep(m - 0.1, m + 0.1, uCoat * 1.25 - 0.12) * (1.0 - vFlat);
         vec3 coatCol = uCoatColor * (0.55 + 0.55 * m) + diffuseColor.rgb * 0.08;
         diffuseColor.rgb = mix(diffuseColor.rgb, coatCol, coatAmt);
         // face interna: creme com gérmen levemente mais escuro
         diffuseColor.rgb = mix(diffuseColor.rgb, uFlatColor * (0.9 + 0.1 * m), vFlat);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = mix(roughnessFactor, 0.28, coatAmt * 0.7);
         roughnessFactor = mix(roughnessFactor, 0.14, coatAmt * uGloss);
         roughnessFactor = mix(roughnessFactor, 0.9, vFlat);`,
      )
      .replace(
        '#include <lights_physical_fragment>',
        `#include <lights_physical_fragment>
         #ifdef USE_CLEARCOAT
           material.clearcoat = coatAmt * uGloss;
           material.clearcoatRoughness = 0.08;
         #endif`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         // cristais: células que acendem conforme o ângulo de visão
         vec2 g = vUvP * vec2(420.0, 210.0);
         vec2 cell = floor(g);
         float h = nuttHash(cell);
         float facing = dot(normalize(vNormal), normalize(vViewPosition));
         float grain = smoothstep(0.32, 0.0, length(fract(g) - 0.5 - (vec2(nuttHash(cell + 3.1), h) - 0.5) * 0.4));
         float tw = step(0.9, h) * smoothstep(0.75, 1.0, fract(h * 23.0 + facing * 2.5));
         totalEmissiveRadiance += vec3(1.0, 0.9, 0.75) * grain * tw * uSparkle * coatAmt * 0.9;
         // brilho laranja de "partícula" (fresnel + núcleo)
         float fres = pow(1.0 - abs(facing), 2.0);
         float glowDist = smoothstep(uGlowNear, uGlowFar, length(vViewPosition));
         totalEmissiveRadiance += uGlowColor * uGlow * glowDist * (0.55 + fres * 1.6);`,
      );
  };

  return { material: mat, uniforms };
}
