import type { IngredientVisual } from './ingredients';

/**
 * ⚠️ EXEMPLOS DE ESTRUTURA — NÃO PUBLICAR.
 * Os sabores abaixo são conceitos para demonstrar o sistema. Substitua pela linha oficial NUTT
 * (nomes, ingredientes, peso, perfil sensorial). Nenhum componente 3D conhece sabores:
 * adicionar um item aqui cria pouch, rótulo, ambiente, ingredientes flutuantes, página
 * /sabores/<slug>, entrada no sitemap e Schema Product automaticamente.
 */
export type SensoryNote = { label: string; value: 1 | 2 | 3 | 4 | 5 };

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  /** Frases de impacto da página do sabor. */
  tagline: [string, string, string];
  description: string;
  /** Ingredientes-herói exibidos. Lista legal completa: `ingredientsFull`. */
  ingredients: string[];
  /** Lista legal oficial (rótulo). Enquanto null, a página indica "consulte a embalagem". */
  ingredientsFull: string | null;
  weight: string;
  characteristics: string[];
  sensory: SensoryNote[];
  /** Cor principal do sabor (faixa do rótulo, luz). */
  color: string;
  /** Cor de destaque (partículas, brilho). */
  accentColor: string;
  /** Tom de fundo do ambiente 3D quando o sabor está selecionado. */
  background: string;
  /** Cor da cobertura do amendoim finalizado. */
  coating: string;
  /** Ingredientes que flutuam ao redor do produto. */
  visuals: IngredientVisual[];
  /** GLB opcional do pouch real (Draco). Vazio = pouch procedural. */
  model?: string;
  /** Foto do produto (AVIF/WebP). Usada em OG/Schema/fallback. */
  image: string;
  /** Link de compra do sabor. */
  buyUrl: string;
  placeholder?: boolean;
};

