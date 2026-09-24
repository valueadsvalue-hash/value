import { Manrope, Nunito } from 'next/font/google';

/**
 * Singlet é a referência da marca. Enquanto a licença web não chega, usamos Nunito
 * (arredondada, orgânica, forte em 800–900) para títulos e Manrope para texto.
 * Para trocar: next/font/local apontando para os WOFF2 da Singlet, mantendo as variáveis.
 */
export const display = Nunito({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const text = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-text',
  display: 'swap',
});
