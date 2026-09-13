import { useEffect, useRef } from 'react';

interface Props { open: boolean; onClose: () => void; }

export function UpdateLog({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="updates-title" onClick={onClose}>
    <div className="update-modal" onClick={(event) => event.stopPropagation()}>
      <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="닫기">×</button>
      <span className="eyebrow">CHANGELOG</span>
      <h2 id="updates-title">업데이트 내역</h2>
      <div className="changelog-entry"><b>2026-09-13 · 개발 기록</b><p>12분자 VSEPR 카탈로그, 질적 쌍극자 엔진, Three.js/2D 구조 관찰, 근거 기록 흐름을 추가했습니다.</p></div>
      <div className="changelog-entry"><b>2026-09-13 · 개선 기록</b><p>분자별 δ+ → δ− 방향, 검수 설정만의 극성 판정, 2D 전체 원자 표시, 드래그 회전과 목록 밖 경계 안내를 보완했습니다.</p></div>
      <div className="changelog-entry"><b>2026-09-14 · 성능/QA 개선</b><p>Three.js 장면 지연 로딩, WebP 장식 자산, 12분자 전수 엔진 표 테스트와 강제 2D fallback 경로를 추가했습니다.</p></div>
      <div className="changelog-entry"><b>2026-09-14 · 공개 QA 시각 보완</b><p>공개 첫 화면에서 분자 설계 스튜디오 장식 이미지가 선명하게 보이도록 반투명 레이어와 캡션 대비를 조정했습니다.</p></div>
      <div className="changelog-entry"><b>다음 검토</b><p>교과 검토 후 실제 결합각·문헌 대조 상태를 확정합니다.</p></div>
    </div>
  </div>;
}
