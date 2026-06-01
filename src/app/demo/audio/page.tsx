"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ShaderRuntime = dynamic(
  () => import("@/components/ShaderRuntime").then((m) => m.ShaderRuntime),
  { ssr: false }
);

const FRAG = `// Sovereign Signal — audio-reactive band-mapped FBM plasma
// Audio uniforms (auto-injected): u_time, u_resolution, u_mouse,
//   u_bass, u_mid, u_treble, u_level
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

uniform float u_speed;     // master time multiplier
uniform float u_zoom;      // base scale
uniform float u_contrast;  // output gain

// ---- minimal inline lygia-style helpers (no #include to keep this self-contained) ----
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Spectral palette (Zucconi-style)
vec3 spectral(float t) {
  return hsv2rgb(vec3(t, 0.85, 1.0));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;

  // Domain warping driven by noise + audio
  vec2 q = vec2(fbm(uv * u_zoom + t * 0.15),
                fbm(uv * u_zoom + vec2(3.7, 1.2) + t * 0.12));
  vec2 r = vec2(fbm(uv * u_zoom + 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv * u_zoom + 2.0 * q + vec2(8.3, 2.8) + 0.126 * t));
  float f = fbm(uv * u_zoom + 2.0 * r);

  // Hue rotates with time + mid-band; saturation spikes with bass
  float hue = fract(t * 0.05 + r.x * 0.6 + u_mid * 0.4);
  float sat = clamp(0.7 + u_bass * 0.6 + u_treble * 0.2, 0.0, 1.0);
  vec3 col = hsv2rgb(vec3(hue, sat, pow(f, 1.5)));

  // Bass pump — add cyan/magenta energy
  col += vec3(0.0, 0.8, 1.0) * u_bass * 0.4 * smoothstep(0.0, 0.5, f);
  col += vec3(1.0, 0.3, 0.9) * u_treble * 0.3 * (1.0 - smoothstep(0.0, 0.5, f));

  // Mouse pulls a soft hotspot
  float md = length(uv - (u_mouse * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0));
  col += vec3(1.0, 0.85, 0.5) * 0.25 * exp(-md * 6.0) * (0.5 + u_level * 1.5);

  // Scanlines + grain for that VJ edge
  float scan = 0.94 + 0.06 * sin(gl_FragCoord.y * 2.5 + t * 4.0);
  col *= scan;
  float grain = (hash(gl_FragCoord.xy + t) - 0.5) * 0.04;
  col += grain;

  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const UNIFORMS = [
  { name: "u_speed", type: "float" as const, value: 1.0, min: 0, max: 4, step: 0.05 },
  { name: "u_zoom", type: "float" as const, value: 2.5, min: 0.5, max: 8, step: 0.1 },
  { name: "u_contrast", type: "float" as const, value: 1.1, min: 0.2, max: 2.5, step: 0.05 },
];

export default function AudioDemoPage() {
  const [err, setErr] = useState<string | null>(null);
  const [uniforms, setUniforms] = useState(UNIFORMS);
  const [busy, setBusy] = useState(false);

  const set = (n: string, v: number) => {
    setUniforms((us) => us.map((u) => (u.name === n ? { ...u, value: v } : u)));
  };

  return (
    <main className="page">
      <div className="stage">
        <ShaderRuntime
          fragment={FRAG}
          uniforms={uniforms}
          audioReactive
          onError={(e) => {
            setErr(e);
            setBusy(false);
          }}
        />
      </div>
      <aside className="panel">
        <div className="panel-head">
          <a href="/" className="back">← home</a>
          <h1 className="title">AUDIO DEMO</h1>
          <div className="subtitle">Sovereign Signal · FBM Plasma</div>
        </div>

        <section>
          <h2>Audio</h2>
          <p className="hint">
            Click <strong>ENABLE MIC</strong> on the canvas. The shader
            listens for u_bass, u_mid, u_treble, u_level from the
            AnalyserNode. Play music. Watch the warps respond.
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
            <li>Move the mouse over the canvas — hotspot follows.</li>
            <li>Drop the speed to 0.3 and crank bass music for slow warp.</li>
            <li>Push u_zoom to 7+ to enter a tight mandala mode.</li>
            <li>Code is in <code>src/app/demo/audio/page.tsx</code>.</li>
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
          grid-template-columns: 1fr 360px;
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
        }
        .panel-head {
          margin-bottom: 1.5rem;
        }
        .back {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .title {
          font-size: 1.2rem;
          margin-top: 0.5rem;
          color: var(--accent);
        }
        .subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: var(--ink-dim);
          text-transform: uppercase;
          margin-top: 0.25rem;
        }
        section {
          margin-bottom: 1.5rem;
        }
        .hint {
          color: var(--ink-dim);
          line-height: 1.6;
          font-size: 0.85rem;
        }
        .hint strong {
          color: var(--accent);
        }
        .slider {
          display: block;
          margin-bottom: 0.75rem;
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
        }
        .tips li::before {
          content: "▸ ";
          color: var(--accent);
        }
        code {
          font-size: 0.75rem;
          color: var(--cyan);
        }
        .err {
          background: rgba(255, 93, 200, 0.1);
          border: 1px solid var(--magenta);
          padding: 0.75rem;
          margin-top: 1rem;
          font-size: 0.75rem;
        }
        .err pre {
          white-space: pre-wrap;
          color: var(--magenta);
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .page {
            grid-template-columns: 1fr;
            grid-template-rows: 50vh 1fr;
          }
          .panel {
            border-left: none;
            border-top: 1px solid var(--border);
          }
        }
      `}</style>
    </main>
  );
}
