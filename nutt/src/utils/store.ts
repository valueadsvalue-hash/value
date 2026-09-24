import { chapters, type ChapterId } from '@/data/chapters';
import { useSyncExternalStore } from 'react';

export type Tier = 'low' | 'mid' | 'high';

/**
 * Estado global mutável, lido a cada frame pelas cenas 3D (sem re-render do React).
 * Chaves que a UI precisa observar são emitidas via `set()` e lidas com `useStore()`.
 */
const state = {
  progress: Object.fromEntries(chapters.map((c) => [c.id, 0])) as Record<ChapterId, number>,
  visible: Object.fromEntries(chapters.map((c) => [c.id, c.id === 'intro'])) as Record<ChapterId, boolean>,
  /** Capítulo dono da câmera (o que ocupa o centro da viewport). */
  owner: 'intro' as ChapterId | null,
  /** Velocidade do scroll (px/frame, suavizada). */
  scrollVelocity: 0,
  pointer: { x: 0, y: 0, sx: 0, sy: 0, speed: 0, active: false },
  /** Pulso de clique em coordenadas normalizadas (consumido pelas cenas). */
  click: null as null | { x: number; y: number; t: number },
  reduced: false,
  mobile: false,
  tier: 'mid' as Tier,
  webgl: true,
  loadProgress: 0,
  ready: false,
  /** 0→1 na timeline de abertura (tempo, não scroll). */
  intro: 0,
  selected: 0,
  detail: null as null | number,
  /** 0→1 animado pela transição cinematográfica do detalhe. */
  detailT: 0,
  gyro: { x: 0, y: 0, active: false },
  sound: false,
  /** Momentos de impacto (crunch) para shake de câmera. */
  impact: 0,
  /** Durante a pré-compilação de shaders todas as cenas ficam visíveis. */
  warmup: false,
};

export type State = typeof state;
type Key = keyof State;

const listeners = new Set<() => void>();
let version = 0;

export const store = state;

export function set<K extends Key>(key: K, value: State[K]) {
  if (state[key] === value) return;
  state[key] = value;
  version++;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/** Progresso local de um capítulo — ou o "still" quando o movimento é reduzido. */
export function chapterProgress(id: ChapterId) {
  if (state.reduced) return chapters.find((c) => c.id === id)!.poster;
  return state.progress[id];
}

export const getVersion = () => version;
