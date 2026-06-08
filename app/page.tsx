"use client";

import { useState } from "react";
import AnalysisView from "@/components/AnalysisView";
import { AnalysisResult } from "@/types/analysis";
import { RepoInfo } from "@/lib/github";

export default function Home() {
  const [url, setUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ repoInfo: RepoInfo; analysis: AnalysisResult } | null>(null);

  const loadingMessages = [
    "GitHub에서 코드 구조 수집 중...",
    "파일 트리 분석 중...",
    "AI가 아키텍처 파악 중...",
    "다이어그램 생성 중...",
  ];
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 2500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, githubToken: githubToken || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-lg font-bold text-white">🔭 RepoLens</span>
          <span className="text-slate-500 text-sm hidden sm:block">AI 오픈소스 아키텍처 분석기</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {!result && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              코드 안 열어도<br />
              <span className="text-indigo-400">전체 구조가 보인다</span>
            </h1>
            <p className="text-slate-400 text-lg">
              GitHub URL 하나로 아키텍처 다이어그램, 파일 맵, 데이터 흐름 자동 생성
            </p>
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 mb-6">
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="https://github.com/owner/repo"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
            />
            <button
              onClick={analyze}
              disabled={loading || !url.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors whitespace-nowrap"
            >
              {loading ? "분석 중..." : "분석하기"}
            </button>
          </div>

          <div className="mt-3">
            <button
              onClick={() => setShowToken(!showToken)}
              className="text-slate-500 hover:text-slate-400 text-xs flex items-center gap-1 transition-colors"
            >
              <span>{showToken ? "▼" : "▶"}</span>
              GitHub 토큰 (선택, API rate limit 해결용)
            </button>
            {showToken && (
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-xs font-mono"
              />
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm animate-pulse">{loadingMsg}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <AnalysisView repoInfo={result.repoInfo} analysis={result.analysis} />
        )}

        {!result && !loading && (
          <div className="mt-6">
            <p className="text-slate-600 text-xs mb-2 text-center">예시 레포지토리</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "https://github.com/langchain-ai/langchain",
                "https://github.com/microsoft/autogen",
                "https://github.com/tiangolo/fastapi",
                "https://github.com/vercel/next.js",
              ].map((repo) => (
                <button
                  key={repo}
                  onClick={() => setUrl(repo)}
                  className="text-xs text-slate-500 hover:text-indigo-400 border border-slate-700 hover:border-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {repo.replace("https://github.com/", "")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
