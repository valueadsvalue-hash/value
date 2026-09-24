import type { Metadata } from 'next';
import { Header } from '@/components/ui/Header';

export const metadata: Metadata = { title: 'Termos de uso', alternates: { canonical: '/termos/' } };

/** PLACEHOLDER — texto jurídico a ser fornecido/revisado pela NUTT (LGPD). */
export default function Page() {
  return (
    <>
      <Header />
      <main className="where" style={{ minHeight: '100vh' }}>
        <p className="eyebrow">NUTT</p>
        <h1 className="where__title display">Termos de uso</h1>
        <p style={{ maxWidth: '60ch', color: 'var(--ink-2)' }}>
          Conteúdo em elaboração. Este texto será substituído pela versão oficial revisada juridicamente.
        </p>
        <p>
          <a className="nav-link" href="/">← Voltar para a NUTT</a>
        </p>
      </main>
    </>
  );
}
