# NUTT — Entre no Universo NUTT

> Documento de direção criativa e planejamento técnico (Entrega 1).
> Tudo o que está aqui foi implementado no código deste diretório. As seções 8 (assets) e o
> README marcam o que ainda é **placeholder** e precisa ser produzido/validado pela marca.

---

## 1. Conceito criativo

**"ENTRE NO UNIVERSO NUTT." — Do ingrediente ao primeiro crunch.**

O site não *apresenta* a NUTT: ele faz o visitante **atravessar** a NUTT. A metáfora é a de
um único plano-sequência de cinema publicitário gastronômico, em que o scroll é a alavanca da
câmera. A câmera entra pelo símbolo, viaja por uma galáxia de amendoins, encontra um único
grão, mergulha em ingredientes reais, assiste à transformação do grão em produto, ouve (se o
visitante quiser) o crunch — e só então, com desejo construído, apresenta os sabores.

Três ideias-guia:

| Ideia | O que significa na prática |
|---|---|
| **Escuridão como luxo** | Preto domina ~75% do tempo. A luz é rara, lateral, quente (laranja NUTT como *rim light*). O produto sempre "sai da sombra", como em perfumaria e chocolate de autor. |
| **Um objeto por vez** | Nunca há duas mensagens competindo. Uma frase, um objeto, muito espaço negativo. |
| **O scroll é a mastigação** | Cada cena é um passo sensorial: ver → aproximar → descobrir o sabor → transformar → quebrar → sentir. O crunch acontece exatamente no meio da jornada, como clímax. |

Reação-alvo por etapa: **"Que marca é essa?"** (abertura/universo) → **"Isso parece muito bom."**
(ingredientes/transformação/crunch) → **"Eu quero provar."** (sabores/final).

---

## 2. Jornada completa do usuário

| # | Momento | O que o usuário vê | O que sente | Ação que habilitamos |
|---|---|---|---|---|
| 0 | Loading | Símbolo NUTT se enchendo de laranja, % real | Expectativa, cuidado | — |
| 1 | Abertura | Símbolo minúsculo ganha volume e brilho; "Você nunca provou amendoim assim." | Curiosidade ("que marca é essa?") | Scroll / "Entre na NUTT ↓" |
| 2 | Travessia | Câmera atravessa o "n" → escuro | Surpresa (1ª grande surpresa) | — |
| 3 | Universo | Partículas que viram centenas de amendoins; reagem ao mouse | Descoberta, encantamento | Mover o mouse, clicar num grão (easter egg) |
| 4 | Seleção | Um grão ocupa a tela; macro de textura e torra | Qualidade, apetite | — |
| 5 | Sabor | "Mas NUTT não para no amendoim." Travessia por ingredientes reais | Sensorialidade | — |
| 6 | Verdade | "Não é aroma de. Não é gosto de. É feito com. INGREDIENTES REAIS." | Confiança | — |
| 7 | Transformação | Grão cru → envolvido por ingredientes → brilhante (controle total no scroll) | Desejo | Scroll para frente/trás (reversível) |
| 8 | The Crunch | Grão gigante se parte; "CRUNCH." gigante atrás | Clímax, quase sinestesia | Ativar som (nunca automático), clicar no grão |
| 9 | Manifesto | Palavras isoladas no escuro | Respiro, identificação com a marca | — |
| 10 | Sabores | Carrossel 3D de pouches; ambiente muda por sabor | Escolha, desejo específico | Arrastar, setas, teclado, clicar |
| 11 | Detalhe | Câmera se aproxima do pouch → página do sabor | Intenção de compra | **QUERO EXPERIMENTAR** |
| 12 | Por que NUTT | 4 benefícios, um de cada vez, cenário mudando | Justificativa racional | — |
| 13 | Final | Amendoins se organizam no "n" e se dissolvem | Memorabilidade | **EXPERIMENTE NUTT** |
| 14 | Onde encontrar / Footer | Pontos de venda, NUTT gigante, "SABOR QUE CONECTA." | Fechamento | Comprar, Instagram, contato |

---

## 3. Storyboard das cenas

Alturas de scroll em `vh` (configuráveis em `src/data/chapters.ts`). `p` = progresso local 0→1.

