import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Molecule, Vec3 } from '../domain/moleculeTypes';
import { bondDipoleVectors } from '../engine/dipoleQualitative';

type Preset = 'front' | 'side' | 'top';

interface Props {
  molecule: Molecule;
  showVectors: boolean;
  showGuide: boolean;
  preset: Preset;
  resultVisible: boolean;
  onPreset: (preset: Preset) => void;
}

const colors: Record<string, number> = {
  C: 0x334155, O: 0xf05b63, H: 0xe8eef2, B: 0x8b5cf6,
  F: 0x19a974, N: 0x3974d3, Si: 0xf59e0b, Cl: 0x14b8a6,
  P: 0xf08b4a, S: 0xf0b323, Xe: 0x8b5cf6, Be: 0x64748b,
};

export function MoleculeScene({ molecule, showVectors, showGuide, preset, resultVisible, onPreset }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const rotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const forceFallback = new URLSearchParams(window.location.search).has('force2d');
    if (forceFallback) { setFallback(true); return; }
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch { setFallback(true); return; }
    setFallback(false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8d5df, 2.2));
    if (resultVisible) {
      addAtomsAndBonds(root, molecule);
      if (showGuide) addGuide(root);
      if (showVectors) addDipoles(root, molecule);
    }
    if (preset === 'front') rotation.current = { x: 0, y: 0 };
    if (preset === 'side') rotation.current = { x: 0, y: Math.PI / 2 };
    if (preset === 'top') rotation.current = { x: -Math.PI / 2, y: 0 };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      camera.position.set(0, 0.35, 4.4);
      camera.lookAt(0, 0, 0);
      root.rotation.set(rotation.current.x, rotation.current.y, 0);
      renderer.render(scene, camera);
    };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      rotation.current.y += (event.clientX - lastX) * 0.01;
      rotation.current.x += (event.clientY - lastY) * 0.01;
      lastX = event.clientX;
      lastY = event.clientY;
      render();
    };
    const pointerUp = (event: PointerEvent) => {
      dragging = false;
      canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    render();
    window.addEventListener('resize', render);
    return () => {
      window.removeEventListener('resize', render);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      renderer.dispose();
      scene.traverse(disposeObject);
    };
  }, [molecule, showVectors, showGuide, preset, resultVisible]);

  return <div className="scene-shell" data-od-id="molecule-scene">
    <div className="scene-topline"><span>구-막대 교육 모형 · 드래그하여 회전</span><span>상대 길이 · 단위 없음</span></div>
    {fallback ? <Fallback molecule={molecule} showVectors={showVectors} resultVisible={resultVisible} /> : <canvas ref={canvasRef} aria-label={`${molecule.formula} 3D 분자 구조`} />}
    {!resultVisible && <div className="scene-lock"><b>구조는 적용 후 표시됩니다</b><span>예측 → 설정 → 구조 적용 순서로 진행하세요.</span></div>}
    <div className="dipole-legend"><b>결합 극성</b> <span>δ+ → δ−</span><i>물리학적 p 방향: − → + (별도 정의)</i></div>
    <div className="element-legend"><span>중심 원자: <b>{molecule.centralAtom}</b></span><span>주변 원자: <b>{molecule.atoms.join(' · ')}</b></span></div>
    <div className="scene-caption">장식 배경은 맥락용입니다. 분자 구조와 극성은 계산된 좌표와 표로 확인하세요.</div>
    <div className="preset-bar" role="group" aria-label="시점 프리셋">{(['front', 'side', 'top'] as Preset[]).map((item) => <button key={item} className={preset === item ? 'active' : ''} onClick={() => onPreset(item)}>{item === 'front' ? '정면' : item === 'side' ? '측면' : '위'}</button>)}</div>
  </div>;
}

function disposeObject(object: THREE.Object3D) {
  if (!(object instanceof THREE.Mesh)) return;
  object.geometry.dispose();
  if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
  else object.material.dispose();
}

function addAtomsAndBonds(group: THREE.Group, molecule: Molecule) {
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 20), new THREE.MeshStandardMaterial({ color: colors[molecule.centralAtom] ?? 0x334155, roughness: 0.35 }));
  group.add(center);
  molecule.idealCoordinates.forEach((coord, index) => {
    const atom = new THREE.Mesh(new THREE.SphereGeometry(0.26, 22, 16), new THREE.MeshStandardMaterial({ color: colors[molecule.atoms[index] ?? 'H'] ?? 0x94a3b8, roughness: 0.3 }));
    atom.position.set(...coord);
    group.add(atom);
    addBond(group, [0, 0, 0], coord);
  });
}

