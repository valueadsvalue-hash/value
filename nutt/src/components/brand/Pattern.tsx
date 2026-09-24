import { mulberry32 } from '@/utils/math';

/** Padrão da identidade: "n" e "u" monolineares espalhados em laranja e marrom. */
export function BrandPattern({ className, cols = 7, rows = 5, seed = 7 }: { className?: string; cols?: number; rows?: number; seed?: number }) {
  const r = mulberry32(seed);
  const cell = 60;
  const items = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      if (r() < 0.18) continue;
      const rot = [0, 180, 90, -90][Math.floor(r() * 4)] + (r() - 0.5) * 30;
      const brown = r() < 0.4;
      items.push(
        <path
          key={`${x}-${y}`}
          d="M-14,14 V0 A14,14 0 0 1 14,0 V14"
          transform={`translate(${x * cell + 30 + (r() - 0.5) * 16} ${y * cell + 30 + (r() - 0.5) * 16}) rotate(${rot})`}
          stroke={brown ? 'var(--brown)' : 'var(--orange)'}
        />,
      );
    }
  return (
    <svg className={className} viewBox={`0 0 ${cols * cell} ${rows * cell}`} aria-hidden fill="none" strokeWidth="9" strokeLinecap="round">
      {items}
    </svg>
  );
}
