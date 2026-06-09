import { NextRequest, NextResponse } from "next/server";
import * as path from "path"; // turbopack-ignore
import { promises as fs } from "fs"; // turbopack-ignore

export const runtime = "nodejs";

const LYGIA_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "src", "shaders", "lygia", "lygia");
const REAL_LYGIA_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "src", "shaders", "lygia", "lygia");

/**
 * Resolve #include directives in a GLSL fragment.
 *
 * Supports:
 *   #include "lygia/foo/bar.glsl"     // resolved relative to LYGIA_ROOT
 *   #include "foo/bar.glsl"           // same
 *   #include "../math/const.glsl"     // relative to the INCLUDING file
 *   #include <foo/bar.glsl>           // angle brackets = Lygia convention, also LYGIA_ROOT
 *
 * Each file is inlined at most once per preprocessor run (pragma-once semantics)
 * to avoid duplicate-definition errors from guards in lygia files.
 */
export async function POST(req: NextRequest) {
  let body: { source?: string; root?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const source = body.source;
  if (typeof source !== "string") {
    return NextResponse.json({ error: "missing source" }, { status: 400 });
  }
  const base = (body.root || LYGIA_ROOT).replace(/[<>:"|?*]/g, "");
  if (base.includes("..")) {
    return NextResponse.json({ error: "invalid root" }, { status: 400 });
  }

  const includedFiles: string[] = [];
  const seen = new Set<string>(); // pragma-once tracker (absolute paths)

  async function exists(p: string): Promise<boolean> {
    try {
      const s = await fs.stat(p);
      return s.isFile();
    } catch {
      return false;
    }
  }

  async function resolveInclude(
    includePath: string,
    fromFile: string | null
  ): Promise<string> {
    // 1. Try relative to the including file
    if (fromFile) {
      const candidate = path.resolve(path.dirname(fromFile), includePath);
      const realBase = await fs.realpath(base).catch(() => base); // turbopack-ignore
      const realRoot = await fs.realpath(LYGIA_ROOT).catch(() => LYGIA_ROOT); // turbopack-ignore
      if (
        (await exists(candidate)) &&
        (candidate.startsWith(realBase) || candidate.startsWith(realRoot))
      ) {
        return candidate;
      }
    }
    // 2. Try relative to LYGIA_ROOT
    const fromRoot = path.resolve(LYGIA_ROOT, includePath);
    if (await exists(fromRoot)) return fromRoot;
    // 3. Try relative to the user-supplied base
    const fromBase = path.resolve(base, includePath);
    if (await exists(fromBase)) return fromBase;
    // 4. Strip the "lygia/" prefix (common shortcut)
    if (includePath.startsWith("lygia/")) {
      const stripped = includePath.slice("lygia/".length);
      const c = path.resolve(LYGIA_ROOT, stripped);
      if (await exists(c)) return c;
    }
    return "";
  }

  async function expand(src: string, fromFile: string | null): Promise<string> {
    const re = /^\s*#include\s+([<"])([^>"]+)[>"]\s*$/gm;
    let out = "";
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(src)) !== null) {
      out += src.slice(lastIndex, match.index);
      lastIndex = match.index + match[0].length;
      const includePath = match[2];
      const absPath = await resolveInclude(includePath, fromFile);
      if (!absPath) {
        out += `\n// #include "${includePath}" — not found\n`;
        continue;
      }
      if (seen.has(absPath)) {
        out += `\n// #include "${includePath}" — already included (pragma-once)\n`;
        continue;
      }
      seen.add(absPath);
      const fileText = await fs.readFile(absPath, "utf8");
      includedFiles.push(path.relative(LYGIA_ROOT, absPath));
      out += `\n// >>> ${path.relative(LYGIA_ROOT, absPath)}\n`;
      out += await expand(fileText, absPath);
      out += `\n// <<< ${path.relative(LYGIA_ROOT, absPath)}\n`;
    }
    out += src.slice(lastIndex);
    return out;
  }

  try {
    const expanded = await expand(source, null);
    return NextResponse.json({
      source: expanded,
      included: includedFiles,
      count: includedFiles.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
