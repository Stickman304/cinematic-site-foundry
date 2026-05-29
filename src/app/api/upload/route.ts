import { NextRequest } from "next/server";
import { uploadClientAsset } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const buildId = formData.get("buildId") as string;

  if (!buildId) {
    return new Response(JSON.stringify({ error: "buildId required" }), { status: 400 });
  }

  const urls: string[] = [];
  const files = formData.getAll("files") as File[];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadClientAsset(buildId, file.name, buffer, file.type);
    urls.push(url);
  }

  return new Response(JSON.stringify({ urls }), {
    headers: { "Content-Type": "application/json" },
  });
}
