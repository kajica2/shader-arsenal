"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useEffect as useEffectImport } from "react"; // We'll use the same useEffect

export default function PresetPage() {
  const router = useRouter();
  const { path } = router.query as { path: string };
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
        <Link href="/library">
          <a>← Back to Library</a>
        </Link>
        <h1>{path.split("/").pop()}</h1>
      </div>
      <div className="container">
        <pre className="code">{source}</pre>
      </div>
    </main>
  );
}