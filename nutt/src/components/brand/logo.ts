/**
 * Identidade NUTT em vetor — fonte única para SVG, canvas (rótulos), loader, favicon,
 * extrusão 3D e formação final dos amendoins.
 *
 * Letras monolineares arredondadas, em dois tons (laranja + marrom) separados por corte
 * diagonal, recriadas a partir do board de identidade. Se houver o SVG oficial, substitua
 * `symbol.path` / `wordmark.letters` mantendo as mesmas chaves.
 */
export const brand = {
  orange: '#FF6A00',
  brown: '#A34A1F',
  black: '#000000',
};

type Pt = [number, number];

/** Símbolo "n" (versão secundária) como forma preenchida. */
export const logo = {
  viewBox: { x: 0, y: 0, w: 100, h: 113 },
  path: 'M0,50 A50,50 0 0 1 100,50 L100,100 A13,13 0 0 1 74,100 L74,50 A24,24 0 0 0 26,50 L26,100 A13,13 0 0 1 0,100 Z',
  /** Região marrom: perna direita abaixo do corte diagonal no ombro. */
  brown: [
    [60, 74],
    [112, 22],
    [112, 130],
    [60, 130],
  ] as Pt[],
  /** Ponto (no viewBox) por onde a câmera atravessa o símbolo na abertura. */
  passage: { x: 50, y: 78 },
};

/** Wordmark "nutt": traços (centerline) com espessura `stroke`, pontas arredondadas. */
export const wordmark = {
  stroke: 26,
  viewBox: { x: -2, y: -45, w: 414, h: 160 },
  letters: [
    { char: 'n', x: 0, d: 'M13,100 V50 A37,37 0 0 1 87,50 V100', brown: [[60, 74], [112, 22], [112, 130], [60, 130]] as Pt[] },
    { char: 'u', x: 118, d: 'M13,13 V63 A37,37 0 0 0 87,63 M87,13 V100', brown: [[-15, -20], [60, -20], [60, 8], [-15, 84]] as Pt[] },
    { char: 't', x: 236, d: 'M35,-30 V70 A30,30 0 0 0 65,100 H70 M13,13 H63', brown: [[-15, -50], [95, -50], [95, 12], [-15, 74]] as Pt[] },
    { char: 't', x: 327, d: 'M35,-30 V70 A30,30 0 0 0 65,100 H70 M13,13 H63', brown: [[-15, 130], [-15, 72], [95, 18], [95, 130]] as Pt[] },
  ],
};

export const polyPoints = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');

/** Desenha o wordmark num canvas 2D (rótulos do pouch). `h` = altura do x-height. */
export function drawWordmark(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number, colors = brand) {
  const s = width / wordmark.viewBox.w;
  ctx.save();
  ctx.translate(cx - (wordmark.viewBox.w / 2 + wordmark.viewBox.x) * s, cy - (wordmark.viewBox.h / 2 + wordmark.viewBox.y) * s);
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = wordmark.stroke;
  for (const l of wordmark.letters) {
    ctx.save();
    ctx.translate(l.x, 0);
    const path = new Path2D(l.d);
    ctx.strokeStyle = colors.orange;
    ctx.stroke(path);
    ctx.beginPath();
    l.brown.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.clip();
    ctx.strokeStyle = colors.brown;
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.restore();
}

/** Desenha o símbolo "n" em dois tons num canvas. */
export function drawSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, colors: { orange: string; brown: string } = brand) {
  const s = height / logo.viewBox.h;
  const path = new Path2D(logo.path);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = colors.orange;
  ctx.fill(path);
  ctx.beginPath();
  logo.brown.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = colors.brown;
  ctx.fill(path);
  ctx.restore();
}
