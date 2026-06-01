"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { setUniform } from "@/components/ShaderRuntime";

const ShaderRuntime = dynamic(
  () => import("@/components/ShaderRuntime").then((m) => m.ShaderRuntime),
  { ssr: false }
);

type ShaderItem = { path: string; size: number };

const DEFAULT_FRAG = `// Playground — edit me. Compiles on every keystroke after 600ms idle.
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
  float g = hash(gl_FragCoord.xy + u_time);
  col += (g - 0.5) * 0.06;
  outColor = vec4(col, 1.0);
}
`;

export default function PlaygroundPage() {
  const [shaders, setShaders] = useState<ShaderItem[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_FRAG);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/shaders")
      .then((r) => r.json())
      .then((d: ShaderItem[]) => setShaders(d));
  }, []);

  const load = async (p: string) => {
    setErr(null);
    const r = await fetch(
      `/api/shader?path=${encodeURIComponent(p)}`
    );
    if (!r.ok) {
      setErr(`Failed to load ${p}`);
      return;
    }
    const text = await r.text();
    setActive(p);
    setCode(text);
  };

  const reset = () => {
    setActive(null);
    setCode(DEFAULT_FRAG);
    setErr(null);
  };

  const filtered = shaders.filter((s) =>
    filter ? s.path.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <main className="page">
      <aside className="sidebar">
        <div className="side-head">
          <a href="/" className="back">← home</a>
          <h1>PLAYGROUND</h1>
        </div>
        <input
          className="search"
          placeholder="filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="lib">
          {filtered.map((s) => (
            <button
              key={s.path}
              className={`lib-item ${active === s.path ? "active" : ""}`}
              onClick={() => load(s.path)}
              title={s.path}
            >
              <span className="lib-path">{s.path}</span>
              <span className="lib-size">{s.size}B</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="empty">no matches</div>
          )}
        </div>
      </aside>

      <section className="editor-pane">
        <div className="editor-head">
          <span className="ed-label">
            {active ?? "default fragment"}
          </span>
          <div className="ed-actions">
            <button onClick={reset}>RESET</button>
            <button onClick={() => navigator.clipboard.writeText(code)}>
              COPY
            </button>
          </div>
        </div>
        <textarea
          className="editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
        />
        {err && (
          <div className="err">
            <strong>Shader error:</strong>
            <pre>{err}</pre>
          </div>
        )}
      </section>

      <section className="canvas-pane">
        <ShaderRuntime
          fragment={code}
          uniforms={[]}
          onError={(e) => setErr(e)}
        />
      </section>

      <style jsx>{`
        .page {
          display: grid;
          grid-template-columns: 280px 1fr 1fr;
          height: 100vh;
        }
        .sidebar {
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }
        .side-head {
          padding: 1.2rem;
          border-bottom: 1px solid var(--border);
        }
        .back {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
        }
        h1 {
          font-size: 1rem;
          margin-top: 0.5rem;
        }
        .search {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--ink);
          font-family: inherit;
          font-size: 0.8rem;
          padding: 0.5rem;
          margin: 0.75rem;
        }
        .search:focus {
          outline: 1px solid var(--accent);
        }
        .lib {
          flex: 1;
          overflow-y: auto;
          padding: 0 0.75rem 0.75rem;
        }
        .lib-item {
          width: 100%;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 2px;
          text-align: left;
          padding: 0.4rem 0.5rem;
          color: var(--ink);
          font-size: 0.72rem;
          cursor: pointer;
          margin-bottom: 0.15rem;
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          text-transform: none;
          letter-spacing: 0;
        }
        .lib-item:hover {
          background: var(--bg-elevated);
          border-color: var(--border);
        }
        .lib-item.active {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--accent-d);
          color: var(--accent-l);
        }
        .lib-path {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lib-size {
          color: var(--ink-dim);
          font-size: 0.65rem;
        }
        .empty {
          color: var(--ink-dim);
          font-size: 0.8rem;
          text-align: center;
          padding: 2rem 1rem;
        }
        .editor-pane {
          display: flex;
          flex-direction: column;
          background: var(--bg);
          border-right: 1px solid var(--border);
          min-width: 0;
        }
        .editor-head {
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        .ed-label {
          color: var(--accent);
          letter-spacing: 0.1em;
        }
        .ed-actions {
          display: flex;
          gap: 0.5rem;
        }
        .ed-actions button {
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
        }
        .editor {
          flex: 1;
          width: 100%;
          background: var(--bg);
          color: var(--ink);
          border: none;
          padding: 1rem;
          font-family: ui-monospace, "SF Mono", "Menlo", monospace;
          font-size: 0.8rem;
          line-height: 1.5;
          resize: none;
          outline: none;
          tab-size: 2;
        }
        .err {
          background: rgba(255, 93, 200, 0.1);
          border: 1px solid var(--magenta);
          padding: 0.75rem;
          margin: 0.75rem;
          font-size: 0.75rem;
        }
        .err pre {
          white-space: pre-wrap;
          color: var(--magenta);
          margin-top: 0.5rem;
          max-height: 120px;
          overflow: auto;
        }
        .canvas-pane {
          background: #000;
        }
        @media (max-width: 1100px) {
          .page {
            grid-template-columns: 240px 1fr 1fr;
          }
        }
        @media (max-width: 900px) {
          .page {
            grid-template-columns: 1fr;
            grid-template-rows: 200px 1fr 1fr;
          }
          .sidebar {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .editor-pane {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>
    </main>
  );
}
