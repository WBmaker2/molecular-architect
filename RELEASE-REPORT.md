# 분자의 건축가 · GitHub Pages 릴리스 보고

작성일: 2026-09-14

## 릴리스 식별자

- 저장소: [WBmaker2/molecular-architect](https://github.com/WBmaker2/molecular-architect)
- 공개 앱: [https://wbmaker2.github.io/molecular-architect/](https://wbmaker2.github.io/molecular-architect/)
- 릴리스 커밋: `9f5c989`
- Pages Actions run: [34787911881](https://github.com/WBmaker2/molecular-architect/actions/runs/34787911881)
- Pages 방식: GitHub Actions workflow

## 구현·자동 검증

- `npm test`: 2개 테스트 파일, 11개 테스트 통과
- `npm run build:pages`: TypeScript/Vite 성공
- Pages base: `/molecular-architect/`
- 초기 JS: 약 779KB → 241.45KB
- Three.js 지연 청크: 약 539.75KB
- 장식 자산: PNG 약 1.3MB → WebP 44,780 bytes
- WebP 원격 응답: HTTP 200, `Content-Type: image/webp`

## 공개 브라우저 QA

ego-browser에서 확인했습니다.

- 12개 카드 전체 순회: 선택 상태·분자 제목·중심/주변 원소 범례·canvas 유지 및 갱신
- CO₂: 선형·전체 비극성 결과
- H₂O: 굽은형·전체 극성 결과
- 잘못된 설정 재적용: `판정 보류`, 구조 잠금, 기록 버튼 비활성
- 목록 밖 `C2H5OH`: 실행 중단·MVP 목록 밖·교사 검수 필요
- 업데이트 모달: 열릴 때 닫기 버튼 초점, Escape 닫기
- `prefers-reduced-motion`: gi-pulse 애니메이션 제거
- 1280/360/320px: `scrollWidth === clientWidth`
- `?force2d=1` + SF₆: fallback에서 주변 원자 6개, 결합선 6개, 기호·벡터 표시
- 공개 카드 순회 중 `window` error/unhandled rejection: 0건
- 공개 첫 화면 screenshot: `.intro-art`의 WebP 이미지가 반투명 레이어 아래 명확히 보이고 캡션 대비 유지

## 미검증 범위

교과 전문가의 최종 문헌 대조, 실제 교실 수용성, VoiceOver, 정량 쌍극자·전자밀도 계산은 이 릴리스 범위에서 검증하지 않았습니다. HVC 관리자 등록과 static gallery sync도 수행하지 않았습니다.
