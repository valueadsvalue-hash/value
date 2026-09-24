/**
 * Toda a copy da experiência. Curta, sensorial, segura.
 * `at` = [início, fim] do beat no progresso local do capítulo (0–1).
 * `hold` = o beat não sai ao final (fica na tela até o capítulo acabar).
 */
export type BeatCopy = {
  at: [number, number];
  text: string;
  /** Palavra(s) destacada(s) em laranja. */
  accent?: string;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  hold?: boolean;
  align?: 'center' | 'left' | 'right';
  /** Beat que também é o título semântico (h2) do capítulo. */
  heading?: boolean;
};

export const copy = {
  intro: {
    title: 'NUTT',
    tagline: 'Você nunca provou amendoim assim.',
    hint: 'Entre na NUTT',
  },
  universe: {
    heading: 'Tudo começa aqui.',
    beats: [
      { at: [0.1, 0.34], text: 'Tudo começa aqui.', size: 'xl', heading: true },
      { at: [0.38, 0.62], text: 'Com amendoins cuidadosamente selecionados.', accent: 'selecionados', size: 'lg' },
      { at: [0.8, 0.99], text: 'Textura. Torra. Superfície.', size: 'sm', align: 'left' },
    ] satisfies BeatCopy[],
  },
  ingredients: {
    heading: 'Ingredientes reais.',
    beats: [
      { at: [0.03, 0.17], text: 'Mas NUTT não para no amendoim.', size: 'lg' },
      { at: [0.19, 0.32], text: 'É aqui que o sabor começa.', accent: 'sabor', size: 'lg' },
      { at: [0.4, 0.5], text: 'Não é aroma de.', size: 'lg' },
      { at: [0.52, 0.62], text: 'Não é gosto de.', size: 'lg' },
      { at: [0.64, 0.74], text: 'É feito com.', size: 'lg' },
      { at: [0.78, 1], text: 'Ingredientes reais.', accent: 'Ingredientes reais.', size: 'xl', heading: true },
    ] satisfies BeatCopy[],
  },
  transformation: {
    heading: 'Artesanal por escolha.',
    beats: [
      { at: [0.12, 0.44], text: 'Artesanal por escolha.', size: 'lg', align: 'left', heading: true },
      { at: [0.6, 0.96], text: 'Irresistível por natureza.', accent: 'natureza', size: 'lg', align: 'right' },
    ] satisfies BeatCopy[],
    stages: ['Amendoim', 'Ingredientes', 'NUTT'],
  },
  crunch: {
    heading: 'The Crunch.',
    word: 'CRUNCH.',
    beats: [
      { at: [0.05, 0.3], text: 'Crocante por fora.', size: 'md' },
      { at: [0.72, 0.98], text: 'Absurdo por inteiro.', accent: 'Absurdo', size: 'md' },
    ] satisfies BeatCopy[],
  },
  manifesto: {
    heading: 'Manifesto NUTT',
    beats: [
      { at: [0.02, 0.13], text: 'Algumas pessoas veem amendoim.', size: 'lg' },
      { at: [0.15, 0.27], text: 'Nós vemos possibilidades.', accent: 'possibilidades', size: 'lg' },
      { at: [0.3, 0.39], text: 'Textura.', size: 'xl' },
      { at: [0.41, 0.5], text: 'Sabor.', size: 'xl' },
      { at: [0.52, 0.61], text: 'Ingredientes.', size: 'xl' },
      { at: [0.63, 0.72], text: 'Descoberta.', size: 'xl', accent: 'Descoberta.' },
      { at: [0.76, 0.98], text: 'NUTT.', size: 'xl' },
      { at: [0.8, 0.98], text: 'Você nunca provou amendoim assim.', size: 'sm' },
    ] satisfies BeatCopy[],
  },
  products: {
    heading: 'Descubra seu NUTT.',
    eyebrow: 'Sabores',
  },
  why: {
    heading: 'Por que NUTT',
    items: [
      { id: 'selecionado', title: 'Amendoim selecionado', text: 'Grão a grão. Só entra o que merece virar NUTT.', icon: 'select' },
      { id: 'natural', title: 'Ingredientes naturais', text: 'Fruta é fruta. Cacau é cacau. Sem atalhos.', icon: 'leaf' },
      { id: 'artesanal', title: 'Produção artesanal', text: 'Pequenos lotes, tempo certo, mão de quem prova.', icon: 'hand' },
      { id: 'conecta', title: 'Sabor que conecta', text: 'Feito para dividir. Difícil de dividir.', icon: 'link' },
    ],
  },
  final: {
    heading: 'Você nunca provou amendoim assim.',
    cta: 'Experimente NUTT',
    sub: 'Descubra seu sabor.',
  },
  whereToBuy: { heading: 'Onde encontrar' },
  footer: { signature: 'Sabor que conecta.', lines: ['Tudo começa com um bom ingrediente.', 'O resto é NUTT.'] },
  idle: 'Vai ficar só olhando?',
} as const;
