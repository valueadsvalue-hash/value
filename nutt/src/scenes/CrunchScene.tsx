'use client';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { copy } from '@/data/copy';
import { featuredProduct } from '@/data/products';
import { site } from '@/data/site';
import { createCrumbGeometry } from '@/models/peanut';
import { createPeanutMaterial } from '@/shaders/peanutMaterial';
import { wordTexture } from '@/textures/pouchLabel';
import { audio } from '@/utils/audio';
import { easeInOut, easeOut, lerp, mulberry32, range } from '@/utils/math';
import { qualityByTier } from '@/utils/quality';
import { set, store } from '@/utils/store';
import { setCamera, setLights } from './rig';
import { Peanut, type PeanutHandle } from './shared/Peanut';
import { useChapterFrame } from './shared/useChapterFrame';

/**
 * THE CRUNCH — o grão NUTT gigante se parte nas duas metades naturais (cotilédones) e solta
 * fragmentos. Cinemática balística determinística: posição = f(progresso) => reversível no
 * scroll, sem "cara de jogo". "CRUNCH." gigante atrás do grão.
 */
const BREAK = 0.46;
const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const eu = new THREE.Euler();
const pv = new THREE.Vector3();
const sv = new THREE.Vector3();

export default function CrunchScene() {
  const group = useRef<THREE.Group>(null!);
  const whole = useRef<THREE.Group>(null!);
  const left = useRef<PeanutHandle>(null!);
  const right = useRef<PeanutHandle>(null!);
  const crumbs = useRef<THREE.InstancedMesh>(null!);
  const word = useRef<THREE.Mesh>(null!);
  const product = useMemo(() => featuredProduct(site.featuredProductId), []);
  const n = qualityByTier[store.tier].crumbs;

  const crumbGeo = useMemo(() => createCrumbGeometry(3), []);
  const { material: crumbMat, uniforms: crumbU } = useMemo(() => createPeanutMaterial({ coat: product.coating, lowQuality: true }), [product]);
  const wordMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: wordTexture(copy.crunch.word), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    [],
  );
  // velocidades determinísticas dos fragmentos (sempre as mesmas => reversível)
  const frag = useMemo(() => {
    const r = mulberry32(77);
    const d = new Float32Array(n * 8);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, u = r() * 2 - 1, s = Math.sqrt(1 - u * u);
      const sp = 1.2 + Math.pow(r(), 2) * 5;
      d.set([Math.cos(a) * s * sp * 1.3, u * sp + 0.6, Math.sin(a) * s * sp * 0.8, (r() - 0.5) * 1.6, r() * 10, r() * 10, 0.3 + r() * 0.9, r()], i * 8);
    }
    return d;
  }, [n]);
  const st = useMemo(() => ({ lastP: 0, lastClick: 0, wobble: 0 }), []);

  useEffect(() => () => {
    crumbGeo.dispose();
    crumbMat.dispose();
    wordMat.map?.dispose();
    wordMat.dispose();
  }, [crumbGeo, crumbMat, wordMat]);

  useChapterFrame('crunch', group, ({ p, t, dt, camera }) => {
    // gatilho sonoro/impacto só ao cruzar o ponto de quebra para frente
    if (st.lastP < BREAK && p >= BREAK && !store.reduced) {
      audio.crunch(1);
      set('impact', 1);
    }
    st.lastP = p;

    // easter egg: clicar no grão antes de quebrar
    const c = store.click;
    if (c && c.t !== st.lastClick) {
      st.lastClick = c.t;
      if (Math.hypot(c.x, c.y * 0.6) < 0.35 && p < BREAK) {
        st.wobble = 1;
        audio.crunch(0.4);
      }
    }
    st.wobble = Math.max(0, st.wobble - dt * 2.5);

    setCamera(camera, { x: 0, y: 0.1, z: lerp(7.2, 6.2, easeInOut(range(p, 0, 0.45))) }, { x: 0, y: 0, z: 0 }, 30);

    const brk = easeOut(range(p, BREAK, 0.8));
    const tension = range(p, 0.34, BREAK) * (p < BREAK ? 1 : 0);
    const shake = (tension * 0.025 + st.wobble * 0.04) * Math.sin(t * 70);
    const w = whole.current;
    w.rotation.set(0.15 + shake, lerp(1.1, 0.12, easeInOut(range(p, 0, 0.42))) + t * 0.02, 0.08 + shake * 0.6);
    w.position.set(shake * 0.3, Math.sin(t * 0.8) * 0.04 * (1 - brk), 0);
    w.scale.setScalar(1.3);

    // as duas metades se afastam e giram para fora (face interna creme aparece)
    for (const [h, side] of [[left.current, -1], [right.current, 1]] as const) {
      h.group.position.set(side * brk * 0.95, -brk * 0.25 + brk * brk * -0.2, brk * 0.2);
      h.group.rotation.set(side * brk * 0.2, side * brk * 0.9, side * brk * 0.55);
      h.uniforms.uCoat.value = 1;
      h.uniforms.uGloss.value = 1;
      h.uniforms.uSparkle.value = 1;
    }

    // fragmentos: nascem no sulco, balística com arrasto (τ = tempo "de scroll")
    const tau = range(p, BREAK, 1) * 1.8;
    const mesh = crumbs.current;
    for (let i = 0; i < n; i++) {
      const k = i * 8;
      const drag = 1.6;
      const f = (1 - Math.exp(-drag * tau)) / drag;
      pv.set(frag[k] * f, frag[k + 1] * f - 0.55 * tau * tau, frag[k + 2] * f + 0.3);
      pv.y += frag[k + 3] * 0.35;
      eu.set(frag[k + 4] + tau * 4, frag[k + 5] + tau * 3, 0);
      q.setFromEuler(eu);
      const sc = tau > 0 ? frag[k + 6] * 0.07 * (1 - range(tau, 1.3, 1.8)) * Math.min(1, tau * 12) : 0;
      sv.set(sc, sc, sc);
      m4.compose(pv, q, sv);
      mesh.setMatrixAt(i, m4);
    }
    mesh.instanceMatrix.needsUpdate = true;
    crumbU.uCoat.value = 0.55;
    crumbU.uGloss.value = 1;

    // CRUNCH. atrás do grão
    const wIn = easeOut(range(p, BREAK - 0.02, BREAK + 0.1));
    const wOut = range(p, 0.86, 1);
    wordMat.opacity = wIn * (1 - wOut) * 0.95;
    word.current.scale.set(lerp(9, 11.5, easeOut(range(p, BREAK, 1))), lerp(9, 11.5, easeOut(range(p, BREAK, 1))) / 4, 1);

    setLights({
      key: ['#fff4ea', lerp(2.4, 3, brk), [3, 4, 4]],
      rim: ['#FF6A00', lerp(5, 8, brk), [-3, 2, -2.5]],
      fill: ['#a34a1f', 0.3],
      env: 0.85,
      background: '#000000',
      fog: 0,
      bloom: lerp(0.6, 0.9, wIn),
      focus: 6.2,
      bokeh: 0.8,
    });
  });

  return (
    <group ref={group} userData={{ chapter: 'crunch' }}>
      <mesh ref={word} position={[0, 0.1, -3.2]} material={wordMat}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={whole}>
        <Peanut ref={left} half={-1} coat={product.coating} seed={5} />
        <Peanut ref={right} half={1} coat={product.coating} seed={5} />
      </group>
      <instancedMesh ref={crumbs} args={[crumbGeo, crumbMat, n]} frustumCulled={false} />
    </group>
  );
}
