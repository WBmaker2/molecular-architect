import type { Molecule } from '../domain/moleculeTypes';

interface Props {
  molecule: Molecule;
  sigma: number;
  lonePairs: number;
  onSigma: (value: number) => void;
  onLonePairs: (value: number) => void;
  showVectors: boolean;
  setShowVectors: (value: boolean) => void;
  showGuide: boolean;
  setShowGuide: (value: boolean) => void;
  onApply: () => void;
  applied: boolean;
  canApply: boolean;
}

export function BuilderControls({
  molecule, sigma, lonePairs, onSigma, onLonePairs, showVectors,
  setShowVectors, showGuide, setShowGuide, onApply, applied, canApply,
}: Props) {
  return <section className="builder-panel" data-od-id="builder-controls">
    <div className="section-kicker">02 / BUILD</div>
    <h2>전자영역을 설정하세요</h2>
    <p className="muted">중심 원자 <b>{molecule.centralAtom}</b> 주위의 방향을 세어 보세요. 고립 전자쌍은 원자 위치로 세지 않습니다.</p>
    <div className="steppers">
      <Stepper label="결합 전자영역" value={sigma} min={2} max={6} onChange={onSigma} hint="σ domains" />
      <Stepper label="고립 전자쌍" value={lonePairs} min={0} max={3} onChange={onLonePairs} hint="lone pairs" />
    </div>
    <div className="toggle-list">
      <label><input type="checkbox" checked={showVectors} onChange={(event) => setShowVectors(event.target.checked)} /> <span>결합 쌍극자 보기</span></label>
      <label><input type="checkbox" checked={showGuide} onChange={(event) => setShowGuide(event.target.checked)} /> <span>대칭 가이드 보기</span></label>
    </div>
    <button className={`primary-action ${!applied && canApply ? 'gi-pulse' : ''}`} onClick={onApply} disabled={!canApply}>
      {applied ? '구조 다시 적용' : canApply ? '구조 적용' : '예측을 먼저 선택하세요'} <span>→</span>
    </button>
  </section>;
}

function Stepper({ label, value, min, max, onChange, hint }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; hint: string }) {
  return <div className="stepper">
    <div><b>{label}</b><small>{hint}</small></div>
    <div className="stepper-actions"><button aria-label={`${label} 줄이기`} onClick={() => onChange(Math.max(min, value - 1))}>−</button><output>{value}</output><button aria-label={`${label} 늘리기`} onClick={() => onChange(Math.min(max, value + 1))}>+</button></div>
  </div>;
}
