import { copy } from '@/data/copy';
import { whereToBuy } from '@/data/site';
import { IconArrow } from '../brand/Icons';
import { BrandPattern } from '../brand/Pattern';

export function WhereToBuy() {
  return (
    <section id="onde-encontrar" className="where" aria-labelledby="where-title">
      <BrandPattern className="where__pattern" />
      <p className="eyebrow">nutt perto de você</p>
      <h2 id="where-title" className="where__title display">
        {copy.whereToBuy.heading}
      </h2>
      <ul className="where__list">
        {whereToBuy.map((w) => (
          <li key={w.label}>
            <a className="where__row" href={w.href} data-cursor="ABRIR">
              <span className="where__label">{w.label}</span>
              <span className="where__detail">{w.detail}</span>
              <span className="where__go">
                {w.cta} <IconArrow />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
