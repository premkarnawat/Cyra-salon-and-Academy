import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Basic phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = contact.replace(/\D/g, "").replace(/^91/, "");
    if (!phoneRegex.test(cleaned)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert({
      name: name.trim(),
      contact: cleaned,
      dob,
      session_id,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Lead insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
