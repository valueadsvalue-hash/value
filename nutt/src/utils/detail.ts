import { gsap } from 'gsap';
import { products } from '@/data/products';
import { audio } from './audio';
import { scroll } from './scroll';
import { set, store } from './store';

/**
 * Transição cinematográfica do detalhe: a câmera se aproxima do pouch (detailT 0→1) e só
 * então o painel é revelado. URL #sabor/<slug> (compartilhável, "voltar" fecha).
 */
let tween: gsap.core.Tween | null = null;

export function openDetail(index: number, push = true) {
  const p = products[index];
  if (!p) return;
  set('selected', index);
  set('detail', index);
  document.documentElement.classList.add('detail-open');
  scroll.stop();
  audio.whoosh(0.8);
  tween?.kill();
  tween = gsap.to(store, { detailT: 1, duration: store.reduced ? 0.01 : 1.35, ease: 'power3.inOut' });
  const url = `#sabor/${p.slug}`;
  if (push) history.pushState({ nuttDetail: p.slug }, '', url);
  else history.replaceState({ nuttDetail: p.slug }, '', url);
}

export function switchDetail(index: number) {
  const p = products[index];
  if (!p || store.detail === null) return;
  set('selected', index);
  set('detail', index);
  audio.tick(1 + index * 0.06);
  history.replaceState({ nuttDetail: p.slug }, '', `#sabor/${p.slug}`);
}

/** Fecha o detalhe. `fromHistory` = veio do botão voltar (não mexe no histórico de novo). */
export function closeDetail(fromHistory = false) {
  if (store.detail === null) return;
  if (!fromHistory && history.state?.nuttDetail) {
    history.back(); // popstate chamará closeDetail(true)
    return;
  }
  set('detail', null);
  document.documentElement.classList.remove('detail-open');
  tween?.kill();
  tween = gsap.to(store, { detailT: 0, duration: store.reduced ? 0.01 : 1, ease: 'power3.inOut' });
  scroll.start();
  if (!fromHistory) history.replaceState(null, '', '#sabores');
}
