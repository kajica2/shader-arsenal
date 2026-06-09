"use client";

import Link from "next/link";
import { ShaderThumbnail } from "./ShaderThumbnail";

interface ShaderOfTheDayProps {
  path: string;
  name: string;
  date: string;
}

export function ShaderOfTheDay({ path, name, date }: ShaderOfTheDayProps) {
  return (
    <section className="shader-of-the-day-section">
      <div className="section-title-wrapper">
        <span className="live-dot">●</span>
        <h2>Shader of the Day</h2>
        <span className="date-badge">{date}</span>
      </div>
      
      <div className="featured-card">
        <div className="preview-container">
          <ShaderThumbnail shaderPath={path} />
          <div className="preview-overlay">
            <span className="interactive-hint">Hover to activate dynamic rendering</span>
          </div>
        </div>
        
        <div className="card-content">
          <div className="card-header">
            <span className="featured-tag">FEATURED PRESET</span>
            <h3 className="shader-name">{name}</h3>
          </div>
          
          <p className="shader-description">
            Experience today's featured custom audio-reactive preset. Click the links below to live-test this preset in our interactive audio visualizer playground or inspect its GLSL code directly.
          </p>
          
          <div className="action-links">
            <Link href={`/playground?preset=${encodeURIComponent(path)}`} className="btn-action primary">
              🚀 LAUNCH PLAYGROUND
            </Link>
            <Link href={`/demo/audio?preset=${encodeURIComponent(path)}`} className="btn-action">
              ▶ RUN AUDIO DEMO
            </Link>
            <Link href={`/library/${encodeURIComponent(path)}`} className="btn-action inspect">
              INSPECT GLSL
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .shader-of-the-day-section {
          margin-bottom: 4rem;
        }
        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.4rem;
          margin-bottom: 1.5rem;
        }
        .section-title-wrapper h2 {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .live-dot {
          color: var(--cyan);
          animation: blink 2s infinite ease-in-out;
          font-size: 0.8rem;
        }
        .date-badge {
          font-size: 0.75rem;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid var(--border);
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          color: var(--accent-l);
          font-family: inherit;
          margin-left: auto;
        }
        .featured-card {
          display: grid;
          grid-template-columns: 1fr;
          border: 1px solid var(--border-hi);
          background: rgba(13, 13, 18, 0.5);
          backdrop-filter: blur(12px);
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: border-color 0.3s;
        }
        .featured-card:hover {
          border-color: var(--accent);
        }
        
        .preview-container {
          position: relative;
          height: 240px;
          background: #000;
          overflow: hidden;
        }
        .preview-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.4rem 0.8rem;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }
        .interactive-hint {
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          color: var(--ink-dim);
          text-transform: uppercase;
        }

        .card-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .featured-tag {
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: var(--cyan);
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.5rem;
        }
        .shader-name {
          font-size: 1.6rem;
          text-transform: capitalize;
          color: var(--accent-l);
          letter-spacing: 0.05em;
        }
        .shader-description {
          color: var(--ink-dim);
          line-height: 1.6;
          font-size: 0.95rem;
        }
        
        .action-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-action {
          padding: 0.65rem 1.25rem;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid var(--border);
          border-radius: 2px;
          color: var(--ink);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-action:hover {
          color: var(--accent);
          border-color: var(--accent);
          background: rgba(201, 168, 76, 0.05);
        }
        .btn-action.primary {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--accent);
          color: var(--accent-l);
        }
        .btn-action.primary:hover {
          background: rgba(201, 168, 76, 0.2);
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.2);
        }
        .btn-action.inspect {
          color: var(--ink-dim);
          border-color: transparent;
        }
        .btn-action.inspect:hover {
          color: var(--ink);
          text-decoration: underline;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @media (min-width: 768px) {
          .featured-card {
            grid-template-columns: 1fr 1.2fr;
          }
          .preview-container {
            height: 100%;
            min-height: 320px;
          }
        }
      `}</style>
      
      {/* Global override so our custom preview heights match layout nicely */}
      <style jsx global>{`
        .featured-card .thumbnail-container {
          height: 100% !important;
          border-bottom: none !important;
        }
        .featured-card .thumbnail-fallback {
          height: 100% !important;
          border-bottom: none !important;
        }
      `}</style>
    </section>
  );
}
