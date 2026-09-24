'use client';
import { useRef, type CSSProperties } from 'react';
import { chapters } from '@/data/chapters';
import { copy } from '@/data/copy';
import { products } from '@/data/products';
import { audio } from '@/utils/audio';
import { openDetail } from '@/utils/detail';
import { set, useStore } from '@/utils/store';
import { IconArrow } from '../brand/Icons';
import { PouchFallback } from '../product/ProductInfo';
import { MagneticButton } from '../ui/MagneticButton';

/**
 * DESCUBRA SEU NUTT — o carrossel é 3D (ProductsScene); aqui ficam os controles reais:
 * tabs acessíveis, setas, swipe/arrasto e teclado. Tudo gerado a partir de products.ts.
 */
export function ProductsSection() {
  const selected = useStore((s) => s.selected);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = products.length;
  const p = products[selected];
  const c = chapters.find((x) => x.id === 'products')!;

  const select = (i: number, focus = false) => {
    const k = ((i % n) + n) % n;
    set('selected', k);
    audio.tick(1 + k * 0.06);
    if (focus) tabs.current[k]?.focus();
  };

  const onKeyTabs = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') select(selected + 1, true);
    else if (e.key === 'ArrowLeft') select(selected - 1, true);
    else if (e.key === 'Home') select(0, true);
    else if (e.key === 'End') select(n - 1, true);
    else return;
    e.preventDefault();
  };

  return (
    <section id={c.anchor} data-chapter="products" className="chapter products" aria-labelledby="products-title" style={{ '--h': c.height, '--hm': c.heightMobile } as CSSProperties}>
      <div
        className="products__frame"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('a, button')) return;
          drag.current = { x: e.clientX, id: e.pointerId };
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 48) select(selected + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => (drag.current = null)}
        data-cursor="ARRASTAR"
      >
        <div className="products__head">
          <div>
            <p className="eyebrow">{copy.products.eyebrow}</p>
            <h2 id="products-title" className="products__title display">
              Descubra seu <span className="accent">NUTT.</span>
            </h2>
          </div>
          <p className="eyebrow" aria-hidden>
            {String(selected + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </p>
        </div>

        <div className="products__stage-fallback">
          <PouchFallback product={p} />
        </div>

        <div className="products__current">
          <div id="flavor-panel" role="tabpanel" aria-labelledby={`tab-${p.slug}`} aria-live="polite">
            <h3 className="products__name" style={{ color: 'var(--ink)' }}>
              {p.name}
            </h3>
            <p className="products__sub">{p.subtitle}</p>
          </div>
          <div className="products__controls">
            <MagneticButton className="btn--ghost btn--icon" aria-label="Sabor anterior" onClick={() => select(selected - 1)} cursor="VER">
              <IconArrow dir="left" />
            </MagneticButton>
            <MagneticButton onClick={() => openDetail(selected)} cursor="ABRIR" className="btn--xl" aria-haspopup="dialog">
              Ver sabor
            </MagneticButton>
            <MagneticButton className="btn--ghost btn--icon" aria-label="Próximo sabor" onClick={() => select(selected + 1)} cursor="VER">
              <IconArrow />
            </MagneticButton>
          </div>
          <div role="tablist" aria-label="Sabores NUTT" className="flavor-tabs" onKeyDown={onKeyTabs}>
            {products.map((prod, i) => (
              <button
                key={prod.id}
                id={`tab-${prod.slug}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                aria-selected={i === selected}
                aria-controls="flavor-panel"
                tabIndex={i === selected ? 0 : -1}
                className="flavor-tab"
                style={{ '--flavor': prod.color } as CSSProperties}
                onClick={() => select(i)}
                data-cursor="DESCOBRIR"
              >
                {prod.name}
              </button>
            ))}
          </div>
          <nav className="sr-only" aria-label="Páginas dos sabores">
            <ul>
              {products.map((prod) => (
                <li key={prod.id}>
                  <a href={`/sabores/${prod.slug}/`}>{prod.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
