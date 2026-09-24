'use client';
import { useEffect, useRef, useState } from 'react';
import { products } from '@/data/products';
import { closeDetail, openDetail, switchDetail } from '@/utils/detail';
import { clamp } from '@/utils/math';
import { store, useStore } from '@/utils/store';
import { ProductInfo } from './ProductInfo';

/** Overlay do sabor (dialog acessível) revelado depois que a câmera chega ao pouch. */
export function ProductDetailOverlay() {
  const detail = useStore((s) => s.detail);
  const webgl = useStore((s) => s.webgl);
  const [revealed, setRevealed] = useState(false);
  const [gyro, setGyro] = useState<'off' | 'available' | 'on'>('off');
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const product = detail !== null ? products[detail] : null;

  // abre por deep link e fecha pelo "voltar"
  useEffect(() => {
    const fromHash = () => {
      const m = location.hash.match(/^#sabor\/(.+)$/);
      if (m) {
        const i = products.findIndex((p) => p.slug === m[1]);
        if (i >= 0 && store.detail === null) {
          document.getElementById('sabores')?.scrollIntoView();
          openDetail(i, false);
        }
      }
    };
    const onPop = () => {
      if (store.detail !== null && !history.state?.nuttDetail) closeDetail(true);
      else fromHash();
    };
    window.addEventListener('popstate', onPop);
    if (store.ready) fromHash();
    else {
      const id = setInterval(() => {
        if (store.ready) {
          clearInterval(id);
          fromHash();
        }
      }, 200);
      return () => {
        clearInterval(id);
        window.removeEventListener('popstate', onPop);
      };
    }
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (detail === null) {
      setRevealed(false);
      opener.current?.focus?.();
      return;
    }
    opener.current ??= document.activeElement as HTMLElement;
    const id = setTimeout(() => setRevealed(true), store.reduced || !webgl ? 0 : 650);
    root.current?.querySelector<HTMLElement>('.detail__close')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDetail();
      if (e.key === 'ArrowRight' && !(e.target as HTMLElement).closest('input')) switchDetail((detail + 1) % products.length);
      if (e.key === 'ArrowLeft') switchDetail((detail - 1 + products.length) % products.length);
      if (e.key === 'Tab' && root.current) {
        const f = [...root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [detail, webgl]);

  useEffect(() => {
    if (detail === null) opener.current = null;
  }, [detail]);

  // giroscópio: só oferecido em touch, só ativado por gesto explícito
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && matchMedia('(pointer: coarse)').matches && !store.reduced) setGyro('available');
  }, []);
  const enableGyro = async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (DOE.requestPermission && (await DOE.requestPermission()) !== 'granted') return;
    } catch {
      return;
    }
    window.addEventListener('deviceorientation', (e) => {
      store.gyro.x = clamp((e.gamma ?? 0) / 25, -1, 1);
      store.gyro.y = clamp(((e.beta ?? 45) - 45) / 25, -1, 1);
      store.gyro.active = true;
    });
    setGyro('on');
  };

  const n = products.length;
  return (
    <div
      ref={root}
      className={`detail${revealed ? ' is-revealed' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
      hidden={product === null}
      data-no-world=""
    >
      <div className="detail__backdrop" onClick={() => closeDetail()} aria-hidden data-cursor="FECHAR" />
      {product && (
        <>
          <button className="btn btn--ghost detail__close" onClick={() => closeDetail()} data-cursor="FECHAR">
            Fechar <span aria-hidden>✕</span>
          </button>
          <div className="detail__panel">
            <ProductInfo product={product} titleId="detail-title" />
            {gyro === 'available' && (
              <button className="btn btn--ghost" onClick={enableGyro}>
                Mover com o celular
              </button>
            )}
            <nav className="detail__nav" aria-label="Outros sabores">
              <button onClick={() => switchDetail((detail! - 1 + n) % n)} data-cursor="VER">
                ← {products[(detail! - 1 + n) % n].name}
              </button>
              <a href={`/sabores/${product.slug}/`} data-cursor="ABRIR">
                Página do sabor
              </a>
              <button onClick={() => switchDetail((detail! + 1) % n)} data-cursor="VER">
                {products[(detail! + 1) % n].name} →
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
