'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nav } from '@/data/site';
import { scroll } from '@/utils/scroll';
import { Logo } from '../brand/Logo';
import { MagneticButton } from './MagneticButton';

/** Menu minimalista: transparente no topo, preto translúcido com blur ao rolar. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const home = usePathname() === '/';
  // fora da home, as âncoras apontam para a home
  const h = (href: string) => (home || !href.startsWith('#') ? href : `/${href}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!home || !href.startsWith('#')) return;
    e.preventDefault();
    setOpen(false);
    scroll.jumpTo(href);
    history.replaceState(null, '', href);
  };

  return (
    <>
      <header className={`header${scrolled || open ? ' is-scrolled' : ''}`}>
        <a href={h('#inicio')} className="header__brand" onClick={(e) => go(e, '#inicio')} data-cursor="INÍCIO" aria-label="NUTT — início">
          <Logo />
        </a>
        <nav className="header__nav" aria-label="Principal">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a className="nav-link" href={h(n.href)} onClick={(e) => go(e, n.href)} data-cursor={n.cursor}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <MagneticButton href={h('#sabores')} className="header__buy" cursor="PROVAR" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => go(e, '#sabores')}>
            Comprar
          </MagneticButton>
          <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((o) => !o)}>
            <span />
          </button>
        </nav>
      </header>
      <div id="mobile-menu" className={`mobile-menu${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <ul>
          {nav.map((n) => (
            <li key={n.href}>
              <a className="display" href={h(n.href)} onClick={(e) => go(e, n.href)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <MagneticButton href={h('#sabores')} className="btn--xl" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => go(e, '#sabores')}>
          Comprar
        </MagneticButton>
      </div>
    </>
  );
}
