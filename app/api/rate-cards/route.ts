import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── GET /api/rate-cards — public, ordered ────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rate_cards")
      .select("id, title, file_url, file_type, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST /api/rate-cards — admin only, accepts multipart form OR JSON ─────────
// Multipart: fields = file (File), title (string), sort_order (number)
// JSON:      { title, file_url, file_type, sort_order }  (when URL already known)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") ?? "";

    let file_url   = "";
    let file_type: "image" | "pdf" = "image";
    let title      = "";
    let sort_order = 0;

    if (contentType.includes("multipart/form-data")) {
      // ── Multipart upload ──
      const formData = await req.formData();
      const file     = formData.get("file") as File | null;
      title          = (formData.get("title") as string) || "";
      sort_order     = Number(formData.get("sort_order") ?? 0);

      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];
      if (!allowedExt.includes(ext)) {
        return NextResponse.json({ error: "Only JPG, PNG, WebP, and PDF files are allowed" }, { status: 400 });
      }

      file_type = ext === "pdf" ? "pdf" : "image";

      // Upload to Supabase storage — ratecard bucket
      const fileName  = `rate-cards/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuf  = await file.arrayBuffer();
      const buffer    = new Uint8Array(arrayBuf);

      const { error: uploadErr } = await supabase.storage
        .from("ratecard")
        .upload(fileName, buffer, { contentType: file.type, upsert: false });

      if (uploadErr) {
        return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage.from("ratecard").getPublicUrl(fileName);
      file_url = publicUrl;

    } else {
      // ── JSON body (file already uploaded separately) ──
      const body = await req.json();
      file_url   = body.file_url;
      file_type  = body.file_type ?? "image";
      title      = body.title ?? "";
      sort_order = body.sort_order ?? 0;
    }

    if (!file_url) return NextResponse.json({ error: "file_url is required" }, { status: 400 });

    const { data, error } = await supabase
      .from("rate_cards")
      .insert({ title, file_url, file_type, sort_order })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });

  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── PATCH /api/rate-cards — update title / sort_order ────────────────────────
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, sort_order } = await req.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (title      !== undefined) updates.title      = title;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabase
      .from("rate_cards")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── DELETE /api/rate-cards — removes DB row and storage file ─────────────────
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Fetch the record first so we can delete the storage file too
    const { data: card } = await supabase
      .from("rate_cards")
      .select("file_url")
      .eq("id", id)
      .single();

    // Delete storage file (best-effort — don't fail if missing)
    if (card?.file_url) {
      // Extract the path after the bucket name in the URL
      const match = card.file_url.match(/\/ratecard\/(.+)$/);
      if (match?.[1]) {
        await supabase.storage.from("ratecard").remove([match[1]]);
      }
    }

    const { error } = await supabase.from("rate_cards").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
