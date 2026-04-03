import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// ── GET /api/rate-cards — public ────────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("rate_cards")
      .select("id, title, file_url, file_type, sort_order, created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST /api/rate-cards — admin upload ─────────────────────────────────────
export async function POST(req: Request) {
  try {
    // ✅ USE ADMIN CLIENT (FIXES 401)
    const supabase = await createAdminClient();

    const contentType = req.headers.get("content-type") ?? "";

    let file_url = "";
    let file_type: "image" | "pdf" = "image";
    let title = "";
    let sort_order = 0;

    // ── MULTIPART (FILE UPLOAD) ──
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const file = formData.get("file") as File | null;
      title = (formData.get("title") as string) || "";
      sort_order = Number(formData.get("sort_order") ?? 0);

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      // ✅ VALIDATE FILE TYPE
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExt = ["jpg", "jpeg", "png", "webp", "pdf"];

      if (!allowedExt.includes(ext)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, WebP, and PDF allowed" },
          { status: 400 }
        );
      }

      file_type = ext === "pdf" ? "pdf" : "image";

      // ✅ CREATE FILE NAME
      const fileName = `rate-cards/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const buffer = new Uint8Array(await file.arrayBuffer());

      // ✅ UPLOAD TO SUPABASE STORAGE
      const { error: uploadErr } = await supabase.storage
        .from("ratecard")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) {
        return NextResponse.json(
          { error: `Upload failed: ${uploadErr.message}` },
          { status: 500 }
        );
      }

      // ✅ GET PUBLIC URL
      const { data } = supabase.storage
        .from("ratecard")
        .getPublicUrl(fileName);

      file_url = data.publicUrl;
    }

    // ── JSON BODY ──
    else {
      const body = await req.json();

      file_url = body.file_url;
      file_type = body.file_type ?? "image";
      title = body.title ?? "";
      sort_order = body.sort_order ?? 0;
    }

    // ✅ FINAL VALIDATION
    if (!file_url) {
      return NextResponse.json(
        { error: "file_url is required" },
        { status: 400 }
      );
    }

    // ✅ INSERT INTO DB
    const { data, error } = await supabase
      .from("rate_cards")
      .insert({
        title,
        file_url,
        file_type,
        sort_order,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── PATCH /api/rate-cards — update ──────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const supabase = await createAdminClient(); // ✅ FIXED

    const { id, title, sort_order } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabase
      .from("rate_cards")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── DELETE /api/rate-cards ──────────────────────────────────────────────────
export async function DELETE(req: Request) {
  try {
    const supabase = await createAdminClient(); // ✅ FIXED

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // ✅ GET FILE URL
    const { data: card } = await supabase
      .from("rate_cards")
      .select("file_url")
      .eq("id", id)
      .single();

    // ✅ DELETE FROM STORAGE
    if (card?.file_url) {
      const match = card.file_url.match(/\/ratecard\/(.+)$/);

      if (match?.[1]) {
        await supabase.storage
          .from("ratecard")
          .remove([match[1]]);
      }
    }

    // ✅ DELETE FROM DB
    const { error } = await supabase
      .from("rate_cards")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
