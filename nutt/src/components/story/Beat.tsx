import type { CSSProperties, ReactNode } from 'react';
import type { BeatCopy } from '@/data/copy';

/**
 * Frase ("beat") que entra palavra a palavra e sai com blur, dirigida pelo progresso do
 * capítulo (ver ScrollDirector). Texto real no DOM: indexável e legível por leitor de tela.
 */
type Props = BeatCopy & {
  as?: 'p' | 'h2' | 'h3' | 'div';
  className?: string;
  children?: ReactNode;
  interactive?: boolean;
  position?: 'bottom';
};

function words(text: string, offset: number, accent: boolean, total: number) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (
      <span key={`${offset + i}${w}`} className={`w${accent ? ' accent' : ''}`} style={{ '--i': offset + i, '--n': total } as CSSProperties}>
        {w}
      </span>
    ));
}

export function Beat({ at, text, accent, size = 'lg', hold, align = 'center', as: Tag = 'p', className = '', children, interactive, position }: Props) {
  const total = text.split(/\s+/).filter(Boolean).length;
  let content: ReactNode[] = [];
  const idx = accent ? text.toLowerCase().indexOf(accent.toLowerCase()) : -1;
  if (idx >= 0 && accent) {
    // a pontuação logo após o destaque fica grudada nele ("selecionados.")
    let end = idx + accent.length;
    while (end < text.length && /[.,!?;:…]/.test(text[end])) end++;
    const before = text.slice(0, idx).trim();
    const match = text.slice(idx, end).trim();
    const after = text.slice(end).trim();
    const nb = before ? before.split(/\s+/).length : 0;
    const nm = match.split(/\s+/).length;
    content = [...words(before, 0, false, total), ...words(match, nb, true, total), ...words(after, nb + nm, false, total)];
  } else content = words(text, 0, false, total);

  // espaço entre spans inline-block
  const spaced = content.flatMap((c, i) => (i ? [' ', c] : [c]));
  return (
    <Tag
      className={`beat beat--${size} beat--${align}${position ? ` beat--${position}` : ''}${interactive ? ' beat--interactive' : ''} ${className}`}
      data-beat=""
      data-at={at.join(',')}
      data-hold={hold ? '' : undefined}
    >
      {spaced}
      {children}
    </Tag>
  );
}
