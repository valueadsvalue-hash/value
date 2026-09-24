import { copy } from '@/data/copy';
import { Beat } from '../story/Beat';
import { Chapter } from '../story/Chapter';
import { MagneticButton } from '../ui/MagneticButton';

export function FinalSection() {
  return (
    <Chapter id="final" label="Experimente NUTT">
      <div className="final__stack">
        <Beat at={[0.8, 1]} text={copy.final.heading} size="lg" hold as="h2" />
        <div className="beat beat--block beat--interactive final__cta" data-beat="" data-at="0.86,1" data-hold="">
          <MagneticButton href="#sabores" className="btn--xl" cursor="PROVAR" strength={0.35}>
            {copy.final.cta}
          </MagneticButton>
          <p className="final__sub">{copy.final.sub}</p>
        </div>
      </div>
    </Chapter>
  );
}
