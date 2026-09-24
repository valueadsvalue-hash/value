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
    <path d="M10 38C10 20 22 9 40 8c1 18-10 30-28 30Z" />
    <path d="M10 38 30 18" />
    <path d="M18 30h8M22 26v-7" opacity=".6" />
  </svg>
);

export const IconHand = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 30c6 0 10 3 12 7h14c3 0 6-2 6-5" />
    <path d="M20 37c-2-3-2-7 1-9l7-5" />
    <ellipse cx="30" cy="14" rx="5" ry="7" transform="rotate(35 30 14)" />
    <path d="M30 10v8" opacity=".5" transform="rotate(35 30 14)" />
  </svg>
);

export const IconLink = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="18" cy="24" r="10" />
    <circle cx="30" cy="24" r="10" />
    <path d="M24 16v16" opacity=".5" />
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

export const icons = { select: IconSelect, leaf: IconLeaf, hand: IconHand, link: IconLink } as const;
