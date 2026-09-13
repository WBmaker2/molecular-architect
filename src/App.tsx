import { lazy, Suspense, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { AppHeader } from './components/AppHeader';
import { BuilderControls } from './components/BuilderControls';
import { MoleculeCardGrid } from './components/MoleculeCardGrid';
import { ResultsPanel } from './components/ResultsPanel';
import { RunHistory } from './components/RunHistory';
import { UpdateLog } from './components/UpdateLog';
import { moleculeById, moleculeCatalog } from './scenarios/moleculeCatalog';
import type { DipoleClass, RunRecord } from './domain/moleculeTypes';
import { isReviewedConfiguration } from './engine/vsepr';
import { classifyMoleculeDipole } from './engine/dipoleQualitative';

const MoleculeScene = lazy(() => import('./renderers/MoleculeScene').then((module) => ({ default: module.MoleculeScene })));
const studioBackground = `${import.meta.env.BASE_URL}assets/molecular-studio-bg.webp`;

export default function App() {
  const [selectedId, setSelectedId] = useState('M01');
  const molecule = useMemo(() => moleculeById(selectedId), [selectedId]);
  const [sigma, setSigma] = useState(molecule.sigmaDomains);
  const [lonePairs, setLonePairs] = useState(molecule.lonePairs);
  const [prediction, setPrediction] = useState<DipoleClass | null>(null);
  const [applied, setApplied] = useState(false);
  const [showVectors, setShowVectors] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [preset, setPreset] = useState<'front' | 'side' | 'top'>('front');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [recorded, setRecorded] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [outsideFormula, setOutsideFormula] = useState('');

  const stage = recorded ? 5 : evidence.length > 0 ? 4 : applied ? 3 : prediction ? 1 : 0;

  const chooseMolecule = (id: string) => {
    const next = moleculeById(id);
    setSelectedId(id);
    setSigma(next.sigmaDomains);
    setLonePairs(next.lonePairs);
    setApplied(false);
    setEvidence([]);
    setRecorded(false);
    setPrediction(null);
    setPreset('front');
  };

  const changeSigma = (value: number) => {
    setSigma(value);
    setApplied(false);
    setRecorded(false);
    setEvidence([]);
  };

  const changeLonePairs = (value: number) => {
    setLonePairs(value);
    setApplied(false);
    setRecorded(false);
    setEvidence([]);
  };

  const apply = () => setApplied(true);

  const record = () => {
    if (!prediction || !isReviewedConfiguration(molecule, sigma, lonePairs)) return;
    setRecords((items) => [...items, {
      moleculeId: molecule.id,
      prediction,
      result: classifyMoleculeDipole(molecule),
      geometry: molecule.molecularGeometry,
      evidence,
      timestamp: new Date().toISOString(),
    }]);
    setRecorded(true);
  };

  return <div className="app-shell">
    <AppHeader stage={stage} onUpdates={() => setUpdatesOpen(true)} />
    <main>
      <section className="intro" data-od-id="intro">
        <div className="intro-copy">
          <span className="eyebrow">INQUIRY WORKBENCH / HIGH SCHOOL CHEMISTRY</span>
          <h2>모양을 세우고,<br /><em>대칭으로</em> 읽습니다.</h2>
          <p>극성 결합이 있어도 분자 전체가 비극성일 수 있습니다. 12개의 이상화 모형을 직접 조립하며 방향의 합을 관찰하세요.</p>
          <div className="intro-meta"><span>권장 학년 · 고등학교 화학</span><span>50분 · 1차시</span></div>
        </div>
        <div className="intro-art" style={{ '--studio-bg': `url("${studioBackground}")` } as CSSProperties} role="img" aria-label="밝은 분자 설계 스튜디오 장식 이미지"><div className="art-glow" /><div className="art-caption">STUDIO NOTE 01<br />이미지는 맥락 장식 · 증거 아님</div></div>
      </section>

      <section className="prediction-strip" data-od-id="prediction">
        <div><span className="section-kicker">START HERE / PREDICT</span><h2>먼저 예측해 보세요</h2><p>현재 분자 전체의 쌍극자는 0일까요?</p></div>
        <div className="prediction-choice">
          {(['zero', 'nonzero'] as DipoleClass[]).map((value) => <button key={value} className={prediction === value ? 'selected' : ''} onClick={() => setPrediction(value)}>{value === 'zero' ? '전체 비극성' : '전체 극성'}<small>{value === 'zero' ? '방향 합이 상쇄됨' : '방향 합이 남음'}</small></button>)}
        </div>
      </section>

      <MoleculeCardGrid molecules={moleculeCatalog} selectedId={selectedId} onSelect={chooseMolecule} />
      <OutsideCatalogTask value={outsideFormula} onChange={setOutsideFormula} />
      <section className="workbench" data-od-id="workbench">
        <div className="workbench-heading"><div><span className="section-kicker">SELECTED MOLECULE</span><h2>{molecule.name} <span>{molecule.formula}</span></h2></div><div className="condition-note">{molecule.condition ?? 'VSEPR 이상화 모형'}<br /><small>{molecule.reviewStatus} · 출처 {molecule.sourceIds.join(' / ')}</small></div></div>
        <div className="workspace-grid">
          <Suspense fallback={<div className="scene-loading">분자 장면을 준비하는 중입니다…</div>}><MoleculeScene molecule={molecule} showVectors={showVectors} showGuide={showGuide} preset={preset} resultVisible={applied && isReviewedConfiguration(molecule, sigma, lonePairs)} onPreset={setPreset} /></Suspense>
          <BuilderControls molecule={molecule} sigma={sigma} lonePairs={lonePairs} onSigma={changeSigma} onLonePairs={changeLonePairs} showVectors={showVectors} setShowVectors={setShowVectors} showGuide={showGuide} setShowGuide={setShowGuide} onApply={apply} applied={applied} canApply={Boolean(prediction)} />
        </div>
      </section>

      <div className="lower-grid"><ResultsPanel molecule={molecule} sigma={sigma} lonePairs={lonePairs} applied={applied} evidence={evidence} onEvidence={setEvidence} onRecord={record} recorded={recorded} /><RunHistory records={records} molecules={moleculeCatalog} /></div>
    </main>
    <footer><span>분자의 건축가 · 세션 메모리 모드</span><span>실제 전자밀도·정량 쌍극자 계산이 아닌 VSEPR 학습 모형입니다.</span></footer>
    <UpdateLog open={updatesOpen} onClose={() => setUpdatesOpen(false)} />
  </div>;
}

function normalizeFormula(value: string) {
  return value.trim().replace(/[₀-₉]/g, (digit) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(digit))).replace(/\s+/g, '');
}

function OutsideCatalogTask({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const known = moleculeCatalog.some((molecule) => normalizeFormula(molecule.formula) === normalizeFormula(value));
  return <section className="outside-task" data-od-id="outside-catalog"><div><span className="section-kicker">OPTIONAL / BOUNDARY CHECK</span><h3>목록 밖 질문</h3><p>새 화학식은 실행하지 않고 모델의 경계를 확인합니다.</p></div><div className="outside-input"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="예: C₂H₅OH" aria-label="목록 밖 화학식" />{value.trim() && <div className={known ? 'outside-status known' : 'outside-status'}>{known ? '검수 목록에서 카드를 선택하세요.' : '실행 중단 · MVP 목록 밖 · 교사 검수 필요'}</div>}</div></section>;
}
