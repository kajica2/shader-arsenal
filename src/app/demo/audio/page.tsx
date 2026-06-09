"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DEMO_PRESETS } from "./presets";

const ShaderRuntime = dynamic(
  () => import("@/components/ShaderRuntime").then((m) => m.ShaderRuntime),
  { ssr: false }
);

const UNIFORMS = [
  { name: "u_speed", type: "float" as const, value: 1.0, min: 0, max: 4, step: 0.05 },
  { name: "u_zoom", type: "float" as const, value: 2.5, min: 0.5, max: 8, step: 0.1 },
  { name: "u_contrast", type: "float" as const, value: 1.1, min: 0.2, max: 2.5, step: 0.05 },
];

export default function AudioDemoPage() {
  const [err, setErr] = useState<string | null>(null);
  const [uniforms, setUniforms] = useState(UNIFORMS);
  const [presetIndex, setPresetIndex] = useState(0);

  const set = (n: string, v: number) => {
    setUniforms((us) => us.map((u) => (u.name === n ? { ...u, value: v } : u)));
  };

  const activePreset = DEMO_PRESETS[presetIndex];

  return (
    <main className="page">
      <div className="stage">
        <ShaderRuntime
          fragment={activePreset.code}
          uniforms={uniforms}
          audioReactive
          onError={(e) => {
            setErr(e);
          }}
        />
      </div>
      <aside className="panel">
        <div className="panel-head">
          <a href="/" className="back">← home</a>
          <h1 className="title">AUDIO DEMO</h1>
          <div className="subtitle">{activePreset.name} · {activePreset.subtitle}</div>
        </div>

        <section>
          <h2>SELECT PRESET</h2>
          <div className="preset-grid">
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={p.name}
                className={`preset-btn ${presetIndex === idx ? "active" : ""}`}
                onClick={() => {
                  setPresetIndex(idx);
                  setErr(null); // Clear error on switch
                }}
              >
                <div className="p-num">{String(idx + 1).padStart(2, "0")}</div>
                <div className="p-info">
                  <div className="p-title">{p.name}</div>
                  <div className="p-desc">{p.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Audio Control</h2>
          <p className="hint">
            Click <strong>ENABLE MIC</strong> on the canvas viewport. The shader
            listens for u_bass, u_mid, u_treble, u_level from the
            mic AnalyserNode. Watch the warps respond!
          </p>
        </section>

        <section>
          <h2>Uniforms</h2>
          {uniforms.map((u) => (
            <label key={u.name} className="slider">
              <div className="slider-head">
                <span className="sname">{u.name}</span>
                <span className="sval">{Number(u.value).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={u.min}
                max={u.max}
                step={u.step}
                value={Number(u.value)}
                onChange={(e) => set(u.name, Number(e.target.value))}
              />
            </label>
          ))}
        </section>

        <section>
          <h2>Tips</h2>
          <ul className="tips">
            <li>Move the mouse over the canvas to shift hotspots.</li>
            <li>Drop u_speed to 0.3 and crank bass music for slower warps.</li>
            <li>Push u_zoom high to enter geometric mandala modes.</li>
          </ul>
        </section>

        {err && (
          <div className="err">
            <strong>Shader error:</strong>
            <pre>{err}</pre>
          </div>
        )}
      </aside>

      <style jsx>{`
        .page {
          display: grid;
          grid-template-columns: 1fr 380px;
          height: 100vh;
          width: 100vw;
        }
        .stage {
          position: relative;
          background: #000;
          overflow: hidden;
        }
        .panel {
          background: var(--bg-card);
          border-left: 1px solid var(--border);
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .panel-head {
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }
        .back {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-dim);
        }
        .back:hover {
          color: var(--accent);
        }
        .title {
          font-size: 1.4rem;
          margin-top: 0.5rem;
          color: var(--accent);
          font-weight: 500;
          letter-spacing: 0.1em;
        }
        .subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--ink-dim);
          text-transform: uppercase;
          margin-top: 0.25rem;
        }
        section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        h2 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--ink-dim);
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.3rem;
          margin: 0;
        }
        .preset-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.4rem;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 0.25rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: rgba(6, 6, 8, 0.4);
          padding: 0.5rem;
        }
        /* Custom scrollbar for preset selector */
        .preset-grid::-webkit-scrollbar {
          width: 4px;
        }
        .preset-grid::-webkit-scrollbar-track {
          background: transparent;
        }
        .preset-grid::-webkit-scrollbar-thumb {
          background: var(--border-hi);
          border-radius: 2px;
        }
        .preset-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: transparent;
          border: 1px solid transparent;
          padding: 0.5rem 0.75rem;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        .preset-btn:hover {
          background: rgba(201, 168, 76, 0.05);
          border-color: var(--border);
        }
        .preset-btn.active {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--accent);
        }
        .preset-btn.active .p-num {
          color: var(--accent);
        }
        .preset-btn.active .p-title {
          color: var(--accent-l);
        }
        .p-num {
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--ink-dim);
        }
        .p-info {
          display: flex;
          flex-direction: column;
          text-transform: none;
        }
        .p-title {
          font-size: 0.85rem;
          color: var(--ink);
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .p-desc {
          font-size: 0.7rem;
          color: var(--ink-dim);
        }
        .hint {
          color: var(--ink-dim);
          line-height: 1.6;
          font-size: 0.8rem;
          margin: 0;
        }
        .hint strong {
          color: var(--accent);
        }
        .slider {
          display: block;
        }
        .slider-head {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .sname {
          color: var(--ink);
        }
        .sval {
          color: var(--accent);
        }
        input[type="range"] {
          width: 100%;
          accent-color: var(--accent);
        }
        .tips {
          list-style: none;
          font-size: 0.8rem;
          color: var(--ink-dim);
          line-height: 1.8;
          padding: 0;
          margin: 0;
        }
        .tips li::before {
          content: "▸ ";
          color: var(--accent);
        }
        .err {
          background: rgba(255, 93, 200, 0.1);
          border: 1px solid var(--magenta);
          padding: 0.75rem;
          font-size: 0.75rem;
          margin: 0;
        }
        .err pre {
          white-space: pre-wrap;
          color: var(--magenta);
          margin-top: 0.5rem;
        }
        @media (max-width: 900px) {
          .page {
            grid-template-columns: 1fr;
            grid-template-rows: 50vh 1fr;
          }
          .panel {
            border-left: none;
            border-top: 1px solid var(--border);
          }
          .preset-grid {
            max-height: 180px;
          }
        }
      `}</style>
    </main>
  );
}
