"use client";

import { useEffect, useRef, useState } from "react";

interface ShaderThumbnailProps {
  shaderPath: string;
}

export function ShaderThumbnail({ shaderPath }: ShaderThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<boolean>(false);

  // Fetch shader source and preprocess #includes
  useEffect(() => {
    async function fetchAndPreprocess() {
      try {
        const res = await fetch(`/api/shader?path=${encodeURIComponent(shaderPath)}`);
        if (!res.ok) throw new Error("Failed to load");
        const rawSource = await res.text();

        // If source contains #include, preprocess via /api/preprocess
        if (rawSource.includes("#include")) {
          const prepRes = await fetch("/api/preprocess", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ source: rawSource }),
          });
          if (!prepRes.ok) throw new Error("Preprocess failed");
          const json = await prepRes.json();
          setSource(json.source);
        } else {
          setSource(rawSource);
        }
      } catch (e) {
        console.error(e);
        setError(true);
      }
    }
    fetchAndPreprocess();
  }, [shaderPath]);

  // Compile and setup WebGL
  useEffect(() => {
    if (!source || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl2", { antialias: false, powerPreference: "low-power" });
    if (!gl) {
      setError(true);
      return;
    }
    glRef.current = gl;

    // Setup vertices (Single full-screen triangle)
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    // Vertex shader
    const vert = `#version 300 es
    in vec2 a_pos;
    out vec2 v_uv;
    void main() {
      v_uv = a_pos * 0.5 + 0.5;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

    // Process fragment source
    let body = source
      .split("\n")
      .filter((l) => !l.trim().startsWith("import")) // Remove any import lines
      .join("\n")
      .replace(/^#version[^\n]*\n/m, "") // Remove #version
      .replace(/^precision[^\n]*\n/m, "") // Remove precision
      .trim();

    // Remove existing declarations of the uniforms we are going to add
    const uniformsToReset = [
      "u_time",
      "u_resolution",
      "u_mouse",
      "u_bass",
      "u_mid",
      "u_treble",
      "u_level"
    ];
    for (const uniform of uniformsToReset) {
      // Match: uniform <type> <uniform>;
      // Allow for optional whitespace and any type (float, vec2, vec3, vec4, etc.)
      const regex = new RegExp(`^\\s*uniform\\s+[^\\s]+\\s+${uniform}\\s*;\\s*$`, 'gm');
      body = body.replace(regex, '');
    }

    body = body.trim();

    // Replace gl_FragColor with outColor for WebGL2 output compatibility
    body = body.replace(/gl_FragColor/g, "outColor");

    // If the body is empty after processing, we have an error
    if (!body) {
      console.error("Shader body is empty after processing");
      setError(true);
      return;
    }

    console.log(`Processing shader: ${shaderPath}`);
    console.log('Processed body:', body);
    // Check for backslash in body
    if (body.includes('\\\\')) {
      console.log('Body contains backslash');
    }
    // Check for the sequence backslash followed by n
    if (body.includes('\\\\n')) {
      console.log('Body contains backslash-n');
    }

    // WebGL2 fragment header with our uniforms and varyings
    const header = `#version 300 es
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

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vert);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      const infoLog = gl.getShaderInfoLog(vs) || "vertex compile failed";
      console.error("Vertex shader compile error:", infoLog);
      gl.deleteShader(vs);
      setError(true);
      return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, `${header}\n${body}`);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      const infoLog = gl.getShaderInfoLog(fs) || "fragment compile failed";
      console.error("Fragment shader compile error:", infoLog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setError(true);
      return;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const infoLog = gl.getProgramInfoLog(prog) || "program link failed";
      console.error("Program link error:", infoLog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
      setError(true);
      return;
    }
    progRef.current = prog;

    // Clean up compile shaders
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // Initial single frame render
    renderFrame(0);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (progRef.current) gl.deleteProgram(progRef.current);
      gl.deleteBuffer(buf);
    };
  }, [source]);

  // Frame rendering function
  const renderFrame = (time: number) => {
    const gl = glRef.current;
    const prog = progRef.current;
    const canvas = canvasRef.current;
    if (!gl || !prog || !canvas) return;

    // Set viewports at lower resolution to save GPU
    const w = 240;
    const h = 150;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    gl.useProgram(prog);

    // Get attribute position
    const locPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    // Set uniform values
    const setU = (name: string, v: number | number[]) => {
      const loc = gl.getUniformLocation(prog, name);
      if (loc === null) return;
      if (typeof v === "number") gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(loc, v[0], v[1], v[2]);
      else if (v.length === 4) gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
    };

    // Synthesize beautiful moving audio bands based on time
    const t = time / 1000;
    const bass = 0.4 + 0.3 * Math.sin(t * 1.5) + 0.2 * Math.sin(t * 3.4);
    const mid = 0.3 + 0.25 * Math.sin(t * 2.2 + 1.0);
    const treble = 0.2 + 0.2 * Math.sin(t * 4.1 + 2.0);
    const level = (bass + mid + treble) / 3.0;

    setU("u_time", t);
    setU("u_resolution", [w, h]);
    setU("u_mouse", [0.5, 0.5]);
    setU("u_bass", bass);
    setU("u_mid", mid);
    setU("u_treble", treble);
    setU("u_level", level);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // Animation Loop based on hover state
  useEffect(() => {
    if (!isHovered) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const start = performance.now();
    const tick = () => {
      renderFrame(performance.now() - start);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isHovered]);

  if (error) {
    return (
      <div className="thumbnail-fallback">
        <span>GLSL Error</span>
      </div>
    );
  }

  return (
    <div
      className="thumbnail-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas ref={canvasRef} className="thumbnail-canvas" />
    </div>
  );
}
