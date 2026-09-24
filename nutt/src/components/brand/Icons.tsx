/** Ícones lineares, laranja, minimalistas (stroke = currentColor). */
type P = { className?: string };
const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconSelect = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M17 9c-5 0-8 4-8 9 0 3 1.5 5 1.5 7.5S9 30 9 33c0 5 3.5 8 8 8s8-3 8-8c0-3-1.5-5-1.5-7.5S25 21 25 18c0-5-3-9-8-9Z" />
    <path d="M17 13v24" opacity=".5" />
    <circle cx="33" cy="17" r="7" />
    <path d="m38 22 5 5" />
    <path d="m30 17 2 2 4-4" />
  </svg>
);

export const IconLeaf = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M24 42c-9-4-13-12-12-21 1-7 6-12 12-15 6 3 11 8 12 15 1 9-3 17-12 21Z" />
    <path d="M24 42V14" />
    <path d="m24 24 6-5M24 31l7-5M24 24l-6-5M24 31l-7-5" opacity=".7" />
  </svg>
);

export const IconHeart = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M24 40S7 30 7 18c0-6 4.5-10 9.5-10 3.4 0 6 1.8 7.5 4.5C25.5 9.8 28.1 8 31.5 8 36.5 8 41 12 41 18c0 12-17 22-17 22Z" />
  </svg>
);

export const IconSmile = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="16" cy="12" r="2.5" />
    <circle cx="32" cy="12" r="2.5" />
    <path d="M9 22c0 9 6.5 16 15 16s15-7 15-16" />
  </svg>
);

export const IconSound = ({ className, on }: P & { on: boolean }) => (
  <svg {...base} viewBox="0 0 24 24" className={className}>
    <path d="M4 9h3l5-4v14l-5-4H4z" />
    {on ? (
      <>
        <path d="M16 9c1 1 1.5 2 1.5 3s-.5 2-1.5 3" />
        <path d="M18.5 6.5C20 8 21 10 21 12s-1 4-2.5 5.5" />
      </>
    ) : (
      <path d="m16 10 4 4m0-4-4 4" />
    )}
  </svg>
);

export const IconArrow = ({ className, dir = 'right' }: P & { dir?: 'left' | 'right' | 'down' }) => {
  const r = dir === 'left' ? 180 : dir === 'down' ? 90 : 0;
  return (
    <svg {...base} viewBox="0 0 24 24" className={className} style={{ transform: `rotate(${r}deg)` }}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
};

export const icons = { select: IconSelect, leaf: IconLeaf, heart: IconHeart, smile: IconSmile } as const;
