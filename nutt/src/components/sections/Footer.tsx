import { copy } from '@/data/copy';
import { site } from '@/data/site';
import { Wordmark } from '../brand/Logo';

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__sign display">{copy.footer.signature}</p>
      <p className="footer__lines">
        {copy.footer.lines[0]} <span className="accent">{copy.footer.lines[1]}</span>
      </p>
      <div className="footer__giant" aria-hidden>
        <Wordmark title="" />
      </div>
      <div className="footer__bottom">
        <ul className="footer__links">
          <li>
            <a className="nav-link" href={site.instagram} target="_blank" rel="noopener noreferrer" data-cursor="VER">
              Instagram {site.instagramHandle}
            </a>
          </li>
          <li>
            <a className="nav-link" href={`mailto:${site.email}`} data-cursor="ABRIR">
              Contato
            </a>
          </li>
          <li>
            <a className="nav-link" href="/privacidade/" data-cursor="ABRIR">
              Política de privacidade
            </a>
          </li>
          <li>
            <a className="nav-link" href="/termos/" data-cursor="ABRIR">
              Termos
            </a>
          </li>
        </ul>
        <p className="footer__copy">
          © {new Date().getFullYear()} nutt — amendoins artesanais gourmet.
        </p>
      </div>
    </footer>
  );
}
