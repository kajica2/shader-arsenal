"use client";

console.log("LibraryPage module evaluated");

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShaderThumbnail } from "@/components/ShaderThumbnail";

interface ShaderItem {
  path: string;
  size: number;
}

export default function LibraryPage() {
  console.log("LibraryPage component rendered");
  const [shaders, setShaders] = useState<ShaderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadShaders() {
      try {
        const res = await fetch("/api/shaders");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data: ShaderItem[] = await res.json();
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

  const filteredShaders = shaders.filter((shader) => {
    const name = shader.path.split("/")[1].replace(".glsl", "");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="loader-container">
        <div className="pulse-loader"></div>
        <p>Initializing Shader Arsenal...</p>
        <style jsx>{`
          .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #060608;
            color: var(--accent);
            gap: 1.5rem;
          }
          .pulse-loader {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--accent);
            animation: pulse 1.6s infinite ease-in-out;
            box-shadow: 0 0 20px var(--accent);
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.2; }
            50% { transform: scale(1.0); opacity: 0.8; }
            100% { transform: scale(0.6); opacity: 0.2; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>System Error</h2>
        <p>{error}</p>
        <Link href="/" className="btn">Return Home</Link>
        <style jsx>{`
          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #060608;
            gap: 1.5rem;
            padding: 2rem;
            text-align: center;
          }
          h2 { color: var(--magenta); }
        `}</style>
      </div>
    );
  }

  return (
    <main className="library-page">
      <header className="page-header">
        <div className="nav-row">
          <Link href="/" className="back-link">
            ← BACK TO SYSTEM
          </Link>
        </div>
        <h1>Preset Arsenal</h1>
        <p className="subtitle">
          Interactive catalog of {shaders.length} custom audio-reactive GLSL presets. Hover to preview the live rendering.
        </p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search preset database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      {filteredShaders.length === 0 ? (
        <div className="no-results">
          <p>No presets matching "{searchQuery}" located in the database.</p>
        </div>
      ) : (
        <div className="shader-grid">
          {filteredShaders.map((shader) => {
            const rawName = shader.path.split("/")[1];
            const name = rawName.replace(".glsl", "").replace(/-/g, " ");
            
            return (
              <div key={shader.path} className="shader-card">
                <ShaderThumbnail shaderPath={shader.path} />
                <div className="card-info">
                  <span className="card-tag">GLSL PRESET</span>
                  <h3>{name}</h3>
                  <div className="card-meta">
                    <span>{shader.size} Bytes</span>
                    <Link href={`/library/${encodeURIComponent(shader.path)}`} className="inspect-btn">
                      INSPECT CODE →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .library-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 6rem;
        }
        .page-header {
          margin-bottom: 4rem;
          text-align: center;
        }
        .nav-row {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 1.5rem;
        }
        .back-link {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--ink-dim);
          border-bottom: 1px solid transparent;
        }
        .back-link:hover {
          color: var(--accent);
          border-color: var(--accent);
        }
        h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 1rem;
        }
        .subtitle {
          color: var(--ink-dim);
          max-width: 600px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
          font-size: 0.95rem;
        }
        .search-bar {
          max-width: 500px;
          margin: 0 auto;
          position: relative;
        }
        .search-input {
          width: 100%;
          background: rgba(13, 13, 18, 0.65);
          border: 1px solid var(--border);
          padding: 0.9rem 1.5rem;
          border-radius: 4px;
          color: var(--ink);
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }
        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.15);
          background: rgba(20, 20, 28, 0.85);
        }
        .shader-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        .shader-card {
          background: rgba(13, 13, 18, 0.6);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
        }
        .shader-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 10px 30px rgba(201, 168, 76, 0.1);
        }
        .card-info {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .card-tag {
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: var(--cyan);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        h3 {
          font-size: 1.1rem;
          text-transform: capitalize;
          margin-bottom: 1.25rem;
          color: var(--ink);
          letter-spacing: 0.02em;
        }
        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--ink-dim);
          margin-top: auto;
        }
        .inspect-btn {
          color: var(--accent-l);
          border: none;
          font-weight: 500;
        }
        .inspect-btn:hover {
          color: var(--accent);
        }
        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--ink-dim);
          border: 1px dashed var(--border);
          border-radius: 4px;
        }
      `}</style>
      
      {/* Global CSS Inject for ShaderThumbnail styling within cards */}
      <style jsx global>{`
        .thumbnail-container {
          position: relative;
          width: 100%;
          height: 170px;
          background: #000;
          overflow: hidden;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
        }
        .thumbnail-canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .shader-card:hover .thumbnail-canvas {
          transform: scale(1.04);
        }
        .thumbnail-fallback {
          width: 100%;
          height: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #14141c;
          color: var(--magenta);
          font-size: 0.8rem;
          border-bottom: 1px solid var(--border);
        }
      `}</style>
    </main>
  );
}