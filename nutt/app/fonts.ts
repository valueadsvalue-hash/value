import { Manrope, Sniglet } from 'next/font/google';

/**
 * Sniglet — tipografia da identidade NUTT (arredondada, orgânica). Usada em títulos,
 * frases e wordmark. Manrope entra só em textos corridos pequenos, para legibilidade.
 */
export const display = Sniglet({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const text = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-text',
  display: 'swap',
});
