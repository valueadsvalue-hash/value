import type Lenis from 'lenis';
import { gsap } from 'gsap';

/** Acesso global ao smooth scroll + navegação "corte no preto" entre capítulos. */
export const scroll = {
  lenis: null as Lenis | null,
  fadeEl: null as HTMLElement | null,
  forcedBlack: { v: 0 },
  stop() {
    this.lenis?.stop();
    document.documentElement.classList.add('scroll-locked');
  },
  start() {
    this.lenis?.start();
    document.documentElement.classList.remove('scroll-locked');
  },
  /** Menus e âncoras: fade rápido ao preto, salto imediato, fade de volta. */
  jumpTo(hash: string, offset = 0) {
    const el = hash === '#' || hash === '#inicio' ? document.body : document.querySelector<HTMLElement>(hash);
    if (!el) return;
    const top = el === document.body ? 0 : el.getBoundingClientRect().top + window.scrollY + offset;
    const reduced = document.documentElement.classList.contains('reduced');
    const go = () => {
      if (this.lenis) this.lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: 'auto' });
      // leva o foco junto (teclado / leitor de tela)
      if (el !== document.body) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    };
    if (reduced) return go();
    gsap.to(this.forcedBlack, {
      v: 1,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        go();
        gsap.to(this.forcedBlack, { v: 0, duration: 0.7, delay: 0.1, ease: 'power2.out' });
      },
    });
  },
};
