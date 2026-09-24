/**
 * PLACEHOLDER DO SÍMBOLO NUTT — um "n" arredondado e orgânico.
 * Para usar o símbolo oficial basta substituir `path` e `viewBox` pelo SVG da marca (um único
 * path preenchido). Loader, header, favicon, extrusão 3D e a formação final dos amendoins
 * derivam daqui.
 */
export const logo = {
  viewBox: { x: 0, y: 0, w: 100, h: 114 },
  path: 'M4,50 A46,46 0 0 1 96,50 L96,100 A13,13 0 0 1 70,100 L70,50 A20,20 0 0 0 30,50 L30,100 A13,13 0 0 1 4,100 Z',
  /** Ponto (no viewBox) por onde a câmera atravessa o símbolo na abertura. */
  passage: { x: 50, y: 78 },
};
