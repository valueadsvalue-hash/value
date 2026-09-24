import { useFrame, type RootState } from '@react-three/fiber';
import type { RefObject } from 'react';
import type * as THREE from 'three';
import type { ChapterId } from '@/data/chapters';
import { chapterProgress, store } from '@/utils/store';

export type ChapterFrame = {
  p: number;
  dt: number;
  t: number;
  camera: THREE.Camera;
  state: RootState;
};

/**
 * Só a cena "dona" (capítulo no centro da viewport) é renderizada e atualizada.
 * As trocas acontecem sob o overlay preto, então nunca há corte visível.
 */
export function useChapterFrame(id: ChapterId, group: RefObject<THREE.Group | null>, fn: (f: ChapterFrame) => void) {
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const active = store.owner === id;
    g.visible = active || store.warmup;
    if (!active) return;
    fn({ p: chapterProgress(id), dt: Math.min(delta, 1 / 20), t: state.clock.elapsedTime, camera: state.camera, state });
  });
}