function addBond(group: THREE.Group, a: Vec3, b: Vec3) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, direction.length(), 12), new THREE.MeshStandardMaterial({ color: 0x91a7b0, roughness: 0.6 }));
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
}

function addDipoles(group: THREE.Group, molecule: Molecule) {
  const vectors = bondDipoleVectors(molecule.idealCoordinates, molecule.bondDipoleDirection);
  vectors.forEach((vector, index) => {
    const coordinate = new THREE.Vector3(...molecule.idealCoordinates[index]);
    const tail = molecule.bondDipoleDirection === 'center-to-outer' ? new THREE.Vector3(0, 0, 0) : coordinate;
    group.add(new THREE.ArrowHelper(new THREE.Vector3(...vector).normalize(), tail, 0.72, 0xe57651, 0.14, 0.08));
    addCross(group, tail);
  });
}

function addCross(group: THREE.Group, position: THREE.Vector3) {
  const points = [new THREE.Vector3(position.x - 0.07, position.y - 0.07, position.z), new THREE.Vector3(position.x + 0.07, position.y + 0.07, position.z), new THREE.Vector3(position.x + 0.07, position.y - 0.07, position.z), new THREE.Vector3(position.x - 0.07, position.y + 0.07, position.z)];
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0xe57651 })));
}

function addGuide(group: THREE.Group) {
  const guide = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), new THREE.MeshBasicMaterial({ color: 0x61c7d8, transparent: true, opacity: 0.08, side: THREE.DoubleSide }));
  guide.rotation.x = Math.PI / 2;
  group.add(guide);
}

function Fallback({ molecule, showVectors, resultVisible }: { molecule: Molecule; showVectors: boolean; resultVisible: boolean }) {
  if (!resultVisible) return <div className="fallback-2d fallback-locked" aria-label="구조 적용 대기 화면"><span>2D 구조는 검수된 설정을 적용하면 표시됩니다.</span></div>;
  const scale = 78;
  const centerX = 200;
  const centerY = 130;
  const isCenterToOuter = molecule.bondDipoleDirection === 'center-to-outer';
  return <div className="fallback-2d" aria-label="2D 분자 구조 대체 화면"><svg viewBox="0 0 400 250" role="img"><defs><marker id="dipole-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#e57651" /></marker></defs>{molecule.idealCoordinates.map(([x, y, z], index) => { const x2 = centerX + x * scale; const y2 = centerY - (y + z * 0.35) * scale; const tailX = isCenterToOuter ? centerX : x2; const tailY = isCenterToOuter ? centerY : y2; const headX = isCenterToOuter ? x2 : centerX; const headY = isCenterToOuter ? y2 : centerY; return <g key={`${molecule.id}-${index}`}><line className="fallback-bond" x1={centerX} y1={centerY} x2={x2} y2={y2} />{showVectors && <><line className="fallback-vector" x1={tailX} y1={tailY} x2={headX} y2={headY} markerEnd="url(#dipole-arrow)" /><path className="fallback-cross" d={`M${tailX - 5},${tailY - 5} l10,10 M${tailX + 5},${tailY - 5} l-10,10`} /><text className="fallback-charge" x={tailX + (tailX === centerX ? 12 : -15)} y={tailY - 9}>δ+</text><text className="fallback-charge" x={headX + (headX === centerX ? 12 : -15)} y={headY + 17}>δ−</text></>}</g>; })}<circle className="center-node" cx={centerX} cy={centerY} r="27" /><text className="center-label" x={centerX} y={centerY + 6} textAnchor="middle">{molecule.centralAtom}</text>{molecule.idealCoordinates.map(([x, y, z], index) => { const x2 = centerX + x * scale; const y2 = centerY - (y + z * 0.35) * scale; return <g key={`atom-${molecule.id}-${index}`}><circle className="outer-node" cx={x2} cy={y2} r="21" /><text className="atom-label" x={x2} y={y2 + 5} textAnchor="middle">{molecule.atoms[index]}</text></g>; })}</svg><span>WebGL을 사용할 수 없어 모든 결합을 2D 좌표로 표시합니다.</span></div>;
}
