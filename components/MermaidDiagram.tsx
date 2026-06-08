"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
}

export default function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref.current || !chart) return;

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#6366f1",
            primaryTextColor: "#f1f5f9",
            primaryBorderColor: "#818cf8",
            lineColor: "#94a3b8",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            background: "#0f172a",
            mainBkg: "#1e293b",
            nodeBorder: "#6366f1",
          },
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        setError(true);
      }
    };

    render();
  }, [chart]);

  if (error) {
    return (
      <div className="text-slate-400 text-sm p-4 bg-slate-800 rounded-lg">
        다이어그램을 렌더링할 수 없습니다.
        <pre className="mt-2 text-xs text-slate-500 whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto flex justify-center [&>svg]:max-w-full"
    />
  );
}