```
┌─ 00 LOADER ──────────────────┐ ┌─ 01 INTRO (200vh) ───────────┐ ┌─ 02 UNIVERSO (420vh) ────────┐
│                              │ │        ╭───╮                 │ │  ·    ·  ·     ·   ·   ·     │
│            ╭─╮               │ │        │ n │  ← 3D, glint    │ │    ·   (◐)  ·    ·   (◑)    │
│            │█│  ← enche      │ │        ╰───╯                 │ │  ·  (◒)    TUDO COMEÇA      │
│            ╰─╯   de laranja  │ │         NUTT                 │ │       ·     AQUI.     ·  ·  │
│            54%               │ │ Você nunca provou amendoim   │ │ p.55 um grão ao centro,      │
│                              │ │ assim.   ENTRE NA NUTT ↓     │ │ outros somem; p.8 macro      │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
   100% → símbolo expande           scroll → câmera atravessa o "n"   partículas → amendoins → 1 grão

┌─ 03 INGREDIENTES (460vh) ────┐ ┌─ 04 TRANSFORMAÇÃO (360vh) ───┐ ┌─ 05 THE CRUNCH (300vh) ──────┐
│ MAS NUTT NÃO PARA NO         │ │     ✦  ·  ✧   ·             │ │  C R U N C H .  (gigante,    │
│ AMENDOIM.                    │ │   ·   (●)  ✦   ARTESANAL     │ │        ◖ ◗     atrás)        │
│ 🍓   🍋      ☕    ✧   🥥     │ │    ✧   ·   ·   POR ESCOLHA.  │ │    ·  ✶   ·  fragmentos      │
│   passam rente à câmera (DOF)│ │  0% cru · 50% envolto ·      │ │  p.45 quebra (determinístico │
│ INGREDIENTES REAIS (laranja) │ │  100% NUTT (brilho, cristais)│ │  → reversível com o scroll)  │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘

┌─ 06 MANIFESTO (720vh) ───────┐ ┌─ 07 SABORES (auto) ──────────┐ ┌─ 08 POR QUE NUTT (440vh) ────┐
│                              │ │ DESCUBRA SEU NUTT.           │ │ 01 ─ AMENDOIM SELECIONADO    │
│   ALGUMAS PESSOAS VEEM       │ │   ▯     ▮     ▯   ← pouches  │ │  [ícone linear laranja]      │
│   AMENDOIM.                  │ │       gira        em arco    │ │  cenário: grade de grãos,    │
│  → possibilidades → textura  │ │ ‹  Caramelo & Flor de Sal  › │ │  poucos acesos (selecionados)│
│  → sabor → ingredientes →    │ │   [VER SABOR]  ambiente muda │ │ 02 orbita · 03 tambor ·      │
│  descoberta → NUTT.          │ │   clique → câmera aproxima   │ │ 04 anéis conectados          │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘

┌─ 09 FINAL (360vh) ───────────┐ ┌─ 10 ONDE ENCONTRAR ──────────┐ ┌─ 11 FOOTER ──────────────────┐
│  ·  ·    ·   ·   ·  ·    ·   │ │ ONDE ENCONTRAR               │ │ SABOR QUE CONECTA.           │
│      ·  ╭──╮  ·    ← grãos   │ │ Loja online ............ →   │ │                              │
│         │  │   formam o "n"  │ │ Empórios parceiros ..... →   │ │ N U T T  (gigante, cortado)  │
│  VOCÊ NUNCA PROVOU AMENDOIM  │ │ Seja um revendedor ..... →   │ │ Instagram · Contato ·        │
│  ASSIM. [EXPERIMENTE NUTT]   │ │                              │ │ Privacidade · Termos         │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

Transições entre capítulos passam por **preto** (overlay controlado pelo scroll). É isso que
permite trocar de cena 3D sem corte perceptível — e reforça a linguagem "sair da sombra".

---

## 4. Wireframe da homepage (estrutura DOM)

```
<header>  [n NUTT]                         SABORES  NOSSA HISTÓRIA  INGREDIENTES  ONDE ENCONTRAR  (COMPRAR)
<canvas fixed>  ← uma única cena WebGL, câmera controlada pelo capítulo ativo
<div overlay-preto fixed>  ← fades entre capítulos
<main>
  <section#inicio        chapter=intro>          h1 "NUTT — Você nunca provou amendoim assim."
  <section#universo      chapter=universe>       h2 + beats
  <section#ingredientes  chapter=ingredients>    h2 "Ingredientes reais" + beats
  <section#transformacao chapter=transformation> h2 + beats + régua 0/50/100%
  <section#crunch        chapter=crunch>         h2 "The Crunch"
  <section#nossa-historia chapter=manifesto>     h2 + manifesto
  <section#sabores       chapter=products>       h2 "Descubra seu NUTT." + tablist de sabores (DOM real)
  <section#por-que-nutt  chapter=why>            h2 + 4 artigos (h3)
  <section#experimente   chapter=final>          h2 + CTA
  <section#onde-encontrar>                        h2 + lista de canais