export const products: Product[] = [
  {
    id: 'caramelo-flor-de-sal',
    slug: 'caramelo-flor-de-sal',
    name: 'Caramelo & Flor de Sal',
    subtitle: 'Caramelizado devagar. Salgado na medida.',
    tagline: ['Crocante.', 'Intenso.', 'Absurdamente NUTT.'],
    description: 'O doce profundo do caramelo feito em tacho, quebrado por cristais de flor de sal.',
    ingredients: ['Amendoim selecionado', 'Caramelo', 'Flor de sal'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Cobertura crocante', 'Doce e salgado', 'Pequenos lotes'],
    sensory: [
      { label: 'Crocância', value: 5 },
      { label: 'Doçura', value: 4 },
      { label: 'Salgado', value: 3 },
      { label: 'Intensidade', value: 4 },
    ],
    color: '#E0822F',
    accentColor: '#FFB05C',
    background: '#1c0c03',
    coating: '#7a3510',
    visuals: [
      { kind: 'drop', label: 'Caramelo', color: '#c8641c', accent: '#ffb35a', glossy: true, weight: 1.4 },
      { kind: 'shard', label: 'Caramelo quebrado', color: '#d9832c', accent: '#ffcf85', glossy: true },
      { kind: 'crystal', label: 'Flor de sal', color: '#f4efe6', glossy: true, weight: 1.2 },
    ],
    image: '/images/produto-caramelo-flor-de-sal.webp',
    buyUrl: '#comprar-caramelo-flor-de-sal',
    placeholder: true,
  },
  {
    id: 'cacau-intenso',
    slug: 'cacau-intenso',
    name: 'Cacau Intenso',
    subtitle: 'Amargo elegante. Final longo.',
    tagline: ['Escuro.', 'Profundo.', 'Absurdamente NUTT.'],
    description: 'Amendoim envolvido em cacau de verdade, com nibs para quem gosta de sentir o grão.',
    ingredients: ['Amendoim selecionado', 'Cacau', 'Nibs de cacau'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Cacau real', 'Pouco doce', 'Textura em camadas'],
    sensory: [
      { label: 'Crocância', value: 4 },
      { label: 'Doçura', value: 2 },
      { label: 'Amargor', value: 4 },
      { label: 'Intensidade', value: 5 },
    ],
    color: '#8B4A2B',
    accentColor: '#C98A5E',
    background: '#120805',
    coating: '#3b1d10',
    visuals: [
      { kind: 'nib', label: 'Nibs de cacau', color: '#4a2416', accent: '#7a3e24', weight: 1.4 },
      { kind: 'shard', label: 'Chocolate', color: '#3a1c10', accent: '#6b3a22', glossy: true, weight: 1.2 },
      { kind: 'bean', label: 'Amêndoa de cacau', color: '#5c2e1a', accent: '#8f5433' },
    ],
    image: '/images/produto-cacau-intenso.webp',
    buyUrl: '#comprar-cacau-intenso',
    placeholder: true,
  },
  {
    id: 'frutas-vermelhas',
    slug: 'frutas-vermelhas',
    name: 'Frutas Vermelhas',
    subtitle: 'Fruta de verdade. Acidez que acorda.',
    tagline: ['Vibrante.', 'Frutado.', 'Absurdamente NUTT.'],
    description: 'A doçura ácida das frutas vermelhas encontrando a tosta do amendoim.',
    ingredients: ['Amendoim selecionado', 'Frutas vermelhas'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Fruta real', 'Doce e ácido', 'Cor natural'],
    sensory: [
      { label: 'Crocância', value: 4 },
      { label: 'Doçura', value: 3 },
      { label: 'Acidez', value: 4 },
      { label: 'Intensidade', value: 4 },
    ],
    color: '#C2263A',
    accentColor: '#FF5A6E',
    background: '#17040a',
    coating: '#7a1e26',
    visuals: [
      { kind: 'berry', label: 'Fruta vermelha', color: '#b3172c', accent: '#ffd3a0', weight: 1.5 },
      { kind: 'drop', label: 'Calda de fruta', color: '#a0101f', accent: '#ff6070', glossy: true },
      { kind: 'leaf', label: 'Folha', color: '#3f6b2a', accent: '#7fa35a', weight: 0.6 },
    ],
    image: '/images/produto-frutas-vermelhas.webp',
    buyUrl: '#comprar-frutas-vermelhas',
    placeholder: true,
  },
  {
    id: 'limao-siciliano',
    slug: 'limao-siciliano',
    name: 'Limão Siciliano',
    subtitle: 'Raspas frescas. Brilho cítrico.',
    tagline: ['Fresco.', 'Cítrico.', 'Absurdamente NUTT.'],
    description: 'O perfume da casca do limão siciliano sobre um grão tostado no ponto.',
    ingredients: ['Amendoim selecionado', 'Limão siciliano'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Raspas reais', 'Leve e aromático', 'Final fresco'],
    sensory: [
      { label: 'Crocância', value: 5 },
      { label: 'Doçura', value: 2 },
      { label: 'Acidez', value: 4 },
      { label: 'Frescor', value: 5 },
    ],
    color: '#E8C22A',
    accentColor: '#FFE36A',
    background: '#121105',
    coating: '#b8862a',
    visuals: [
      { kind: 'slice', label: 'Fatia de limão', color: '#f2d23a', accent: '#fff4b8', weight: 1.4 },
      { kind: 'flake', label: 'Raspas', color: '#e9c31f', accent: '#fff09a', weight: 1.2 },
      { kind: 'drop', label: 'Gota cítrica', color: '#f7f0c8', accent: '#ffffff', glossy: true, weight: 0.8 },
    ],
    image: '/images/produto-limao-siciliano.webp',
    buyUrl: '#comprar-limao-siciliano',
    placeholder: true,
  },
  {
    id: 'cafe-especial',
    slug: 'cafe-especial',
    name: 'Café Especial',
    subtitle: 'Torra média. Notas de rapadura.',
    tagline: ['Tostado.', 'Aromático.', 'Absurdamente NUTT.'],
    description: 'Dois grãos que nasceram para se encontrar: amendoim e café especial.',
    ingredients: ['Amendoim selecionado', 'Café'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Café de verdade', 'Doçura de rapadura', 'Aroma persistente'],
    sensory: [
      { label: 'Crocância', value: 4 },
      { label: 'Doçura', value: 3 },
      { label: 'Tosta', value: 5 },
      { label: 'Intensidade', value: 4 },
    ],
    color: '#A34A1F',
    accentColor: '#E08A4A',
    background: '#100905',
    coating: '#4a2612',
    visuals: [
      { kind: 'bean', label: 'Grão de café', color: '#3b2114', accent: '#6b3f25', weight: 1.6 },
      { kind: 'crystal', label: 'Açúcar', color: '#c98a4a', glossy: true },
    ],
    image: '/images/produto-cafe-especial.webp',
    buyUrl: '#comprar-cafe-especial',
    placeholder: true,
  },
  {
    id: 'especiarias',
    slug: 'especiarias',
    name: 'Especiarias',
    subtitle: 'Canela, calor e mistério.',
    tagline: ['Quente.', 'Perfumado.', 'Absurdamente NUTT.'],
    description: 'Especiarias inteiras, tostadas junto com o grão. Cheiro de cozinha boa.',
    ingredients: ['Amendoim selecionado', 'Canela', 'Anis-estrelado'],
    ingredientsFull: null,
    weight: '— g',
    characteristics: ['Especiarias inteiras', 'Aquecido', 'Complexo'],
    sensory: [
      { label: 'Crocância', value: 4 },
      { label: 'Doçura', value: 3 },
      { label: 'Especiarias', value: 5 },
      { label: 'Intensidade', value: 4 },
    ],
    color: '#C0612A',
    accentColor: '#FF8A3D',
    background: '#160903',
    coating: '#7a3413',
    visuals: [
      { kind: 'stick', label: 'Canela', color: '#8a4a26', accent: '#b8743f', weight: 1.2 },
      { kind: 'star', label: 'Anis-estrelado', color: '#5a2c18', accent: '#8a5030', weight: 1.1 },
      { kind: 'crystal', label: 'Açúcar mascavo', color: '#b06a32', glossy: true, weight: 0.8 },
    ],
    image: '/images/produto-especiarias.webp',
    buyUrl: '#comprar-especiarias',
    placeholder: true,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const featuredProduct = (id: string) => products.find((p) => p.id === id) ?? products[0];

/** Todos os ingredientes visuais únicos (por kind+cor) — alimentam a cena de ingredientes. */
export const allIngredientVisuals = (): IngredientVisual[] => {
  const seen = new Set<string>();
  const out: IngredientVisual[] = [];
  for (const p of products)
    for (const v of p.visuals) {
      const key = `${v.kind}:${v.color}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(v);
      }
    }
  return out;
};
