'use client';
import { useEffect, useState } from 'react';
import { copy } from '@/data/copy';
import { store, useStore } from '@/utils/store';

/** Easter egg: parado por alguns segundos? "Vai ficar só olhando?" (máx. 2x por sessão). */
export function IdleHint({ delay = 8000 }) {
  const ready = useStore((s) => s.ready);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let shown = 0;
    try {
      shown = Number(sessionStorage.getItem('nutt-idle') ?? 0);
    } catch {}
    let timer = 0;
    const arm = () => {
      setVisible(false);
      clearTimeout(timer);
      if (shown >= 2) return;
      timer = window.setTimeout(() => {
        if (store.detail !== null || document.hidden) return arm();
        shown++;
        try {
          sessionStorage.setItem('nutt-idle', String(shown));
        } catch {}
        setVisible(true);
      }, delay);
    };
    const events = ['pointermove', 'wheel', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [ready, delay]);

  return (
    <div className={`idle-hint${visible ? ' is-visible' : ''}`} role="status" aria-live="polite">
      {visible ? copy.idle : ''}
    </div>
  );
}
