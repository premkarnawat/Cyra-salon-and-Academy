import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Use service role so we can upsert + query freely
const sb = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, dob, session_id } = body;

    if (!name || !contact || !dob) {
      return NextResponse.json(
        { error: "Name, contact, and date of birth are required." },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned    = contact.replace(/\D/g, "").replace(/^91/, "");
    if (!phoneRegex.test(cleaned)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const supabase  = sb();
    const now       = new Date().toISOString();

    // Check if user already exists by phone
    const { data: existing } = await supabase
      .from("leads")
      .select("id, visit_count, last_visit_at")
      .eq("contact", cleaned)
      .maybeSingle();

    if (existing) {
      // Returning user — increment visit count, update last_visit_at
      await supabase
        .from("leads")
        .update({
          visit_count:   (existing.visit_count || 1) + 1,
          last_visit_at: now,
          // Also update name in case they filled differently
          name:          name.trim(),
        })
        .eq("id", existing.id);

      // Insert into visits table for full visit history
      await supabase.from("lead_visits").insert({
        lead_id:    existing.id,
        session_id: session_id || null,
        visited_at: now,
      });

      return NextResponse.json({ success: true, returning: true });
    }

    // New user — insert main lead row
    const { data: inserted, error: insertError } = await supabase
      .from("leads")
      .insert({
        name:          name.trim(),
        contact:       cleaned,
        dob,
        session_id:    session_id || null,
        visit_count:   1,
        last_visit_at: now,
        created_at:    now,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Lead insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // First visit record
    await supabase.from("lead_visits").insert({
      lead_id:    inserted.id,
      session_id: session_id || null,
      visited_at: now,
    });

    return NextResponse.json({ success: true, returning: false });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
