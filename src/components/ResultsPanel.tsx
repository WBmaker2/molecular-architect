import { useEffect, useRef } from 'react';
import type { Molecule } from '../domain/moleculeTypes';
import { classifyMoleculeDipole, evidenceFor, qualitativeLabel } from '../engine/dipoleQualitative';
import { isReviewedConfiguration, predictGeometry } from '../engine/vsepr';

interface Props {
  molecule: Molecule;
  sigma: number;
  lonePairs: number;
  applied: boolean;
  evidence: string[];
  onEvidence: (items: string[]) => void;
  onRecord: () => void;
  recorded: boolean;
}

const commonChoice = '고립 전자쌍은 원자 위치로 세지 않습니다.';

export function ResultsPanel({
  molecule, sigma, lonePairs, applied, evidence, onEvidence, onRecord, recorded,
}: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const result = predictGeometry(sigma, lonePairs);
  const reviewed = applied && isReviewedConfiguration(molecule, sigma, lonePairs);
  const computedDipole = classifyMoleculeDipole(molecule);
  const choices = molecule.netDipoleClass === 'zero'
    ? ['대칭인 반대 방향 벡터가 상쇄됩니다.', '결합 쌍극자의 방향 합을 봅니다.', commonChoice]
    : ['결합 쌍극자의 방향 합이 0이 되지 않습니다.', '굽은형·삼각뿔형 배치가 방향 성분을 남깁니다.', commonChoice];

  useEffect(() => {
    if (applied) titleRef.current?.focus();
  }, [applied]);

  const geometryText = applied ? result.molecularGeometry ?? '범위 밖' : '—';
  const overallText = reviewed ? qualitativeLabel(computedDipole) : applied ? '판정 보류' : '—';

  return (
    <section className="results-panel" data-od-id="results-evidence">
      <div className="section-kicker">03 / EVIDENCE</div>
      <div className="result-title">
        <div>
          <h2 ref={titleRef} tabIndex={-1}>구조를 읽어 보세요</h2>
          <p className="muted">실행한 모형의 결과와 근거를 분리해 기록합니다.</p>
        </div>
        <span className={`status-dot ${reviewed ? 'ready' : ''}`}>
          {reviewed ? '검수 결과 확인' : applied ? '판정 보류' : '대기 중'}
        </span>
      </div>
      <div className="result-table">
        <Row label="입체수" value={applied ? `${result.steric} · σ + 고립쌍` : '—'} />
        <Row label="전자영역 기하" value={applied ? result.electronGeometry ?? '범위 밖' : '—'} />
        <Row label="분자 기하" value={geometryText} />
        <Row label="결합 극성" value={applied ? molecule.bondPolarity : '—'} />
        <Row label="전체 극성" value={overallText} highlight={reviewed} />
      </div>
      {applied && (
        <div className={`feedback ${reviewed ? 'correct' : 'try-again'}`}>
          <b>{reviewed ? '검수된 설정과 일치합니다.' : '현재 설정에서는 극성 판정을 보류합니다.'}</b>
          <span>{reviewed ? evidenceFor(computedDipole, molecule.molecularGeometry) : '결합 전자영역과 고립 전자쌍을 검수 목록과 맞춘 뒤 다시 적용하세요.'}</span>
        </div>
      )}
      <div className="evidence-picker">
        <h3>근거 문장을 고르세요 <span>복수 선택</span></h3>
        {choices.map((choice) => (
          <label key={choice}>
            <input type="checkbox" checked={evidence.includes(choice)} onChange={(event) => onEvidence(event.target.checked ? [...evidence, choice] : evidence.filter((item) => item !== choice))} />
            {choice}
          </label>
        ))}
      </div>
      <button className="record-button" disabled={!reviewed || evidence.length < 2 || recorded} onClick={onRecord}>
        {recorded ? '이번 실행을 기록했습니다' : reviewed ? '근거와 함께 기록하기' : '검수된 설정에서 기록 가능'}
      </button>
      <p className="model-note">모형 범위: VSEPR 이상화 좌표 · 상대 길이 · 정량 쌍극자/전자밀도 아님</p>
    </section>
  );
}

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`result-row ${highlight ? 'highlight' : ''}`}><span>{label}</span><strong>{value}</strong></div>;
}
