import { NextRequest, NextResponse } from "next/server";
import { listShaders, readShader } from "@/lib/shader-index";

export async function GET() {
  const list = await listShaders();
  return NextResponse.json(list);
}
