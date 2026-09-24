import type { CSSProperties } from 'react';
import type { Product } from '@/data/products';
import { MagneticButton } from '../ui/MagneticButton';

/** Conteúdo do sabor — compartilhado entre o overlay cinematográfico e a página /sabores/<slug>. */
export function ProductInfo({ product, titleId, standalone = false }: { product: Product; titleId: string; standalone?: boolean }) {
  const style = { '--flavor': product.color } as CSSProperties;
  return (
    <>
      <div style={style}>
        <p className="eyebrow">Sabor NUTT</p>
        {standalone ? (
          <h1 id={titleId} className="detail__name display">
            {product.name}
          </h1>
        ) : (
          <h2 id={titleId} className="detail__name display">
            {product.name}
          </h2>
        )}
      </div>
      <p className="detail__tagline display" aria-label={product.tagline.join(' ')}>
        {product.tagline.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>
      <p className="detail__desc">{product.description}</p>
      <div>
        <p className="eyebrow">Ingredientes</p>
        <ul className="chips">
          {product.ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
      <div style={style}>
        <p className="eyebrow">Perfil sensorial</p>
        <ul className="sensory">
          {product.sensory.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <span className="sensory__bar" role="img" aria-label={`${s.value} de 5`}>
                {[1, 2, 3, 4, 5].map((k) => (
                  <i key={k} className={k <= s.value ? 'on' : ''} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <dl className="meta">
        <div>
          <dt className="eyebrow">Características</dt>
          <dd>
            <ul>
              {product.characteristics.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Peso líquido</dt>
          <dd>{product.weight}</dd>
        </div>
      </dl>
      <div className="detail__cta">
        <MagneticButton href={product.buyUrl} className="btn--xl" cursor="PROVAR" data-product={product.slug}>
          Quero experimentar
        </MagneticButton>
      </div>
      <p className="detail__legal">{product.ingredientsFull ?? 'Lista completa de ingredientes e informação nutricional na embalagem.'}</p>
    </>
  );
}

export function PouchFallback({ product }: { product: Product }) {
  return (
    <div className="pouch-fallback" style={{ '--flavor': product.color } as CSSProperties} role="img" aria-label={`Embalagem NUTT ${product.name}`}>
      <svg viewBox="0 0 100 114" aria-hidden>
        <path fill="currentColor" d="M4,50 A46,46 0 0 1 96,50 L96,100 A13,13 0 0 1 70,100 L70,50 A20,20 0 0 0 30,50 L30,100 A13,13 0 0 1 4,100 Z" />
      </svg>
      <b>NUTT</b>
      <small>{product.name}</small>
    </div>
  );
}
