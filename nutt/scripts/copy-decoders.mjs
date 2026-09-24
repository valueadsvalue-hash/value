// Copia os decoders Draco e Basis (KTX2) do three para /public, servidos localmente
// (sem CDN de terceiros). Usados quando os modelos/texturas reais substituírem os procedurais.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const libs = resolve(root, 'node_modules/three/examples/jsm/libs');
const targets = [
  ['draco/gltf', 'public/draco'],
  ['basis', 'public/basis'],
];

for (const [from, to] of targets) {
  const src = resolve(libs, from);
  if (!existsSync(src)) continue;
  mkdirSync(resolve(root, to), { recursive: true });
  cpSync(src, resolve(root, to), { recursive: true, filter: (f) => !f.endsWith('README.md') });
}
