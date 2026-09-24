import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { products } from '@/data/products';
import { site } from '@/data/site';
import '@/styles/globals.css';
import { display, text } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: '%s — NUTT' },
  description: site.description,
  applicationName: 'NUTT',
  keywords: ['amendoim gourmet', 'amendoim artesanal', 'snack premium', 'NUTT', ...products.map((p) => `amendoim ${p.name.toLowerCase()}`)],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: '/',
    siteName: 'NUTT',
    title: site.title,
    description: site.description,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'NUTT — Você nunca provou amendoim assim.' }],
  },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: ['/og.png'] },
  robots: { index: true, follow: true },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        {/* marca "js" antes da pintura: animações só existem com JS (conteúdo visível sem ele) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
