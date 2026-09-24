'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Cursor custom: ponto laranja; sobre clicáveis cresce e mostra a intenção
 * (VER / PROVAR / ABRIR / DESCOBRIR via data-cursor). Só em ponteiro fino.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    setEnabled(fine.matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (!enabled || !root.current) return;
    document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0, visible = false;
    const el = root.current!;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        cx = x;
        cy = y;
        el.style.opacity = '1';
      }
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, [role="tab"]');
      if (t) {
        el.classList.add('is-active');
        setLabel(t.dataset.cursor ?? (t.tagName === 'A' ? 'ABRIR' : 'VER'));
      } else {
        el.classList.remove('is-active');
        setLabel('');
      }
    };
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');
    const hide = () => {
      visible = false;
      el.style.opacity = '0';
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', hide);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', hide);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={root} className="cursor" aria-hidden style={{ opacity: 0 }}>
      <div className="cursor__dot">
        <span className="cursor__label">{label}</span>
      </div>
    </div>
  );
}
