import type { CSSProperties } from 'react';
import { copy } from '@/data/copy';
import { Beat } from '../story/Beat';
import { Chapter } from '../story/Chapter';
import { icons } from '../brand/Icons';
import type { BeatCopy } from '@/data/copy';

const beatsOf = (list: readonly BeatCopy[]) => list.map((b, i) => <Beat key={i} {...b} as={b.heading ? 'h2' : 'p'} />);

export function IntroSection() {
  return (
    <Chapter id="intro" label="Abertura">
      <div className="intro__content">
        <h1 className="intro__title">
          <span className="intro__word intro-anim">{copy.intro.title}</span>
          <span className="intro__tag intro-anim">{copy.intro.tagline}</span>
        </h1>
      </div>
      <a href="#universo" className="scroll-hint intro-anim" data-cursor="ENTRAR">
        <span className="eyebrow">{copy.intro.hint}</span>
        <span className="scroll-hint__line" aria-hidden />
        <span className="sr-only">— role a página para começar</span>
      </a>
    </Chapter>
  );
}

export function UniverseSection() {
  return (
    <Chapter id="universe" label="O universo NUTT">
      {beatsOf(copy.universe.beats)}
    </Chapter>
  );
}

export function IngredientsSection() {
  return (
    <Chapter id="ingredients" label="Ingredientes reais">
      {beatsOf(copy.ingredients.beats)}
    </Chapter>
  );
}

export function TransformationSection() {
  const [a, b, c] = copy.transformation.stages;
  return (
    <Chapter id="transformation" label="A transformação">
      {beatsOf(copy.transformation.beats)}
      <div className="stages" aria-hidden>
        <div className="stages__labels eyebrow">
          <span>{a}</span>
          <span>{b}</span>
          <span>{c}</span>
        </div>
        <div className="stages__bar" />
      </div>
    </Chapter>
  );
}

export function CrunchSection() {
  return (
    <Chapter id="crunch" label="The Crunch">
      <h2 className="sr-only">{copy.crunch.heading}</h2>
      {copy.crunch.beats.map((b, i) => (
        <Beat key={i} {...b} position="bottom" />
      ))}
    </Chapter>
  );
}

export function ManifestoSection() {
  return (
    <Chapter id="manifesto" label="Nossa história">
      <h2 className="sr-only">{copy.manifesto.heading}</h2>
      {copy.manifesto.beats.map((b, i) => (
        <Beat key={i} {...b} position={b.size === 'sm' ? 'bottom' : undefined} />
      ))}
    </Chapter>
  );
}

export function WhySection() {
  const items = copy.why.items;
  const seg = 1 / items.length;
  return (
    <Chapter id="why" label="Por que NUTT">
      <h2 className="sr-only">{copy.why.heading}</h2>
      {items.map((it, i) => {
        const Icon = icons[it.icon as keyof typeof icons];
        const at: [number, number] = [i === 0 ? -0.1 : i * seg, i === items.length - 1 ? 1 : (i + 1) * seg];
        return (
          <article key={it.id} className="why__item beat beat--block" data-beat="" data-at={at.join(',')} data-hold={i === items.length - 1 ? '' : undefined}>
            <span className="why__index">
              {String(i + 1).padStart(2, '0')} <span aria-hidden>/ {String(items.length).padStart(2, '0')}</span>
            </span>
            <Icon className="why__icon" />
            <h3 className="why__title display">{it.title}</h3>
            <p className="why__text">{it.text}</p>
          </article>
        );
      })}
      <div className="why__rail" aria-hidden>
        {items.map((it, j) => (
          <i key={it.id} style={{ '--j': j } as CSSProperties} />
        ))}
      </div>
    </Chapter>
  );
}
