import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as sc } from "@supabase/supabase-js";

const SB = () => sc(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  if (!await getAuthUser(req)) {
    return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  }

  // Fetch all leads (unique users, deduplicated by phone)
  const { data: leads, error } = await SB()
    .from("leads")
    .select("*")
    .order("created_at", { ascending:false });

  if (error) return NextResponse.json({ error: error.message }, { status:500 });

  // Fetch visit records for each lead
  const { data: visits } = await SB()
    .from("lead_visits")
    .select("id, lead_id, visited_at, session_id")
    .order("visited_at", { ascending:false });

  // Group visits by lead_id
  const visitMap: Record<string, { id:string; visited_at:string; session_id?:string }[]> = {};
  for (const v of (visits || [])) {
    if (!visitMap[v.lead_id]) visitMap[v.lead_id] = [];
    visitMap[v.lead_id].push({ id:v.id, visited_at:v.visited_at, session_id:v.session_id });
  }

  // Attach visits array to each lead
  const enriched = (leads || []).map(l => ({
    ...l,
    visits: visitMap[l.id] || [],
  }));

  return NextResponse.json(enriched);
}

export async function DELETE(req: Request) {
  if (!await getAuthUser(req)) {
    return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  }
  const { id } = await req.json();
  // Delete visits first (FK constraint)
  await SB().from("lead_visits").delete().eq("lead_id", id);
  const { error } = await SB().from("leads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ success: true });
}
