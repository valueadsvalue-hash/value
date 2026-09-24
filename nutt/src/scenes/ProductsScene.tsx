'use client';
import { ContactShadows } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { products } from '@/data/products';
import { clamp, damp, easeInOut, lerp } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { store, useStore } from '@/utils/store';
import { setCamera, setLights } from './rig';
import { IngredientField, type FieldControl, type FieldHandle } from './shared/IngredientField';
import { Pouch } from './shared/Pouch';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * SABORES — carrossel 3D em arco. O sabor selecionado gira lentamente e o ambiente inteiro
 * (fundo, luz, ingredientes flutuantes) muda de acordo com os dados do produto.
 * Detalhe: a câmera se aproxima do pouch (detailT 0→1) e o painel do sabor é revelado.
 */
const N = products.length;
const wrap = (k: number) => ((((k + N / 2) % N) + N) % N) - N / 2;

export default function ProductsScene() {
  const group = useRef<THREE.Group>(null!);
  const pouches = useRef<(THREE.Group | null)[]>([]);
  const fields = useRef<(FieldHandle | null)[]>([]);
  const owner = useStore((s) => s.owner);
  const q = qualityByTier[store.tier];
  const st = useMemo(
    () => ({
      sel: store.selected,
      weights: new Float32Array(N),
      tiltX: 0,
      tiltY: 0,
      ctl: products.map<FieldControl>(() => ({ t: 0, p: 0, scale: 0, center: new THREE.Vector3(), radius: 1.25 })),
      cam: new THREE.Vector3(),
      look: new THREE.Vector3(),
      bg: new THREE.Color(),
      key: new THREE.Color(),
    }),
    [],
  );

  useChapterFrame('products', group, ({ t, dt, camera }) => {
    // seleção suavizada pelo caminho mais curto (carrossel infinito)
    const target = store.selected;
    st.sel += wrap(target - st.sel) * (1 - Math.exp(-6 * dt));
    const d = store.detailT;
    const dE = easeInOut(d);
    const mobile = store.mobile;

    // ponteiro/giroscópio -> inclinação limitada do pouch
    const gx = store.gyro.active ? store.gyro.x : store.pointer.sx;
    const gy = store.gyro.active ? store.gyro.y : store.pointer.sy;
    st.tiltY = damp(st.tiltY, clamp(gx, -1, 1) * lerp(0.12, 0.32, dE), 5, dt);
    st.tiltX = damp(st.tiltX, clamp(-gy, -1, 1) * lerp(0.05, 0.17, dE), 5, dt);

    for (let i = 0; i < N; i++) {
      const g = pouches.current[i];
      if (!g) continue;
      const k = wrap(i - st.sel);
      const ak = Math.abs(k);
      const selected = Math.max(0, 1 - ak);
      st.weights[i] = selected;
      const a = k * 0.62;
      const R = mobile ? 2.6 : 3.4;
      g.position.set(Math.sin(a) * R, lerp(0.05, 0, selected) + Math.sin(t * 0.7 + i) * 0.03, -(1 - Math.cos(a)) * R - ak * 0.35);
      g.rotation.set(
        st.tiltX * selected,
        -a * 0.85 + selected * (Math.sin(t * 0.35) * 0.35 * (1 - dE) + st.tiltY),
        selected * Math.sin(t * 0.5) * 0.02,
      );
      // no detalhe, os demais recuam e somem
      const hide = (1 - selected) * dE;
      const s = lerp(0.82, 1, selected) * (1 - hide) * (ak > 2.6 ? Math.max(0, 1 - (ak - 2.6) * 2) : 1);
      g.scale.setScalar(Math.max(0.0001, s));
      g.visible = s > 0.001;

      const f = fields.current[i];
      if (f) {
        const c = st.ctl[i];
        c.t = t;
        c.center.set(g.position.x, 0, g.position.z);
        c.scale = damp(c.scale, selected > 0.6 ? 1 : 0, 3, dt);
        f.update(c);
      }
    }

    // câmera: vista do carrossel -> close no pouch (pouch à esquerda no desktop, acima no mobile)
    if (mobile) {
      st.cam.set(0, lerp(-0.3, -0.5, dE), lerp(4.6, 2.5, dE));
      st.look.set(0, lerp(-0.5, -0.6, dE), 0);
    } else {
      st.cam.set(lerp(0, 0.66, dE), lerp(-0.2, 0.05, dE), lerp(6.2, 4.1, dE));
      st.look.set(lerp(0, 0.66, dE), lerp(-0.42, 0, dE), 0);
    }
    setCamera(camera, st.cam, st.look, lerp(32, 30, dE));

    // ambiente do sabor (mistura ponderada entre vizinhos)
    const cur = products[((Math.round(st.sel) % N) + N) % N];
    st.bg.set(cur.background);
    st.key.set(cur.accentColor);
    setLights({
      key: ['#fff1e2', 2.2, [2.5, 3, 4]],
      rim: [`#${st.key.getHexString()}`, 9, [-3.2, 1.2, -2]],
      fill: [cur.color, 0.5],
      env: 0.9,
      background: st.bg,
      fog: 0,
      bloom: 0.45,
      focus: st.cam.length(),
      bokeh: dE * 1.5,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'products' }}>
      {products.map((p, i) => (
        <group key={p.id}>
          <Pouch
            product={p}
            ref={(el) => {
              pouches.current[i] = el;
            }}
          />
          <IngredientField
            ref={(el) => {
              fields.current[i] = el;
            }}
            visuals={p.visuals}
            density={9}
            mode="orbit"
            seed={i * 7 + 1}
            size={0.55}
          />
        </group>
      ))}
      {q.contactShadows && owner === 'products' && (
        <ContactShadows position={[0, -0.78, 0]} opacity={0.65} scale={9} blur={2.6} far={2} resolution={512} color="#000000" />
      )}
    </group>
  );
}
