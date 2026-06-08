@AGENTS.md

## 코드 규칙

### 파일/구조
- API route는 `app/api/` 아래에만 만들 것
- 공용 컴포넌트는 `components/`에 둘 것
- 파일명은 kebab-case (`analysis-view.tsx`, `github-utils.ts`)

### TypeScript
- `any` 타입 사용 금지 — 모르면 `unknown` 쓰고 타입 좁히기
- 함수는 arrow function으로 (`const fn = () => {}`)

### 주석
- 주석은 상세하게 달 것 — 코드만 봐서는 알기 어려운 이유, 맥락, 주의사항을 설명

### 기타
- `console.log` 디버그 코드는 커밋하지 말 것
