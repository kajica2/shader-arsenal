import Link from "next/link";
import { getShaderStats } from "@/lib/shader-index";

export default async function Home() {
  const stats = await getShaderStats();

  return (
    <main className="home">
      <header className="hero">
        <div className="hero-tag">Creative Universe · Luminara</div>
        <h1>SHADER ARSENAL</h1>
        <p className="hero-sub">
          A working arsenal of Lygia GLSL shaders. Audio-reactive demos, a live
          playground, and a copy-paste library of {stats.totalFiles} shader
          snippets. Looted from{" "}
          <a
            href="https://lygia.xyz"
            target="_blank"
            rel="noreferrer"
          >
            lygia.xyz
          </a>
          , bundled with the macOS VJ app{" "}
          <em>Synesthesia</em> by Ryan Alexander.
        </p>
        <div className="cta-row">
          <Link href="/playground" className="btn primary">
            → OPEN PLAYGROUND
          </Link>
          <Link href="/demo/audio" className="btn">
            ▶ AUDIO-REACTIVE DEMO
          </Link>
          <Link href="/library" className="btn ghost">
            BROWSE LIBRARY
          </Link>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <div className="stat-num">{stats.totalFiles}</div>
          <div className="stat-label">GLSL files</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.totalLines.toLocaleString()}</div>
          <div className="stat-label">lines of shader code</div>
        </div>
        <div className="stat">
          <div className="stat-num">{stats.categories.length}</div>
          <div className="stat-label">top-level categories</div>
        </div>
        <div className="stat">
          <div className="stat-num">{Math.round(stats.totalBytes / 1024)}K</div>
          <div className="stat-label">source size</div>
        </div>
      </section>

      <section className="categories">
        <h2>Categories</h2>
        <ul>
          {stats.categories.map((c) => (
            <li key={c.name}>
              <span className="cat-name">{c.name}</span>
              <span className="cat-count">{c.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="picks">
        <h2>Pick of the Litter</h2>
        <div className="pick-grid">
          {stats.picks.map((p) => (
            <Link key={p.path} href={`/library?open=${encodeURIComponent(p.path)}`} className="pick">
              <div className="pick-path">{p.path}</div>
              <div className="pick-desc">{p.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="foot">
        <div>
          <span className="tag live">●</span> Build as a self-hosted
          reference. The shaders are MIT-style (Prosperity 3.0). See{" "}
          <a href="https://github.com/kajica2/shader-arsenal/blob/main/THIRD_PARTY.md">
            THIRD_PARTY.md
          </a>
          .
        </div>
      </footer>

      <style>{`
        .home {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 2rem 6rem;
        }
        .hero {
          text-align: center;
          margin-bottom: 4rem;
        }
        .hero-tag {
          font-size: 0.7rem;
          letter-spacing: 0.4em;
          color: var(--ink-dim);
          margin-bottom: 1rem;
        }
        .hero h1 {
          margin-bottom: 1.5rem;
        }
        .hero-sub {
          max-width: 640px;
          margin: 0 auto 2.5rem;
          color: var(--ink-dim);
          line-height: 1.8;
        }
        .hero-sub em {
          color: var(--accent);
          font-style: normal;
        }
        .cta-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn.primary {
          background: rgba(201, 168, 76, 0.12);
          border-color: var(--accent);
          color: var(--accent-l);
        }
        .btn.ghost {
          color: var(--ink-dim);
          border-color: var(--border);
        }
        .btn.ghost:hover {
          color: var(--ink);
          border-color: var(--ink-dim);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 4rem;
        }
        .stat {
          border: 1px solid var(--border);
          padding: 1.5rem;
          background: var(--bg-card);
          text-align: center;
        }
        .stat-num {
          font-size: 2.4rem;
          color: var(--accent);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-dim);
          margin-top: 0.5rem;
        }
        .categories {
          margin-bottom: 4rem;
        }
        .categories ul {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }
        .categories li {
          display: flex;
          justify-content: space-between;
          border: 1px solid var(--border);
          padding: 0.6rem 1rem;
          background: var(--bg-card);
        }
        .cat-name {
          color: var(--ink);
        }
        .cat-count {
          color: var(--accent);
          font-size: 0.85rem;
        }
        .picks {
          margin-bottom: 4rem;
        }
        .pick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .pick {
          border: 1px solid var(--border);
          padding: 1.2rem;
          background: var(--bg-card);
          transition: all 0.2s;
          display: block;
        }
        .pick:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(201, 168, 76, 0.1);
        }
        .pick-path {
          font-size: 0.8rem;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .pick-desc {
          font-size: 0.85rem;
          color: var(--ink-dim);
          line-height: 1.6;
        }
        .foot {
          border-top: 1px solid var(--border);
          padding-top: 2rem;
          color: var(--ink-dim);
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
