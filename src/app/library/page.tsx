"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default async function LibraryPage() {
  const [shaders, setShaders] = useState<Array<{path: string; size: number}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShaders() {
      try {
        const res = await fetch("/api/shaders");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data: Array<{path: string; size: number}> = await res.json();
        const presets = data.filter((s) => s.path.startsWith("presets/"));
        setShaders(presets);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadShaders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="page">
      <h1>Shader Library</h1>
      <p>Browse and view audio-reactive shader presets.</p>
      {shaders.length === 0 ? (
        <p>No presets found.</p>
      ) : (
        <div className="grid">
          {shaders.map((shader) => {
            const name = shader.path.split("/")[1]; // e.g., "presets/audio-reactive-plasma.glsl" -> "audio-reactive-plasma.glsl"
            return (
              <Link key={shader.path} href={`/library/${encodeURIComponent(shader.path)}`}>
                <div className="card">
                  <h3>{name.replace(".glsl", "")}</h3>
                  <p>Size: {shader.size} bytes</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}