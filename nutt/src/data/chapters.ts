/**
 * Capítulos da narrativa. A altura (em vh) define quanto scroll cada cena consome.
 * `poster` é o progresso usado como "still" quando o usuário prefere movimento reduzido.
 */
export type ChapterId =
  | 'intro'
  | 'universe'
  | 'ingredients'
  | 'transformation'
  | 'crunch'
  | 'manifesto'
  | 'products'
  | 'why'
  | 'final';

export type Chapter = {
  id: ChapterId;
  anchor: string;
  /** Altura da seção em vh (desktop). */
  height: number;
  /** Altura no mobile (frases curtas pedem menos scroll). */
  heightMobile: number;
  poster: number;
};

export const chapters: Chapter[] = [
  { id: 'intro', anchor: 'inicio', height: 200, heightMobile: 180, poster: 0 },
  { id: 'universe', anchor: 'universo', height: 420, heightMobile: 360, poster: 0.9 },
  { id: 'ingredients', anchor: 'ingredientes', height: 460, heightMobile: 400, poster: 0.9 },
  { id: 'transformation', anchor: 'transformacao', height: 360, heightMobile: 320, poster: 1 },
  { id: 'crunch', anchor: 'crunch', height: 300, heightMobile: 260, poster: 0.62 },
  { id: 'manifesto', anchor: 'nossa-historia', height: 720, heightMobile: 620, poster: 0.5 },
  { id: 'products', anchor: 'sabores', height: 100, heightMobile: 100, poster: 0 },
  { id: 'why', anchor: 'por-que-nutt', height: 440, heightMobile: 400, poster: 0.1 },
  { id: 'final', anchor: 'experimente', height: 360, heightMobile: 320, poster: 0.62 },
];

export const chapterIndex = (id: ChapterId) => chapters.findIndex((c) => c.id === id);
