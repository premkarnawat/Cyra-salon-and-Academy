import { NextResponse } from "next/server";
import { createClient as createSC } from "@supabase/supabase-js";

const SB = () => createSC(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id, user_agent } = await req.json();
    if (!user_id) return NextResponse.json({ ok: true }); // silently ignore

    await SB().from("visits").insert({
      user_id,
      visited_at: new Date().toISOString(),
      user_agent: user_agent ?? "",
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface errors to client — this is silent background logging
    return NextResponse.json({ ok: true });
  }
}
