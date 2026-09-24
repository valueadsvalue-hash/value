'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect } from 'react';
import type { ChapterId } from '@/data/chapters';
import { audio } from '@/utils/audio';
import { clamp, range, smoothstep } from '@/utils/math';
import { scroll } from '@/utils/scroll';
import { set, store } from '@/utils/store';

type BeatEl = { el: HTMLElement; a: number; b: number; hold: boolean; live: string };
type Ch = { id: ChapterId; el: HTMLElement; st: ScrollTrigger; beats: BeatEl[] };

/**
 * Diretor de scroll: Lenis (smooth) + GSAP ScrollTrigger (progresso por capítulo).
 * A cada tick decide o capítulo dono da câmera, o fade ao preto entre capítulos,
 * e anima as frases (beats) via CSS vars — zero re-render do React.
 */
export function useScrollDirector(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const reduced = store.reduced;

    const lenis = reduced ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4, smoothWheel: true, syncTouch: false });
    scroll.lenis = lenis;
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    const fadeEl = document.querySelector<HTMLElement>('.stage-fade');
    scroll.fadeEl = fadeEl;

    const chapters: Ch[] = [...document.querySelectorAll<HTMLElement>('[data-chapter]')].map((el) => {
      const id = el.dataset.chapter as ChapterId;
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (s) => {
          store.progress[id] = s.progress;
        },
        onRefresh: (s) => {
          store.progress[id] = s.progress;
        },
      });
      const beats = [...el.querySelectorAll<HTMLElement>('[data-beat]')].map((b) => {
        const [a, bb] = (b.dataset.at ?? '0,1').split(',').map(Number);
        return { el: b, a, b: bb, hold: b.hasAttribute('data-hold'), live: '' };
      });
      return { id, el, st, beats };
    });

    // a11y: se o foco do teclado cair num beat invisível, rola até ele aparecer
    const onFocus = (e: FocusEvent) => {
      const beat = (e.target as HTMLElement).closest<HTMLElement>('[data-beat]');
      const ch = beat?.closest<HTMLElement>('[data-chapter]');
      if (!beat || !ch || reduced) return;
      const c = chapters.find((x) => x.el === ch);
      if (!c) return;
      const [a, b] = (beat.dataset.at ?? '0,1').split(',').map(Number);
      const p = Math.min(0.999, a + (b - a) * 0.6);
      const y = c.st.start + (c.st.end - c.st.start) * p;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };
    document.addEventListener('focusin', onFocus);

    let lastOwner: ChapterId | null = store.owner;
    let lastY = window.scrollY;

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      const y = window.scrollY;
      const vh = window.innerHeight;
      const center = y + vh / 2;
      store.scrollVelocity = store.scrollVelocity * 0.85 + (y - lastY) * 0.15;
      lastY = y;

      let owner: ChapterId | null = null;
      let fade = 0;
      for (let i = 0; i < chapters.length; i++) {
        const c = chapters[i];
        const top = c.st.start, bottom = c.st.end + vh;
        if (center >= top && center < bottom) owner = c.id;
        // fade ao preto nas fronteiras entre capítulos (e no fim do último)
        if (i > 0) fade = Math.max(fade, 1 - smoothstep(0, 0.42, Math.abs(top - center) / vh));
        if (i === chapters.length - 1) fade = Math.max(fade, 1 - smoothstep(0, 0.42, Math.abs(bottom - center) / vh));

        const p = reduced ? 1 : store.progress[c.id];
        const visible = y + vh > top && y < bottom;
        store.visible[c.id] = visible;
        c.el.style.setProperty('--p', p.toFixed(4));
        if (!visible && !reduced) continue;
        for (const bt of c.beats) {
          if (reduced) {
            if (bt.live !== '1') {
              bt.live = '1';
              bt.el.dataset.live = '1';
            }
            continue;
          }
          const len = bt.b - bt.a;
          const inT = range(p, bt.a, bt.a + len * 0.3);
          const outT = bt.hold ? 0 : range(p, bt.b - len * 0.22, bt.b);
          const live = inT > 0 && outT < 1 ? '1' : '0';
          if (live !== bt.live) {
            bt.live = live;
            bt.el.dataset.live = live;
          }
          if (live === '1') {
            bt.el.style.setProperty('--in', inT.toFixed(3));
            bt.el.style.setProperty('--out', outT.toFixed(3));
          }
        }
      }
      if (owner === null && y < (chapters[0]?.st.start ?? 0) + vh) owner = chapters[0]?.id ?? null;

      if (owner !== lastOwner) {
        if (owner && lastOwner && !reduced) audio.whoosh(0.5);
        lastOwner = owner;
        set('owner', owner);
      }
      if (fadeEl) {
        const o = owner === null ? 1 : reduced ? 0 : Math.max(fade, scroll.forcedBlack.v);
        fadeEl.style.opacity = clamp(o).toFixed(3);
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(document.body);

    // links âncora internos passam pelo corte no preto
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const href = a.getAttribute('href')!;
      if (href.length < 2 || href.startsWith('#sabor/')) return;
      if (!document.querySelector(href)) return;
      e.preventDefault();
      scroll.jumpTo(href);
      history.replaceState(null, '', href);
    };
    document.addEventListener('click', onClick);

    // deep link (#sabores etc.)
    if (location.hash && location.hash.length > 1 && !location.hash.startsWith('#sabor/')) {
      const target = document.querySelector(location.hash);
      if (target) requestAnimationFrame(() => scroll.jumpTo(location.hash));
    }

    return () => {
      gsap.ticker.remove(tick);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('click', onClick);
      ro.disconnect();
      chapters.forEach((c) => c.st.kill());
      lenis?.destroy();
      scroll.lenis = null;
    };
  }, [enabled]);
}
