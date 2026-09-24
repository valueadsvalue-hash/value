import { logo } from '@/components/brand/logo';
import { mulberry32 } from './math';

/** Formações (alvos de posição) para enxames de amendoins. Arrays planos xyz. */
export type Formation = Float32Array;

export function cloud(n: number, radius: number, cz = 0, seed = 1): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, rad = radius * Math.cbrt(0.25 + r() * 0.75);
    const s = Math.sqrt(1 - u * u);
    out[i * 3] = Math.cos(a) * s * rad;
    out[i * 3 + 1] = u * rad * 0.6;
    out[i * 3 + 2] = cz + Math.sin(a) * s * rad;
  }
  return out;
}

/** Túnel ao longo de -Z com corredor livre para a câmera. */
export function tunnel(n: number, rMin: number, rMax: number, z0: number, z1: number, seed = 2): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, rad = rMin + Math.sqrt(r()) * (rMax - rMin);
    out[i * 3] = Math.cos(a) * rad;
    out[i * 3 + 1] = Math.sin(a) * rad * 0.75;
    out[i * 3 + 2] = z0 + r() * (z1 - z0);
  }
  return out;
}

/** "Mesa de seleção": grade inclinada, levemente irregular. */
export function grid(n: number, spacing: number, seed = 3): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  const cols = Math.ceil(Math.sqrt(n * 1.8)), rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const cx = i % cols, cy = Math.floor(i / cols);
    const x = (cx - (cols - 1) / 2) * spacing + (r() - 0.5) * spacing * 0.3;
    const z = (cy - (rows - 1) / 2) * spacing + (r() - 0.5) * spacing * 0.3;
    out[i * 3] = x;
    out[i * 3 + 1] = -1.2 + (r() - 0.5) * 0.05;
    out[i * 3 + 2] = z - 1;
  }
  return out;
}

/** Tambor de torra: superfície de cilindro no eixo X (a cena gira o ângulo). Retorna [ângulo, x, raio]. */
export function drum(n: number, radius: number, length: number, seed = 4): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = r() * Math.PI * 2;
    out[i * 3 + 1] = (r() - 0.5) * length;
    out[i * 3 + 2] = radius * (0.72 + r() * 0.28);
  }
  return out;
}

/** Dois anéis entrelaçados — "sabor que conecta". */
export function rings(n: number, R: number, seed = 5): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, tube = (r() - 0.5) * 0.45, tube2 = (r() - 0.5) * 0.45;
    if (i % 2 === 0) {
      out[i * 3] = Math.cos(a) * (R + tube) - R * 0.55;
      out[i * 3 + 1] = Math.sin(a) * (R + tube);
      out[i * 3 + 2] = tube2;
    } else {
      out[i * 3] = Math.cos(a) * (R + tube) + R * 0.55;
      out[i * 3 + 1] = tube2;
      out[i * 3 + 2] = Math.sin(a) * (R + tube);
    }
  }
  return out;
}

/** Pontos dentro do símbolo NUTT (amostragem por rejeição no Path2D do logo). */
export function logoFormation(n: number, height: number, seed = 6): Formation {
  const r = mulberry32(seed), out = new Float32Array(n * 3);
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d')!;
  const path = new Path2D(logo.path);
  const { w, h } = logo.viewBox;
  const s = height / h;
  let i = 0, guard = 0;
  while (i < n && guard++ < n * 200) {
    const px = r() * w, py = r() * h;
    if (!ctx.isPointInPath(path, px, py)) continue;
    out[i * 3] = (px - w / 2) * s;
    out[i * 3 + 1] = -(py - h / 2) * s;
    out[i * 3 + 2] = (r() - 0.5) * height * 0.06;
    i++;
  }
  return out;
}
