# NUTT — Entre no universo NUTT

Experiência digital imersiva para a NUTT (amendoins artesanais gourmet).
Direção criativa, jornada, storyboard, wireframe, interações, tecnologias, componentes,
assets, mobile e performance: **[docs/01-conceito-e-planejamento.md](docs/01-conceito-e-planejamento.md)**.

```
npm install        # também copia os decoders Draco/KTX2 para /public
npm run dev        # http://localhost:3000
npm run build      # export estático em /out (qualquer CDN)
npm run typecheck
```

Adicione `?debug` à URL para expor `window.__nutt` (estado da experiência) em testes.

## Stack

Identidade: Sniglet · laranja `#FF6A00` · marrom `#A34A1F` · preto · wordmark "nutt" em dois tons.

Next.js (App Router, export estático) · React · TypeScript · Three.js via React Three Fiber
+ drei · @react-three/postprocessing · GSAP + ScrollTrigger · Lenis · GLSL (`onBeforeCompile`)
· Web Audio (síntese).

## Como a experiência funciona

- Cada capítulo é uma `<section data-chapter>` com altura em `vh` e um frame `sticky`
  (`src/components/story/Chapter.tsx`). O `useScrollDirector` (Lenis + ScrollTrigger)
  calcula o progresso de cada capítulo, escolhe o capítulo **dono da câmera**, faz o fade ao
  preto entre capítulos e anima as frases (`Beat`) por CSS vars — sem re-render do React.
- Há **uma única `<Canvas>`** (`src/scenes/Stage.tsx`). Cada cena lê o próprio progresso num
  store mutável (`src/utils/store.ts`) dentro de `useFrame` e só é renderizada quando é dona.
- Luzes têm número fixo; as cenas escrevem alvos (`src/scenes/rig.ts`) — trocar de cena não
  recompila shaders. Todos os shaders são pré-compilados durante o loader.
- Todo texto importante está no DOM (SEO + leitores de tela). Sem JS ou sem WebGL, o site
  continua completo.

## Adicionar ou editar um sabor

Edite **`src/data/products.ts`**. Cada item gera automaticamente: pouch 3D com rótulo,
ambiente do carrossel (fundo, luz, ingredientes flutuantes), overlay de detalhe, página
estática `/sabores/<slug>/`, entrada no sitemap e Schema Product.

Ingredientes visuais usam os tipos de `src/data/ingredients.ts` (`drop`, `slice`, `berry`,
`shard`, `bean`, `nib`, `crystal`, `flake`, `leaf`, `stick`, `star`) com as cores do sabor.
Quando houver modelo real, preencha `model` (GLB com Draco em `/public/models`).

## ⚠️ Placeholders a substituir antes de publicar

| O quê | Onde |
|---|---|
| **Sabores além do Amendoim Caramelizado** (os outros 5 são EXEMPLOS de estrutura, `placeholder: true`) | `src/data/products.ts` |
| Confirmar texto legal do Amendoim Caramelizado (ingredientes/peso vieram do mockup do board) | `src/data/products.ts` |
| Wordmark/símbolo: recriados em vetor a partir do board — trocar pelos SVGs oficiais se existirem | `src/components/brand/logo.ts` (+ `public/icon.svg`) |
| Domínio, Instagram, e-mail, links de compra, pontos de venda | `src/data/site.ts` |
| Imagem Open Graph e fotos de produto | `public/og.png`, `public/images/` |
| Textos de privacidade e termos | `app/privacidade`, `app/termos` |

## Estrutura

```
app/                 rotas, metadata, JSON-LD, sitemap, robots, páginas por sabor
src/components/      Experience, brand, ui (header, cursor, loader, som...), story, sections, product
src/scenes/          Stage + IntroScene, PeanutUniverse, IngredientScene, FlavorTransformation,
                     CrunchScene, ManifestoScene, ProductsScene, WhyScene, FinalScene, shared/
src/models/          geometrias procedurais (amendoim, metades, pouch, ingredientes, símbolo)
src/shaders/         material do amendoim (cobertura, brilho, cristais, face interna)
src/textures/        texturas procedurais em canvas (pele do grão, rótulos)
src/hooks/           scroll director, ponteiro
src/utils/           store, math, áudio, formações, qualidade/tier, scroll, detalhe
src/data/            products, ingredients, chapters, copy, site
public/              icon, og, draco/basis (postinstall), models/, images/, textures/
```

## Easter eggs (3)

1. Mover o mouse rápido sobre os amendoins: eles fogem (força proporcional à velocidade).
2. Clicar num amendoim do universo (ou no grão gigante antes da quebra): CRUNCH.
3. Ficar parado ~8 s: "Vai ficar só olhando?" (no máximo 2x por sessão).