</main>
<footer>
<dialog ProductDetail>  ← abre sobre o canvas, URL #sabor/<slug>; também existe /sabores/<slug> estático (SEO)
[cursor custom] [botão som] [toast "Vai ficar só olhando?"]
```

Cada capítulo = `<section>` com altura em `vh` + um frame `position: sticky` de 100vh. O
ScrollTrigger lê o progresso de cada seção; a cena 3D e as frases ("beats") leem esse valor.
**Todo texto importante está no DOM** (indexável, legível por leitor de tela), o canvas é camada
visual.

---

## 5. Lista de interações

| Interação | Onde | Detalhe |
|---|---|---|
| Scroll como câmera | Todo o storytelling | Lenis + GSAP ScrollTrigger; reversível; sensação precisa, não lenta (`lerp 0.1`) |
| Paralaxe de câmera | Global | Câmera inclina ≤ 3% em direção ao cursor (mola amortecida) |
| Símbolo reage ao cursor | Intro | Inclinação sutil do "n" 3D |
| Amendoins se afastam | Universo, Final | Repulsão pelo raio do cursor, força proporcional à velocidade do mouse (easter egg 1) |
| Clique num amendoim = CRUNCH | Universo, Crunch | Grão explode em fragmentos + som (se ativo) (easter egg 2) |
| "Vai ficar só olhando?" | Global | Após 8 s sem interação, no máx. 2x por sessão (easter egg 3) |
| Transformação controlada | Transformação | Máscara de cobertura no shader = progresso do scroll |
| Quebra controlada | Crunch | Cinemática determinística, reversível (ver seção 6) |
| Carrossel 3D | Sabores | Arrastar / swipe / setas / ← → no teclado / tabs DOM |
| Ambiente por sabor | Sabores | Cor de fundo, luz principal e ingredientes flutuantes vêm do `products.ts` |
| Transição cinematográfica | Sabores → Detalhe | Dolly da câmera até o pouch → painel do sabor; `Esc`/voltar do navegador fecham |
| Pouch interativo | Detalhe | Inclinação limitada (±18°/±10°) ao cursor ou arraste; giroscópio só após permissão explícita |
| Cursor custom | Desktop (pointer fine) | Ponto laranja; cresce e mostra VER / PROVAR / ABRIR / DESCOBRIR |
| Botões magnéticos | CTAs | Deslocamento máx. ~30% do offset, retorno elástico |
| Links | Menu, footer | Underline que "desenha" da esquerda para a direita |
| Som (opt-in) | Botão fixo | "Ativar experiência sonora" — ambiente, crunch, transições, tick de seleção. Síntese WebAudio, 0 KB de áudio |
| Menu | Header | Transparente → preto translúcido com blur após scroll; menu fullscreen no mobile |

---

## 6. Tecnologias (e por quê)

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript**, `output: 'export'` | HTML estático pré-renderizado com todo o conteúdo (SEO), Metadata API, `sitemap.ts`/`robots.ts`, rotas estáticas por sabor; hospeda em qualquer CDN |
| 3D | **Three.js via React Three Fiber + drei** | Componentização das cenas, instancing, `Environment` com Lightformers (HDRI de estúdio sem download), `ContactShadows`, `PerformanceMonitor`, `AdaptiveDpr` |
| Pós-processamento | **@react-three/postprocessing** | Bloom sutil, DOF (tier alto), grão de filme e vinheta — o "look" fotográfico |
| Animação | **GSAP + ScrollTrigger** | Timeline da abertura, transições do produto, progresso por capítulo |
| Smooth scroll | **Lenis** | Integrado ao ticker do GSAP (`lenis.on('scroll', ScrollTrigger.update)`) |
| Shaders | **GLSL via `onBeforeCompile`** | Só onde agregam: máscara de cobertura/brilho do amendoim, varredura de brilho do símbolo, face interna do grão partido. Mantém PBR do Three |
| Física | **Sem Rapier (decisão consciente)** | Toda física aqui é *scrubbed* pelo scroll e precisa ser **reversível**; simulação não volta no tempo. Usamos cinemática balística determinística (posição = f(t)) — mais leve (~0 KB vs ~2 MB wasm) e sem cara de jogo. Rapier pode entrar depois para um modo "brincar" livre |
| Áudio | **Web Audio API (síntese)** | Crunch, ambiente e transições gerados em tempo real; nunca autoplay |
| Assets | Geometria e texturas **procedurais** nesta fase | Zero download de modelos; pipeline Draco/KTX2 já configurado para quando os modelos reais existirem |

---

## 7. Estrutura de componentes

```
app/                         rotas (layout com metadata/JSON-LD, home, /sabores/[slug], legais, sitemap, robots)
src/
  components/
    Experience.tsx           orquestra: loader → canvas → capítulos → UI
    brand/                   Logo (SVG), Wordmark, ícones lineares
    ui/                      Header, Cursor, MagneticButton, SoundToggle, IdleHint, Loader
    story/                   Chapter, Beat (frases com entrada/saída pelo progresso)
    sections/                DOM de cada capítulo (Intro, Universe, Ingredients, ...)
    product/                 ProductDetail (overlay e página), SensoryProfile
  scenes/
    Stage.tsx                <Canvas>, luzes de estúdio, pós, tier, câmera
    IntroScene.tsx           símbolo 3D + travessia
    PeanutUniverse.tsx       campo instanciado + grão herói + macro
    IngredientScene.tsx      túnel de ingredientes (dados)
    FlavorTransformation.tsx cru → NUTT
    CrunchScene.tsx          a quebra
    ManifestoScene.tsx       respiro
    ProductsScene.tsx        carrossel de pouches + ambiente por sabor + detalhe
    WhyScene.tsx             formações por benefício
    FinalScene.tsx           amendoins formam o "n"
    shared/                  Peanut, PeanutSwarm, IngredientField, Pouch, Fragments, Dust
  models/                    geometrias procedurais (amendoim, metade, pouch, ingredientes, símbolo)
  shaders/                   chunks GLSL (cobertura, glint)
  textures/                  texturas procedurais em canvas (pele do grão, rótulo do pouch)
  hooks/                     useChapter, useReducedMotion, useTier, useIdle, usePointer
  utils/                     store (estado fora do React), math, audio, formações
  data/                      products.ts, ingredients.ts, chapters.ts, copy.ts, site.ts
  styles/                    globals.css
