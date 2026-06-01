"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type Uniform = {
  name: string;
  type: "float" | "int" | "vec2" | "vec3" | "vec4";
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
};

export type ShaderRuntimeProps = {
  fragment: string;
  uniforms: Uniform[];
  audioReactive?: boolean;
  onError?: (err: string | null) => void;
};

/**
 * WebGL2 fragment-shader runtime. Single fullscreen quad. Uniforms are
 * auto-located. Optional mic analyser via WebAudio if audioReactive is set.
 *
 * Synesthesia-style uniforms auto-injected (and passed to the fragment):
 *   u_time, u_resolution, u_mouse, u_bass, u_mid, u_treble, u_level
 */
export function ShaderRuntime({
  fragment,
  uniforms,
  audioReactive = false,
  onError,
}: ShaderRuntimeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const audioRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    data: Uint8Array<ArrayBuffer>;
  } | null>(null);
  const [audioOn, setAudioOn] = useState(false);
  const uniformValues = useRef<Map<string, Uniform>>(
    new Map(uniforms.map((u) => [u.name, { ...u }]))
  );

  // Keep ref in sync when uniforms prop changes
  useEffect(() => {
    uniformValues.current = new Map(uniforms.map((u) => [u.name, { ...u }]));
  }, [uniforms]);

  const compile = useCallback(
    (gl: WebGL2RenderingContext, src: string): WebGLProgram | null => {
      // Strip Next/TS imports & non-#include directives; we only ship one shader.
      const cleaned = src
        .split("\n")
        .filter((l) => !l.trim().startsWith("import"))
        .join("\n");

      const vert = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

      const header = `
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;
in  vec2 v_uv;
out vec4 outColor;
`;

      // Strip #version from the supplied fragment if it has one
      let body = cleaned.replace(/^#version[^\n]*\n/m, "").trim();
      // strip any standalone #include — not loading external lygia here.
      body = body.split("\n").filter((l) => !l.trim().startsWith("#include")).join("\n");

      const full = `${vert}\n${header}\n${body}`;

      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vs, vert);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        const e = gl.getShaderInfoLog(vs) || "vertex compile failed";
        gl.deleteShader(vs);
        onError?.(e);
        return null;
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fs, `${header}\n${body}`);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        const e = gl.getShaderInfoLog(fs) || "fragment compile failed";
        gl.deleteShader(fs);
        gl.deleteShader(vs);
        onError?.(e);
        return null;
      }

      const p = gl.createProgram()!;
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const e = gl.getProgramInfoLog(p) || "program link failed";
        gl.deleteProgram(p);
        onError?.(e);
        return null;
      }
      onError?.(null);
      return p;
    },
    [onError]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true });
    if (!gl) {
      onError?.("WebGL2 unavailable in this browser");
      return;
    }
    glRef.current = gl;

    // Fullscreen triangle (cheaper than quad)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    };
    canvas.addEventListener("mousemove", onMove);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const start = performance.now();
    const render = () => {
      const gl = glRef.current;
      if (!gl) return;
      const t = (performance.now() - start) / 1000;

      // Pull audio bands
      let bass = 0,
        mid = 0,
        treble = 0,
        level = 0;
      const a = audioRef.current;
      if (a) {
        a.analyser.getByteFrequencyData(a.data);
        const d = a.data;
        const n = d.length;
        const third = Math.floor(n / 3);
        let s1 = 0,
          s2 = 0,
          s3 = 0;
        for (let i = 0; i < third; i++) s1 += d[i];
        for (let i = third; i < third * 2; i++) s2 += d[i];
        for (let i = third * 2; i < n; i++) s3 += d[i];
        bass = s1 / (third * 255);
        mid = s2 / (third * 255);
        treble = s3 / (third * 255);
        for (let i = 0; i < n; i++) level += d[i];
        level = level / (n * 255);
      }

      const prog = progRef.current;
      if (prog) {
        gl.useProgram(prog);
        const locPos = gl.getAttribLocation(prog, "a_pos");
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(locPos);
        gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

        const setU = (n: string, v: number | number[]) => {
          const loc = gl.getUniformLocation(prog, n);
          if (loc === null) return;
          if (typeof v === "number") gl.uniform1f(loc, v);
          else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
          else if (v.length === 3) gl.uniform3f(loc, v[0], v[1], v[2]);
          else if (v.length === 4) gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
        };

        setU("u_time", t);
        setU("u_resolution", [canvas.width, canvas.height]);
        setU("u_mouse", mouseRef.current);
        setU("u_bass", bass);
        setU("u_mid", mid);
        setU("u_treble", treble);
        setU("u_level", level);

        for (const u of uniformValues.current.values()) {
          setU(u.name, u.value as number | number[]);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      if (progRef.current) gl.deleteProgram(progRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompile on fragment change
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    if (progRef.current) {
      gl.deleteProgram(progRef.current);
      progRef.current = null;
    }
    const p = compile(gl, fragment);
    if (p) progRef.current = p;
  }, [fragment, compile]);

  const startAudio = useCallback(async () => {
    if (audioRef.current) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      audioRef.current = {
        ctx,
        analyser,
        data: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
      };
      setAudioOn(true);
    } catch (e) {
      onError?.(
        "Microphone denied or unavailable: " +
          (e instanceof Error ? e.message : String(e))
      );
    }
  }, [onError]);

  // Expose a uniform setter via a ref-like imperative API through props
  // (we update uniformValues directly via setUniform below)
  useEffect(() => {
    // listen for "setUniform" custom events
    const h = (ev: Event) => {
      const e = ev as CustomEvent<{ name: string; value: number | number[] }>;
      const u = uniformValues.current.get(e.detail.name);
      if (u) {
        u.value = e.detail.value;
      }
    };
    window.addEventListener("sa:setUniform", h as EventListener);
    return () => window.removeEventListener("sa:setUniform", h as EventListener);
  }, []);

  return (
    <div className="shader-runtime">
      <canvas ref={canvasRef} className="shader-canvas" />
      {audioReactive && !audioOn && (
        <button className="audio-btn" onClick={startAudio}>
          ▶ ENABLE MIC
        </button>
      )}
      {audioReactive && audioOn && (
        <div className="audio-pill">
          <span className="tag live">● MIC</span>
        </div>
      )}
      <style jsx>{`
        .shader-runtime {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000;
        }
        .shader-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .audio-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 1rem 2rem;
          font-size: 1rem;
          background: rgba(201, 168, 76, 0.12);
          border: 1px solid var(--accent);
          color: var(--accent-l);
        }
        .audio-pill {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
      `}</style>
    </div>
  );
}

export function setUniform(name: string, value: number | number[]) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("sa:setUniform", { detail: { name, value } })
    );
  }
}
