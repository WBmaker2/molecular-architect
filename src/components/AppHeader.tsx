interface Props { stage: number; onUpdates: () => void; }
const stages = ['예측', '설정', '적용', '관찰', '근거', '기록'];

export function AppHeader({ stage, onUpdates }: Props) {
  return <header className="app-header" data-od-id="header">
    <div className="brand-block"><span className="eyebrow">CHEMISTRY / STUDIO 01</span><h1>분자의 건축가</h1></div>
    <div className="stage-rail" aria-label="탐구 단계">
      {stages.map((label, i) => <span key={label} className={i <= stage ? 'stage active' : 'stage'}><b>{String(i + 1).padStart(2, '0')}</b>{label}</span>)}
    </div>
    <div className="header-actions"><span className="model-badge">VSEPR 이상화</span><button className="update-button" onClick={onUpdates}>업데이트 내역</button></div>
  </header>;
}
