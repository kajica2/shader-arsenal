import { NextRequest, NextResponse } from "next/server";
import { readShader } from "@/lib/shader-index";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams.get("path");
  if (!p) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }
  const text = await readShader(p);
  if (text === null) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(text, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
