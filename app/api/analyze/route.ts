import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchRepoData } from "@/lib/github";
import { AnalysisResult } from "@/types/analysis";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { url, githubToken } = await req.json();
    if (!url) return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 });

    // 1. Fetch repo data from GitHub
    const repoData = await fetchRepoData(url, githubToken);

    // 2. Build prompt
    const fileTreeSummary = repoData.tree
      .slice(0, 200)
      .map((f) => f.path)
      .join("\n");

    const keyFilesText = Object.entries(repoData.keyFiles)
      .map(([path, content]) => `--- ${path} ---\n${content}`)
      .join("\n\n");

    const prompt = `You are an expert software architect. Analyze this GitHub repository and return a JSON object.

## Repository Info
Name: ${repoData.info.fullName}
Description: ${repoData.info.description}
Language: ${repoData.info.language}
Stars: ${repoData.info.stars}
Topics: ${repoData.info.topics.join(", ")}

## README (first 8000 chars)
${repoData.readme}

## File Tree
${fileTreeSummary}

## Key Files Content
${keyFilesText}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "summary": "한국어로 이 프로젝트의 핵심을 5~8줄로 설명. README보다 더 솔직하고 실용적으로.",
  "purpose": "한국어로 이 프로젝트가 해결하는 핵심 문제 1~2줄",
  "architecture": "Mermaid graph TD diagram showing main modules/components and their relationships. Use English for node names. Example: graph TD\\n  A[API Server] --> B[Auth Module]\\n  A --> C[DB Layer]",
  "fileMap": [
    {"path": "src/main.py", "role": "한국어로 이 파일의 역할 설명", "importance": "high"}
  ],
  "techStack": [
    {"name": "FastAPI", "category": "framework"}
  ],
  "entryPoints": ["어디서부터 코드를 읽으면 좋은지 한국어로 1~3개"],
  "dataFlow": "한국어로 데이터가 어떻게 흐르는지 설명 (입력 → 처리 → 출력)",
  "useCases": ["한국어로 이 프로젝트를 어떤 상황에서 활용할 수 있는지 3~5개"]
}

Include 5-15 most important files in fileMap. Make architecture diagram meaningful with actual module names from the code.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Parse JSON (strip any accidental markdown fences)
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const analysis: AnalysisResult = JSON.parse(cleaned);

    return NextResponse.json({ repoInfo: repoData.info, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
