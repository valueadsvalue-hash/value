import * as THREE from 'three';
import { mulberry32 } from '@/utils/math';

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const s = new THREE.Vector3();
const v = new THREE.Vector3();

/**
 * Estado físico leve de um enxame instanciado: alvo (definido pela cena a cada frame) +
 * deslocamento por mola (repulsão do cursor). Sem motor de física: controlado e elegante.
 */
export class Swarm {
  n: number;
  target: Float32Array;
  offset: Float32Array;
  vel: Float32Array;
  scale: Float32Array;
  seed: Float32Array; // rx, ry, rz, spin
  constructor(n: number, seed = 1) {
    this.n = n;
    this.target = new Float32Array(n * 3);
    this.offset = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.scale = new Float32Array(n).fill(1);
    this.seed = new Float32Array(n * 4);
    const r = mulberry32(seed);
    for (let i = 0; i < n * 4; i++) this.seed[i] = r();
  }

  /** Empurra instâncias próximas ao raio do cursor. Força cresce com a velocidade do mouse. */
  repel(ray: THREE.Ray, radius: number, strength: number, maxDist = 30) {
    const { n, target, offset, vel } = this;
    const o = ray.origin, d = ray.direction;
    for (let i = 0; i < n; i++) {
      const j = i * 3;
      const x = target[j] + offset[j] - o.x, y = target[j + 1] + offset[j + 1] - o.y, z = target[j + 2] + offset[j + 2] - o.z;
      const t = x * d.x + y * d.y + z * d.z;
      if (t < 0 || t > maxDist) continue;
      const dx = x - d.x * t, dy = y - d.y * t, dz = z - d.z * t;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const rr = radius * (0.6 + t * 0.06);
      if (dist < rr && dist > 1e-4) {
        const f = (1 - dist / rr) * strength / dist;
        vel[j] += dx * f;
        vel[j + 1] += dy * f;
        vel[j + 2] += dz * f * 0.5;
      }
    }
  }

  springs(dt: number, k = 16, c = 5.5) {
    const { offset, vel } = this;
    for (let j = 0; j < offset.length; j++) {
      vel[j] += (-k * offset[j] - c * vel[j]) * dt;
      offset[j] += vel[j] * dt;
    }
  }

  /** Índice da instância mais próxima do raio (para o clique), ou -1. */
  pick(ray: THREE.Ray, radius: number, maxDist = 20) {
    let best = -1, bestT = Infinity;
    const { n, target, offset } = this;
    for (let i = 0; i < n; i++) {
      if (this.scale[i] < 0.2) continue;
      const j = i * 3;
      v.set(target[j] + offset[j], target[j + 1] + offset[j + 1], target[j + 2] + offset[j + 2]);
      const t = v.clone().sub(ray.origin).dot(ray.direction);
      if (t < 0 || t > maxDist) continue;
      if (ray.distanceSqToPoint(v) < radius * radius && t < bestT) {
        bestT = t;
        best = i;
      }
    }
    return best;
  }

  position(i: number, out: THREE.Vector3) {
    const j = i * 3;
    return out.set(this.target[j] + this.offset[j], this.target[j + 1] + this.offset[j + 1], this.target[j + 2] + this.offset[j + 2]);
  }

  /** Compõe as matrizes. `size` = escala base; `spin` = rotação acumulada (rad). */
  commit(mesh: THREE.InstancedMesh, size: number, spin: number) {
    const { n, target, offset, scale, seed } = this;
    for (let i = 0; i < n; i++) {
      const j = i * 3, k = i * 4;
      p.set(target[j] + offset[j], target[j + 1] + offset[j + 1], target[j + 2] + offset[j + 2]);
      const sp = spin * (0.4 + seed[k + 3]);
      e.set(seed[k] * 6.28 + sp, seed[k + 1] * 6.28 + sp * 0.7, seed[k + 2] * 6.28);
      q.setFromEuler(e);
      const sc = size * scale[i] * (0.8 + seed[k + 3] * 0.4);
      s.set(sc, sc, sc);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
}

/** Mistura duas formações com defasagem por instância (movimento orgânico, não robótico). */
export function mixFormations(out: Float32Array, a: Float32Array, b: Float32Array, t: number, seed: Float32Array, stagger = 0.35) {
  const n = out.length / 3;
  for (let i = 0; i < n; i++) {
    const d = seed[i * 4 + 3] * stagger;
    let k = Math.min(1, Math.max(0, (t - d) / (1 - stagger)));
    k = k * k * (3 - 2 * k);
    const j = i * 3;
    out[j] = a[j] + (b[j] - a[j]) * k;
    out[j + 1] = a[j + 1] + (b[j + 1] - a[j + 1]) * k;
    out[j + 2] = a[j + 2] + (b[j + 2] - a[j + 2]) * k;
  }
}
