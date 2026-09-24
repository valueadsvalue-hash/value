import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductInfo } from '@/components/product/ProductInfo';
import { Header } from '@/components/ui/Header';
import { getProduct, products } from '@/data/products';
import { JsonLd, organizationLd, productLd } from '../../structured-data';
import { ViewerSlot } from './ViewerSlot';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.description} ${p.tagline.join(' ')}`,
    alternates: { canonical: `/sabores/${p.slug}/` },
    openGraph: { title: `NUTT ${p.name}`, description: p.description, url: `/sabores/${p.slug}/`, images: ['/og.png'] },
  };
}

/** Página estática do sabor (SEO/compartilhamento). Na home, o mesmo conteúdo abre em overlay. */
export default async function FlavorPage({ params }: Params) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={productLd(p)} />
      <Header />
      <main className="flavor-page">
        <div className="flavor-page__viewer" style={{ background: p.background }}>
          <ViewerSlot slug={p.slug} />
        </div>
        <div className="detail__panel">
          <ProductInfo product={p} titleId="flavor-title" standalone />
          <nav className="detail__nav" aria-label="Navegação">
            <a href="/#sabores">← Todos os sabores</a>
            <a href="/">Entrar no universo NUTT</a>
          </nav>
        </div>
      </main>
    </>
  );
}
