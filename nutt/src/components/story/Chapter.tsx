import type { CSSProperties, ReactNode } from 'react';
import { chapters, type ChapterId } from '@/data/chapters';

/**
 * Seção de capítulo: altura em vh = duração no scroll; frame sticky de 100vh onde vivem
 * as frases. O progresso (0–1) é escrito em `--p` e lido pelas cenas 3D.
 */
export function Chapter({ id, children, label, className = '' }: { id: ChapterId; children: ReactNode; label?: string; className?: string }) {
  const c = chapters.find((x) => x.id === id)!;
  return (
    <section
      id={c.anchor}
      data-chapter={id}
      className={`chapter chapter--${id} ${className}`}
      style={{ '--h': c.height, '--hm': c.heightMobile } as CSSProperties}
      aria-label={label}
    >
      <div className="chapter__frame">{children}</div>
    </section>
  );
}
