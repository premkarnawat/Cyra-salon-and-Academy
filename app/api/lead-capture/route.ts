import { NextResponse } from "next/server";
import { createClient as createSC } from "@supabase/supabase-js";

const SB = () => createSC(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, name, contact, dob, user_agent } = body;

    if (!user_id || !name || !contact || !dob) {
      return NextResponse.json(
        { error: "user_id, name, contact, and dob are required." },
        { status: 400 }
      );
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned    = contact.replace(/\D/g, "").replace(/^91/, "");
    if (!phoneRegex.test(cleaned)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const sb  = SB();
    const now = new Date().toISOString();

    // ── Insert into users table ───────────────────────────────────────────────
    // Using upsert with onConflict: "id" ensures no duplicates if somehow called twice
    const { error: userErr } = await sb.from("users").upsert({
      id:         user_id,
      name:       name.trim(),
      phone:      cleaned,
      dob,
      created_at: now,
    }, { onConflict: "id" });

    if (userErr) {
      console.error("User insert error:", userErr);
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }

    // ── Insert first visit row ────────────────────────────────────────────────
    const { error: visitErr } = await sb.from("visits").insert({
      user_id,
      visited_at: now,
      user_agent: user_agent ?? "",
    });

    if (visitErr) {
      console.error("Visit insert error:", visitErr);
      // Don't fail the whole request for a visit log error
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── GET ?check=1&user_id=<id> ─────────────────────────────────────────────────
// Called on every page load by verifyUser() to check if the stored user_id
// still exists in the DB.  Returns 200 if found, 404 if deleted/missing.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const check  = searchParams.get("check");
    const userId = searchParams.get("user_id");

    if (check !== "1" || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sb = SB();
    const { data, error } = await sb
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("User check error:", error);
      // On DB error, return 200 to be conservative (avoid showing form on every error)
      return NextResponse.json({ exists: true }, { status: 200 });
    }

    if (!data) {
      // User deleted by admin — client should clear localStorage
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
