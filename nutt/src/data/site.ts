/**
 * Configuração global da marca. PLACEHOLDERS marcados — substituir antes de publicar.
 */
export const site = {
  name: 'NUTT',
  // PLACEHOLDER: domínio definitivo (usado em canonical, sitemap, Open Graph e Schema).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.nutt.com.br',
  locale: 'pt_BR',
  title: 'nutt — Você nunca provou amendoim assim.',
  description:
    'Amendoins artesanais gourmet. Grãos selecionados, sabores desenvolvidos com ingredientes reais. Entre no universo NUTT.',
  tagline: 'Você nunca provou amendoim assim.',
  signature: 'Sabor que conecta.',
  // PLACEHOLDERS de contato e canais
  instagram: 'https://www.instagram.com/nutt.oficial',
  instagramHandle: '@nutt.oficial',
  email: 'contato@nutt.com.br',
  shopUrl: '#sabores',
  resellerUrl: 'mailto:contato@nutt.com.br?subject=Quero%20revender%20NUTT',
  /** Sabor usado nas cenas de transformação e crunch (id em products.ts). */
  featuredProductId: 'amendoim-caramelizado',
} as const;

export type WhereToBuy = { label: string; detail: string; href: string; cta: string };

/** PLACEHOLDER: canais de venda reais. */
export const whereToBuy: WhereToBuy[] = [
  { label: 'Loja online', detail: 'Entrega para todo o Brasil', href: '#sabores', cta: 'Comprar' },
  { label: 'Empórios e cafés parceiros', detail: 'Lista de endereços em breve', href: 'mailto:contato@nutt.com.br?subject=Onde%20encontrar%20NUTT', cta: 'Consultar' },
  { label: 'Presentes corporativos', detail: 'Kits sob medida para marcas e eventos', href: 'mailto:contato@nutt.com.br?subject=Presentes%20corporativos', cta: 'Conversar' },
  { label: 'Seja um revendedor', detail: 'Para lojas que valorizam o autoral', href: 'mailto:contato@nutt.com.br?subject=Quero%20revender%20NUTT', cta: 'Quero revender' },
];

export const nav = [
  { label: 'Sabores', href: '#sabores', cursor: 'DESCOBRIR' },
  { label: 'Nossa história', href: '#nossa-historia', cursor: 'VER' },
  { label: 'Ingredientes', href: '#ingredientes', cursor: 'VER' },
  { label: 'Onde encontrar', href: '#onde-encontrar', cursor: 'ABRIR' },
] as const;
