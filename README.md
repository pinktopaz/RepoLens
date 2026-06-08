# 🔭 RepoLens

GitHub 레포지토리 URL 하나로 전체 아키텍처를 한눈에 파악하는 AI 분석 도구

## 주요 기능

- **아키텍처 다이어그램** — 모듈 간 관계를 Mermaid 다이어그램으로 자동 생성
- **파일 맵** — 주요 파일/폴더가 무슨 역할인지 한국어로 설명
- **데이터 흐름** — 입력 → 처리 → 출력 흐름 요약
- **진입점 추천** — 어디서부터 코드를 읽으면 좋은지 안내
- **활용 시나리오** — 이 프로젝트를 어떤 상황에서 쓸 수 있는지

## 시작하기

### 1. 환경변수 설정
```bash
cp .env.example .env.local
# .env.local에 ANTHROPIC_API_KEY 입력
```

### 2. 의존성 설치 및 실행
```bash
npm install
npm run dev
```

### 3. 배포 (Vercel)
```bash
# Vercel에 ANTHROPIC_API_KEY 환경변수 추가 후
vercel deploy
```

## 기술 스택

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Anthropic Claude API** (claude-sonnet)
- **GitHub REST API**
- **Mermaid.js** (다이어그램 렌더링)

## GitHub Token (선택)

GitHub API는 인증 없이 시간당 60회 요청 제한이 있습니다.
토큰을 발급하면 시간당 5,000회로 늘어납니다.

Settings → Developer settings → Personal access tokens → Fine-grained tokens
→ Public repositories (read-only) 권한만 있으면 됩니다.
