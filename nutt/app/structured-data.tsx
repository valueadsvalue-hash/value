import type { Product } from '@/data/products';
import { products } from '@/data/products';
import { site } from '@/data/site';

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NUTT',
  url: site.url,
  logo: `${site.url}/icon.svg`,
  slogan: site.signature,
  description: site.description,
  sameAs: [site.instagram],
  contactPoint: { '@type': 'ContactPoint', email: site.email, contactType: 'customer service', availableLanguage: 'Portuguese' },
};

export const productLd = (p: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `NUTT ${p.name}`,
  description: p.description,
  image: `${site.url}${p.image}`,
  url: `${site.url}/sabores/${p.slug}/`,
  brand: { '@type': 'Brand', name: 'NUTT' },
  category: 'Amendoim artesanal gourmet',
  // Preço/estoque: adicionar `offers` quando a loja estiver definida.
});

export const productListLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Sabores NUTT',
  itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productLd(p) })),
};

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
