import type { Tier } from './store';

/** Orçamento por tier. Mobile/low preserva narrativa, reduz densidade e efeitos. */
export const qualityByTier = {
  low: { universe: 200, why: 150, final: 240, crumbs: 60, ingredients: 0.45, dust: 350, dpr: [1, 1.5] as [number, number], post: false, dof: false, contactShadows: false, peanutSeg: [48, 32] as const, instSeg: [14, 10] as const },
  mid: { universe: 520, why: 260, final: 480, crumbs: 120, ingredients: 0.8, dust: 1000, dpr: [1, 1.75] as [number, number], post: true, dof: false, contactShadows: true, peanutSeg: [112, 72] as const, instSeg: [22, 16] as const },
  high: { universe: 700, why: 320, final: 640, crumbs: 160, ingredients: 1, dust: 1600, dpr: [1, 2] as [number, number], post: true, dof: true, contactShadows: true, peanutSeg: [144, 96] as const, instSeg: [26, 18] as const },
} satisfies Record<Tier, unknown>;

export type Quality = (typeof qualityByTier)[Tier];

export function detectTier(): { tier: Tier; webgl: boolean } {
  let webgl = false;
  let renderer = '';
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      webgl = true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl = false;
  }
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
  if (!webgl || software || coarse || small || cores <= 4 || mem <= 4) return { tier: 'low', webgl: webgl && !software ? true : webgl };
  if (/intel|mali|adreno/i.test(renderer) || cores < 8) return { tier: 'mid', webgl };
  return { tier: 'high', webgl };
}
