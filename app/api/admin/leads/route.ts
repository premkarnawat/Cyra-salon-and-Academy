import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as sc } from "@supabase/supabase-js";
const SB = () => sc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  if (!await getAuthUser(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { data, error } = await SB().from("leads").select("*").order("created_at",{ ascending:false });
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(req: Request) {
  if (!await getAuthUser(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { id } = await req.json();
  const { error } = await SB().from("leads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ success: true });
}
