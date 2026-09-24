'use client';
import { gsap } from 'gsap';
import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { usePointer } from '@/hooks/usePointer';
import { useScrollDirector } from '@/hooks/useScrollDirector';
import { detectTier } from '@/utils/quality';
import { scroll } from '@/utils/scroll';
import { set, store } from '@/utils/store';
import { ProductDetailOverlay } from './product/ProductDetailOverlay';
import { Cursor } from './ui/Cursor';
import { IdleHint } from './ui/IdleHint';
import { Loader } from './ui/Loader';
import { SoundToggle } from './ui/SoundToggle';

type StageProps = { onReady: () => void };

/**
 * Orquestra a experiência: detecção de dispositivo/preferências -> loader com progresso real
 * -> canvas 3D (import dinâmico) -> abertura -> scroll. O conteúdo (children) é HTML
 * estático pré-renderizado: funciona sem JS e sem WebGL.
 */
export function Experience({ children }: { children: ReactNode }) {
  const [Stage, setStage] = useState<ComponentType<StageProps> | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { tier, webgl } = detectTier();
    store.reduced = reduced;
    store.mobile = innerWidth < 760;
    set('tier', tier);
    set('webgl', webgl);
    html.classList.toggle('reduced', reduced);
    html.classList.toggle('no-webgl', !webgl);
    html.classList.add('is-loading', 'intro-pending');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) window.scrollTo(0, 0);
    setBooted(true);
    // QA: ?debug expõe o estado para testes automatizados
    if (location.search.includes('debug')) Object.assign(window, { __nutt: { store, scroll } });

    let cancelled = false;
    (async () => {
      const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
      await fonts;
      if (cancelled) return;
      set('loadProgress', 0.22);
      if (!webgl) {
        set('loadProgress', 1);
        return;
      }
      try {
        const mod = await import('@/scenes/Stage');
        if (cancelled) return;
        set('loadProgress', 0.45);
        setStage(() => mod.default);
      } catch {
        html.classList.add('no-webgl');
        set('webgl', false);
        set('loadProgress', 1);
      }
    })();
    const onResize = () => (store.mobile = innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useScrollDirector(booted);
  usePointer();

  const onStageReady = useCallback(() => set('loadProgress', 1), []);

  const onLoaderExit = useCallback(() => {
    const html = document.documentElement;
    html.classList.remove('is-loading');
    set('ready', true);
    scroll.start();
    const reduced = store.reduced;
    // abertura: símbolo minúsculo -> brilho -> volume -> NUTT -> tagline -> convite ao scroll
    gsap.to(store, { intro: 1, duration: reduced ? 0.01 : 3.6, ease: 'none' });
    const tl = gsap.timeline({ delay: reduced ? 0 : 2.1 });
    tl.fromTo('.intro-anim', { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: reduced ? 0.01 : 1.3, ease: 'power3.out', stagger: 0.28 });
    tl.call(() => html.classList.remove('intro-pending'), [], reduced ? 0 : 0.6);
  }, []);

  useEffect(() => {
    // trava o scroll durante o loader
    if (booted && !store.ready) scroll.stop();
  }, [booted]);

  return (
    <>
      <a className="skip-link" href="#sabores">
        Pular para os sabores
      </a>
      <div className="stage" aria-hidden>
        {Stage && <Stage onReady={onStageReady} />}
      </div>
      <div className="stage-fade" aria-hidden />
      <div className="grain" aria-hidden />
      {children}
      <ProductDetailOverlay />
      <SoundToggle />
      <IdleHint />
      <Cursor />
      {booted && <Loader onExit={onLoaderExit} />}
    </>
  );
}
