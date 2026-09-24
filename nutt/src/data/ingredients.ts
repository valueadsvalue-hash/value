/**
 * Biblioteca de ingredientes VISUAIS. Cada "kind" corresponde a uma geometria procedural
 * em src/models/ingredientGeometries.ts. Os sabores (products.ts) apenas referenciam estes
 * kinds com as próprias cores — para trocar por fotos/scans reais, preencha `model`.
 */
export type IngredientKind =
  | 'drop' // gota: calda, caramelo, suco
  | 'slice' // fatia de fruta cítrica
  | 'berry' // fruta vermelha
  | 'shard' // lasca: chocolate, coco, caramelo quebrado
  | 'bean' // grão: café
  | 'nib' // nibs: cacau
  | 'crystal' // cristal: sal, açúcar
  | 'flake' // raspa/zest, pétala
  | 'leaf' // folha
  | 'stick' // bastão: canela
  | 'star'; // estrela: anis

export type IngredientVisual = {
  kind: IngredientKind;
  /** Nome para acessibilidade / legenda. */
  label: string;
  color: string;
  /** Cor secundária (polpa, veio, reflexo). */
  accent?: string;
  /** Peso relativo na composição (1 = normal). */
  weight?: number;
  /** Material translúcido/brilhante (gotas, cristais). */
  glossy?: boolean;
  /** Caminho opcional para GLB real (Draco/KTX2) em /public/models. */
  model?: string;
};
