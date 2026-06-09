"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PresetPage() {
  const params = useParams();
  const pathParts = params?.path;
  const path = Array.isArray(pathParts) ? pathParts.join("/") : "";
  
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSource() {
      if (!path) {
        setError("No path provided");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/shader?path=${encodeURIComponent(path)}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const text = await res.text();
        setSource(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadSource();
  }, [path]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="page">
      <div className="header">
        <Link href="/library" className="back-link">
          ← Back to Library
        </Link>
        <h1>{path.split("/").pop()}</h1>
      </div>
      <div className="container">
        <pre className="code">{source}</pre>
      </div>
      <style jsx>{`
        .page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }
        .header {
          margin-bottom: 2rem;
        }
        .back-link {
          font-size: 0.8rem;
          color: var(--ink-dim);
          text-decoration: none;
        }
        .back-link:hover {
          color: var(--accent);
        }
        h1 {
          font-size: 2rem;
          margin-top: 1rem;
          text-transform: uppercase;
        }
        .container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1.5rem;
          overflow-x: auto;
        }
        .code {
          font-family: ui-monospace, monospace;
          font-size: 0.85rem;
          color: var(--ink);
          line-height: 1.6;
        }
      `}</style>
    </main>
  );
}