<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# RepoLens — AI 에이전트 가이드

## 실행 방법
```bash
npm run dev   # 개발 서버 (port 3000)
```

필수 환경 변수 (`.env.local`에 설정):
```
ANTHROPIC_API_KEY=...   # Claude API 호출용
GITHUB_TOKEN=...        # GitHub API rate limit 회피용 (없어도 동작하지만 금방 막힘)
```
<!-- 이유: AI가 실행 명령이나 env 이름을 모르면 잘못된 명령을 추측해서 쓰거나 매번 물어봄. 여기 명시해두면 곧바로 맞게 씀. -->

---

## 이 프로젝트에서 조심할 프레임워크들

### Tailwind CSS v4
<!-- 이유: v4는 v3과 거의 다른 프레임워크 수준의 변화가 있음. AI는 v3 기준으로 훈련되어서 v3 방식으로 코드를 쓰면 스타일이 아예 안 먹힘. -->

- `tailwind.config.js` **없음** — 설정은 `globals.css` 안에서 `@theme` 블록으로 함
- `postcss.config.mjs`에서 `@tailwindcss/postcss` 플러그인 사용 (기존 `tailwindcss` 플러그인 아님)
- CSS import 방식: `@import "tailwindcss"` (기존 `@tailwind base/components/utilities` 아님)
- 커스텀 색상 추가할 때: `globals.css`에 `@theme { --color-brand: #... }` 형태로 씀
- **코드 작성 전에 `node_modules/next/dist/docs/` 안의 CSS 관련 가이드 먼저 확인**

### React 19
<!-- 이유: React 19는 훈련 데이터에 없거나 부족한 버전. 특히 `use()` hook, ref 전달 방식, Server Actions 시그니처가 바뀌어서 v18 방식으로 쓰면 타입 에러 또는 런타임 에러 남. -->

- `ref`를 prop으로 직접 전달 가능 — `forwardRef` 불필요
- `use(promise)` hook으로 컴포넌트 안에서 비동기 값 읽기 가능
- Server Actions: `'use server'` 지시어는 파일 최상단 또는 함수 내부 첫 줄에 씀

### Next.js 16 (App Router)
<!-- 이유: Next.js 16은 App Router가 또 변경됨. 특히 클라이언트 네비게이션 속도와 캐싱 관련 API가 새로 생겼는데, 모르고 예전 방식 쓰면 느리거나 동작이 이상해짐. -->

- 빠른 페이지 이동이 필요하면 `unstable_instant`를 route에서 export해야 함 — Suspense 단독으로는 부족함. 자세한 내용은 `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` 참조
- App Router 전용 — `pages/` 디렉토리 없음, `app/` 디렉토리만 사용

---

## AI 분석 응답 스키마
<!-- 이유: `app/api/analyze/route.ts`가 Claude에게 특정 JSON 구조를 요구하고, 그걸 `types/analysis.ts`의 타입으로 파싱함. API route나 타입 파일 수정 시 이 스키마를 유지해야 함. 무너지면 프론트엔드 렌더링 전체가 깨짐. -->

`types/analysis.ts`의 `AnalysisResult` 구조:

| 필드 | 타입 | 설명 |
|------|------|------|
| `summary` | `string` | 10줄 이내 핵심 요약 |
| `purpose` | `string` | 이 프로젝트가 해결하는 문제 |
| `architecture` | `string` | Mermaid `graph TD` 다이어그램 문자열 |
| `fileMap` | `FileDescription[]` | 주요 파일/폴더 설명 목록 |
| `techStack` | `TechItem[]` | 기술 스택 목록 |
| `entryPoints` | `string[]` | 어디서부터 읽으면 되는지 |
| `dataFlow` | `string` | 데이터 흐름 설명 |
| `useCases` | `string[]` | 활용 시나리오 목록 |

`architecture` 필드는 반드시 Mermaid `graph TD` 형식이어야 함 — `MermaidDiagram.tsx`가 이 문자열을 그대로 렌더링함.
