import type { MetadataRoute } from 'next';
import { products } from '@/data/products';
import { site } from '@/data/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...products.map((p) => ({ url: `${site.url}/sabores/${p.slug}/`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${site.url}/privacidade/`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site.url}/termos/`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
