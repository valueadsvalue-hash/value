'use client';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { logo } from '../brand/logo';
import { store, useStore } from '@/utils/store';

/**
 * Loading NUTT: o símbolo se enche de laranja com o progresso REAL (fontes, chunk 3D,
 * texturas, compilação de shaders). Em 100% o símbolo expande e a experiência começa.
 */
export function Loader({ onExit }: { onExit: () => void }) {
  const target = useStore((s) => s.loadProgress);
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const symbol = useRef<SVGSVGElement>(null);
  const val = useRef({ v: 0 });
  const exiting = useRef(false);
  const { w, h } = logo.viewBox;

  useEffect(() => {
    const tw = gsap.to(val.current, {
      v: target,
      duration: target >= 1 ? 0.5 : 0.9,
      ease: 'power2.out',
      onUpdate: () => setShown(val.current.v),
      onComplete: () => {
        if (target < 1 || exiting.current) return;
        exiting.current = true;
        const reduced = store.reduced;
        const tl = gsap.timeline({
          onComplete: () => {
            setGone(true);
          },
        });
        tl.to(symbol.current, { scale: reduced ? 1 : 26, duration: reduced ? 0.01 : 1.05, ease: 'power4.in', transformOrigin: '50% 60%' }, 0.15)
          .to(root.current, { opacity: 0, duration: 0.45, ease: 'power1.out' }, reduced ? 0.2 : 0.85)
          .call(onExit, [], reduced ? 0.2 : 0.9);
      },
    });
    return () => {
      tw.kill();
    };
  }, [target, onExit]);

  if (gone) return null;
  const pct = Math.round(shown * 100);
  const fillY = h - h * shown;
  return (
    <div ref={root} className="loader" role="progressbar" aria-label="Carregando a experiência NUTT" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <svg ref={symbol} className="loader__symbol" viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <defs>
          <clipPath id="loader-clip">
            <path d={logo.path} />
          </clipPath>
        </defs>
        <path d={logo.path} fill="#140c07" stroke="rgba(255,106,0,.35)" strokeWidth="1" />
        <g clipPath="url(#loader-clip)">
          <rect x="0" y={fillY} width={w} height={h} fill="#FF6A00" />
        </g>
      </svg>
      <span className="loader__pct" aria-hidden>
        {String(pct).padStart(2, '0')}%
      </span>
    </div>
  );
}
