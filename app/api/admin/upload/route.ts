import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file     = formData.get("file") as File | null;
  const bucket   = (formData.get("bucket") as string) || "media";
  const folder   = (formData.get("folder") as string) || "";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["jpg","jpeg","png","webp","gif","mp4","mov","pdf"].includes(ext)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const safe     = folder.trim().replace(/^\/+|\/+$/g,"");
  const fileName = `${safe ? safe+"/" : ""}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Use service role to bypass storage RLS
  const sb = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const buf = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await sb.storage.from(bucket).upload(fileName, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(fileName);
  return NextResponse.json({ url: publicUrl, path: fileName });
}
