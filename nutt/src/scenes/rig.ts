import * as THREE from 'three';
import { store } from '@/utils/store';

/**
 * Alvos de iluminação/ambiente. O capítulo dono da câmera escreve aqui a cada frame; o
 * LightRig amortece as luzes reais até eles. Número de luzes nunca muda => sem recompilar
 * shaders na troca de cena.
 */
export const lightTarget = {
  key: { color: new THREE.Color('#fff1e0'), intensity: 2, position: new THREE.Vector3(3, 4, 5) },
  rim: { color: new THREE.Color('#FF6A00'), intensity: 6, position: new THREE.Vector3(-4, 2, -3) },
  fill: { color: new THREE.Color('#a34a1f'), intensity: 0.4 },
  env: 0.6,
  background: new THREE.Color('#000000'),
  fog: 0.0,
  bloom: 0.55,
  focus: 5,
  bokeh: 0,
};

type LightSpec = {
  key?: [string, number, [number, number, number]];
  rim?: [string, number, [number, number, number]];
  fill?: [string, number];
  env?: number;
  background?: string | THREE.Color;
  fog?: number;
  bloom?: number;
  focus?: number;
  bokeh?: number;
};

export function setLights(s: LightSpec) {
  if (s.key) {
    lightTarget.key.color.set(s.key[0]);
    lightTarget.key.intensity = s.key[1];
    lightTarget.key.position.set(...s.key[2]);
  }
  if (s.rim) {
    lightTarget.rim.color.set(s.rim[0]);
    lightTarget.rim.intensity = s.rim[1];
    lightTarget.rim.position.set(...s.rim[2]);
  }
  if (s.fill) {
    lightTarget.fill.color.set(s.fill[0]);
    lightTarget.fill.intensity = s.fill[1];
  }
  if (s.env !== undefined) lightTarget.env = s.env;
  if (s.background !== undefined) lightTarget.background.set(s.background);
  if (s.fog !== undefined) lightTarget.fog = s.fog;
  if (s.bloom !== undefined) lightTarget.bloom = s.bloom;
  if (s.focus !== undefined) lightTarget.focus = s.focus;
  if (s.bokeh !== undefined) lightTarget.bokeh = s.bokeh;
}

const tmpM = new THREE.Matrix4();
const up = new THREE.Vector3(0, 1, 0);

/** Posiciona a câmera (pose absoluta; o CameraRig aplica paralaxe/impacto depois). */
export function setCamera(cam: THREE.Camera, pos: THREE.Vector3Like, target: THREE.Vector3Like, fov?: number, roll = 0) {
  cam.position.set(pos.x, pos.y, pos.z);
  tmpM.lookAt(cam.position, new THREE.Vector3(target.x, target.y, target.z), up);
  cam.quaternion.setFromRotationMatrix(tmpM);
  if (roll) cam.rotateZ(roll);
  // paralaxe sutil pelo cursor + tremor de impacto (crunch)
  if (!store.reduced) {
    const p = store.pointer;
    const par = store.detail !== null ? 0.012 : 0.035;
    cam.translateX(p.sx * par * 3);
    cam.translateY(p.sy * par * 2);
    cam.rotateY(-p.sx * par * 0.25);
    cam.rotateX(p.sy * par * 0.18);
    if (store.impact > 0.001) {
      const a = store.impact * 0.06;
      cam.translateX((Math.random() - 0.5) * a);
      cam.translateY((Math.random() - 0.5) * a);
    }
  }
  const pc = cam as THREE.PerspectiveCamera;
  if (fov && pc.isPerspectiveCamera) {
    // em telas retrato, abre o FOV vertical para manter o enquadramento horizontal da cena
    if (pc.aspect < 1) fov = (2 * Math.atan(Math.tan((fov * Math.PI) / 360) / Math.max(pc.aspect, 0.4) * 0.72) * 180) / Math.PI;
    if (Math.abs(pc.fov - fov) < 0.01) return;
    pc.fov = fov;
    pc.updateProjectionMatrix();
  }
}

/** Raio do ponteiro (coords normalizadas) — as cenas fazem o próprio picking. */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
export function pointerRay(cam: THREE.Camera, x: number, y: number) {
  ndc.set(x, y);
  raycaster.setFromCamera(ndc, cam);
  return raycaster.ray;
}
