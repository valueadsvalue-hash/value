'use client';
import { useId } from 'react';
import { logo, polyPoints, wordmark } from './logo';

type Props = { className?: string; title?: string; mono?: string };

/** Símbolo "n" em dois tons (laranja + marrom). `mono` força uma cor única. */
export function Symbol({ className, title, mono }: Props) {
  const id = useId();
  const { x, y, w, h } = logo.viewBox;
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <clipPath id={`${id}b`}>
          <polygon points={polyPoints(logo.brown)} />
        </clipPath>
      </defs>
      <path d={logo.path} fill={mono ?? 'var(--orange)'} />
      {!mono && <path d={logo.path} fill="var(--brown)" clipPath={`url(#${id}b)`} />}
    </svg>
  );
}

/** Wordmark "nutt" — traço monolinear arredondado, cada letra em dois tons. */
export function Wordmark({ className, title = 'nutt', mono }: Props) {
  const id = useId();
  const { x, y, w, h } = wordmark.viewBox;
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} role="img" aria-label={title}>
      <defs>
        {wordmark.letters.map((l, i) => (
          <clipPath key={i} id={`${id}${i}`}>
            <polygon points={polyPoints(l.brown)} />
          </clipPath>
        ))}
      </defs>
      <g fill="none" strokeWidth={wordmark.stroke} strokeLinecap="round" strokeLinejoin="round">
        {wordmark.letters.map((l, i) => (
          <g key={i} transform={`translate(${l.x} 0)`}>
            <path d={l.d} stroke={mono ?? 'var(--orange)'} />
            {!mono && <path d={l.d} stroke="var(--brown)" clipPath={`url(#${id}${i})`} />}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Logo do header: wordmark. */
export function Logo({ className, title = 'nutt' }: Props) {
  return (
    <span className={`logo ${className ?? ''}`}>
      <Wordmark className="logo__word" title={title} />
    </span>
  );
}
