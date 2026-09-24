'use client';
import { gsap } from 'gsap';
import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Common = { children: ReactNode; strength?: number; cursor?: string; className?: string };
type AsLink = Common & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
type AsButton = Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

/** Botão magnético discreto (desligado em touch e com movimento reduzido). */
export function MagneticButton(props: AsLink | AsButton) {
  const { children, strength = 0.28, cursor, className = '', ...rest } = props;
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    const ixTo = gsap.quickTo(inner.current, 'x', { duration: 0.6, ease: 'power3' });
    const iyTo = gsap.quickTo(inner.current, 'y', { duration: 0.6, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo(dx * strength * 0.35);
      iyTo(dy * strength * 0.35);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
      gsap.to(inner.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);

  const content = (
    <span className="magnetic-inner" ref={inner}>
      {children}
    </span>
  );
  if (typeof rest.href === 'string') {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...a} ref={ref as React.Ref<HTMLAnchorElement>} className={`btn ${className}`} data-cursor={cursor}>
        {content}
      </a>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...b} ref={ref as React.Ref<HTMLButtonElement>} className={`btn ${className}`} data-cursor={cursor}>
      {content}
    </button>
  );
}
