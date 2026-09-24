'use client';
import { useEffect } from 'react';
import { store } from '@/utils/store';

/** Ponteiro global normalizado (-1..1) + velocidade + cliques "no mundo" para as cenas 3D. */
export function usePointer() {
  useEffect(() => {
    let lx = 0, ly = 0, lt = performance.now();
    const move = (e: PointerEvent) => {
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -(e.clientY / innerHeight) * 2 + 1;
      const now = performance.now();
      const dt = Math.max(8, now - lt);
      const v = Math.hypot(x - lx, y - ly) / (dt / 1000);
      store.pointer.speed = Math.min(1, Math.max(store.pointer.speed, v / 6));
      store.pointer.x = x;
      store.pointer.y = y;
      store.pointer.active = e.pointerType === 'mouse' || e.pointerType === 'pen';
      lx = x;
      ly = y;
      lt = now;
    };
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, input, textarea, select, [role="tab"], [role="dialog"], .header, [data-no-world]')) return;
      store.click = { x: (e.clientX / innerWidth) * 2 - 1, y: -(e.clientY / innerHeight) * 2 + 1, t: performance.now() };
    };
    const leave = () => {
      store.pointer.active = false;
      store.pointer.x = 0;
      store.pointer.y = 0;
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);
}