public/  textures/ models/ images/ draco/ basis/
```

Regra de ouro: **nenhum componente 3D conhece um sabor.** Cores, luz, fundo, ingredientes
flutuantes, textos e modelo vêm de `src/data/products.ts`.

---

## 8. Assets que precisaremos produzir

| Asset | Status atual | Produção final recomendada |
|---|---|---|
| Símbolo NUTT (SVG vetorial oficial) | **Placeholder** "n" arredondado em `src/components/brand/logo.ts` | Enviar SVG oficial — basta trocar o `path`; extrusão 3D, loader e favicon se atualizam |
| Fonte Singlet (licença web) | Substituída por **Nunito** (títulos) + **Manrope** (texto) | Licenciar Singlet em WOFF2 e trocar em `app/fonts.ts` |
| Modelo 3D do pouch | Procedural + rótulo gerado em canvas | Fotogrametria ou modelagem (Blender) ≤ 15k tris, Draco, texturas KTX2 2k (base, ORM, normal) |
| Grão de amendoim (cru, tostado, cada cobertura) | Procedural (geometria + texturas + shader) | Scan macro de grão real → retopo 3–5k tris; normal/roughness 2k KTX2 |
| Ingredientes (fruta, cacau, café, especiarias…) | Primitivas procedurais estilizadas | **Fotografia real** recortada (sprites WebP/AVIF com alpha) ou scans 3D — comunicar "ingredientes reais" pede realismo fotográfico |
| Fotografia de produto | Não existe | Still de cada pouch (fundo preto, luz lateral laranja) em AVIF/WebP — usado em OG, Schema e fallback sem WebGL |
| Imagem Open Graph | SVG gerado (`public/og.svg`) + PNG | Arte final 1200×630 |
| Sons | Síntese Web Audio | Foley real (crunch gravado com microfone de contato), mix em -24 LUFS, Opus/AAC < 60 KB cada |
| Linha de sabores, ingredientes, peso, perfil sensorial | **Exemplos** marcados como `placeholder` | Dados oficiais da marca — **nunca publicar os exemplos** |
| URLs (loja, Instagram, e-mail, domínio) | Placeholders em `src/data/site.ts` | Dados reais |

---

## 9. Estratégia mobile

- **Mesma narrativa, outra densidade.** Todos os capítulos existem no mobile; muda o custo:
  amendoins do universo 700 → 220, fragmentos 160 → 60, ingredientes −60%.
- **Resolução:** DPR máx. 1.5 (desktop 2), `PerformanceMonitor` baixa ainda mais se o FPS cair.
- **Sem** DOF, sem `ContactShadows` dinâmicas, bloom desligado no tier baixo; grão de filme mantido
  (barato e segura o look premium).
- **Touch substitui hover:** tocar num amendoim = crunch; swipe no carrossel; arrastar inclina o
  pouch. Cursor custom e efeito magnético desligados em `pointer: coarse`.
- **Giroscópio** só com botão explícito "Mover com o celular" e só onde existe `DeviceOrientationEvent`
  (iOS pede permissão); nunca pedido automaticamente.
- **Tipografia** em `clamp()` e frases quebradas para caber em 360px; áreas de toque ≥ 44px.
- Menu fullscreen; CTA "Comprar" sempre acessível.
- Sem WebGL → o site continua completo: textos, sabores (tabs DOM), detalhes e CTAs.

---

## 10. Estratégia de performance

1. **Primeiro frame leve:** HTML estático com todo o conteúdo + CSS. O bundle 3D (three/R3F/cenas)
   é `dynamic import` e carrega durante o loader.
2. **Loader honesto:** o % reflete etapas reais — fontes, chunk 3D, geração de texturas,
   **pré-compilação de shaders** (`gl.compileAsync`) e primeiro frame. Evita travadas no meio do scroll.
3. **Zero download de modelos nesta fase** (geometria/texturas procedurais, geradas uma vez e cacheadas).
4. **Instancing** para tudo que se repete (amendoins, fragmentos, ingredientes, partículas).
5. **Uma única `<Canvas>`**; cenas fora da tela ficam `visible=false`; quando nenhum capítulo 3D
   está visível (onde encontrar/footer) o render loop **para** (`frameloop="never"`).
6. **Estado fora do React:** progresso de scroll e ponteiro num store mutável lido em `useFrame` —
   nenhum re-render de React durante o scroll.
7. **Tiers de qualidade** (baixo/médio/alto) por heurística de dispositivo + `PerformanceMonitor`;
   `AdaptiveDpr` durante interações.
8. **Pipeline pronto para assets reais:** decoders Draco e Basis/KTX2 copiados para `/public` no
   `postinstall`; `next/image` desativado no export, então imagens entram já em AVIF/WebP.
9. **`prefers-reduced-motion`:** sem smooth scroll, sem voos de câmera — cada capítulo vira um
   "still" 3D com texto em fluxo normal.
10. Metas: LCP < 2.0 s (texto/HTML), 60 FPS desktop moderno, ≥ 40 FPS em mobile médio.
