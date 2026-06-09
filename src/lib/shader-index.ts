import { promises as fs } from "fs";
import * as path from "path";

const SHADER_ROOT = path.join(process.cwd(), "src", "shaders", "lygia", "lygia");
const HG_SDF = path.join(process.cwd(), "src", "shaders", "lygia", "hg_sdf.glsl");
const PRESETS_ROOT = path.join(process.cwd(), "src", "presets");

const PICKS: { path: string; description: string }[] = [
  {
    path: "color/palette/spectral.glsl",
    description:
      "Polygon's spectral palette — emulates a prism split. Best for eye-melting color washes.",
  },
  {
    path: "generative/snoise.glsl",
    description:
      "Simplex noise 3D/4D. The OG fBM seed for everything procedural — terrain, plasma, clouds, breath.",
  },
  {
    path: "color/dither/bayer.glsl",
    description:
      "Ordered Bayer dithering. Cyan/magenta dot patterns at low bit depth — classic VJ look.",
  },
  {
    path: "filter/kaleidoscope.glsl",
    description:
      "Polar kaleidoscope mirror. Turn any input into a mandala in 4 lines.",
  },
  {
    path: "math/rotate2d.glsl",
    description:
      "2D rotation matrix. Boring alone, essential everywhere — pair with noise to make swirls.",
  },
  {
    path: "color/blend/glow.glsl",
    description:
      "Glow blend mode. Layer two scenes and watch them light each other up.",
  },
];

export type ShaderStats = {
  totalFiles: number;
  totalLines: number;
  totalBytes: number;
  categories: { name: string; count: number }[];
  picks: typeof PICKS;
};

export async function getShaderStats(): Promise<ShaderStats> {
  const counts = new Map<string, number>();
  let totalFiles = 0;
  let totalLines = 0;
  let totalBytes = 0;

  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && full.endsWith(".glsl")) {
        totalFiles++;
        const stat = await fs.stat(full);
        totalBytes += stat.size;
        // category = first dir under lygia/ (or "root" if at top)
        const rel = path.relative(SHADER_ROOT, full);
        const cat = rel.split(path.sep)[0];
        if (cat && cat !== ".") {
          counts.set(cat, (counts.get(cat) || 0) + 1);
        }
        // crude line count — read just to count \n
        try {
          const text = await fs.readFile(full, "utf8");
          totalLines += text.split("\n").length;
        } catch {}
      }
    }
  }

  await walk(SHADER_ROOT);
  // include hg_sdf
  try {
    const s = await fs.stat(HG_SDF);
    totalFiles++;
    totalBytes += s.size;
    const t = await fs.readFile(HG_SDF, "utf8");
    totalLines += t.split("\n").length;
  } catch {}

  const categories = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { totalFiles, totalLines, totalBytes, categories, picks: PICKS };
}

export async function listShaders(prefix: string = "") {
  const out: { path: string; size: number }[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && full.endsWith(".glsl")) {
        const s = await fs.stat(full);
        const rel = path.relative(SHADER_ROOT, full);
        if (!prefix || rel.startsWith(prefix)) {
          out.push({ path: rel, size: s.size });
        }
      }
    }
  }
  await walk(SHADER_ROOT);

  try {
    const presetEntries = await fs.readdir(PRESETS_ROOT, { withFileTypes: true });
    for (const e of presetEntries) {
      if (e.isFile() && e.name.endsWith(".glsl")) {
        const full = path.join(PRESETS_ROOT, e.name);
        const s = await fs.stat(full);
        const relPath = `presets/${e.name}`;
        if (!prefix || relPath.startsWith(prefix)) {
          out.push({ path: relPath, size: s.size });
        }
      }
    }
  } catch (err) {
    // Ignore if presets directory doesn't exist
  }

  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

// ── Shader of the Day ─────────────────────────────────────────────
// Deterministic pick seeded by date — same shader all day, changes daily.

const PRESET_NAMES = [
  "audio-reactive-plasma", "audio-waveform-tunnel", "audio-reactive-voronoi",
  "audio-kaleidoscope", "audio-reactive-noise-field", "audio-pulse-mandelbrot",
  "audio-reactive-glitch", "audio-waveform-water", "audio-reactive-cityscape",
  "audio-reactive-DNA", "audio-reactive-fire", "audio-reactive-ocean",
  "audio-neon-cyberpunk", "audio-quantum-tunnel", "audio-soundwave-star",
  "audio-vortex-nebula",
];

/** Simple string hash to seed a deterministic index from a date string. */
function hashDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h) + dateStr.charCodeAt(i);
    h |= 0; // convert to 32-bit int
  }
  return Math.abs(h);
}

export function getShaderOfTheDay(): { path: string; name: string; date: string } {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const idx = hashDate(dateStr) % PRESET_NAMES.length;
  return {
    path: `presets/${PRESET_NAMES[idx]}.glsl`,
    name: PRESET_NAMES[idx].replace(/-/g, " "),
    date: dateStr,
  };
}

export async function readShader(relPath: string): Promise<string | null> {
  // disallow path traversal
  if (relPath.includes("..") || relPath.startsWith("/")) return null;

  if (relPath.startsWith("presets/")) {
    const filename = relPath.substring("presets/".length);
    const full = path.join(PRESETS_ROOT, filename);
    if (!full.startsWith(PRESETS_ROOT)) return null;
    try {
      return await fs.readFile(full, "utf8");
    } catch {
      return null;
    }
  }

  const full = path.join(SHADER_ROOT, relPath);
  if (!full.startsWith(SHADER_ROOT)) return null;
  try {
    return await fs.readFile(full, "utf8");
  } catch {
    return null;
  }
}
