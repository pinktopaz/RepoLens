"use client";

import dynamic from "next/dynamic";
import { AnalysisResult } from "@/types/analysis";
import { RepoInfo } from "@/lib/github";

const MermaidDiagram = dynamic(() => import("./MermaidDiagram"), { ssr: false });

interface Props {
  repoInfo: RepoInfo;
  analysis: AnalysisResult;
}

const importanceBadge = {
  high: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  medium: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  low: "bg-slate-700/20 text-slate-500 border border-slate-700/30",
};

const importanceLabel = { high: "핵심", medium: "보통", low: "참고" };

export default function AnalysisView({ repoInfo, analysis }: Props) {
  return (
    <div className="space-y-6">
      {/* Repo Header */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">{repoInfo.fullName}</h2>
            <p className="text-slate-400 mt-1 text-sm">{repoInfo.description}</p>
          </div>
          <div className="flex gap-3 text-sm text-slate-400">
            <span>⭐ {repoInfo.stars.toLocaleString()}</span>
            <span>🍴 {repoInfo.forks.toLocaleString()}</span>
            <span>🐛 {repoInfo.openIssues}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {repoInfo.language && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {repoInfo.language}
            </span>
          )}
          {repoInfo.topics.slice(0, 6).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Summary + Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="📋 한줄 핵심 요약" accent>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis.purpose}</p>
        </Section>
        <Section title="🎯 상세 요약">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {analysis.summary}
          </p>
        </Section>
      </div>

      {/* Architecture Diagram */}
      <Section title="🏗️ 아키텍처 다이어그램">
        <MermaidDiagram chart={analysis.architecture} />
      </Section>

      {/* Data Flow */}
      <Section title="🔄 데이터 흐름">
        <p className="text-slate-300 text-sm leading-relaxed">{analysis.dataFlow}</p>
      </Section>

      {/* Entry Points */}
      <Section title="🚪 여기서부터 읽으세요">
        <ol className="space-y-2">
          {analysis.entryPoints.map((ep, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {ep}
            </li>
          ))}
        </ol>
      </Section>

      {/* File Map */}
      <Section title="📁 주요 파일 맵">
        <div className="space-y-2">
          {analysis.fileMap.map((f) => (
            <div key={f.path} className="flex items-start gap-3">
              <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${importanceBadge[f.importance]}`}>
                {importanceLabel[f.importance]}
              </span>
              <div>
                <code className="text-indigo-300 text-xs">{f.path}</code>
                <p className="text-slate-400 text-xs mt-0.5">{f.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tech Stack */}
      <Section title="🛠️ 기술 스택">
        <div className="flex flex-wrap gap-2">
          {analysis.techStack.map((t) => (
            <div key={t.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
              <span className="text-white text-sm font-medium">{t.name}</span>
              <span className="text-slate-500 text-xs">{t.category}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Use Cases */}
      <Section title="💡 활용 시나리오">
        <ul className="space-y-2">
          {analysis.useCases.map((uc, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-indigo-400 mt-0.5">•</span>
              {uc}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        accent
          ? "bg-indigo-950/30 border-indigo-800/40"
          : "bg-slate-800/50 border-slate-700"
      }`}
    >
      <h3 className="text-sm font-semibold text-slate-200 mb-3">{title}</h3>
      {children}
    </div>
  );
}
