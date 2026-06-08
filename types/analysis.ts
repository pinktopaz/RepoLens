export interface AnalysisResult {
  summary: string;           // 10줄 이내 핵심 요약
  purpose: string;           // 이 프로젝트가 해결하는 문제
  architecture: string;      // Mermaid diagram (graph TD)
  fileMap: FileDescription[]; // 주요 파일/폴더 설명
  techStack: TechItem[];     // 기술 스택
  entryPoints: string[];     // 어디서부터 읽으면 되는지
  dataFlow: string;          // 데이터 흐름 설명
  useCases: string[];        // 어떤 상황에서 쓸 수 있는지
}

export interface FileDescription {
  path: string;
  role: string;
  importance: "high" | "medium" | "low";
}

export interface TechItem {
  name: string;
  category: string; // "framework" | "language" | "database" | "infra" | etc
}
