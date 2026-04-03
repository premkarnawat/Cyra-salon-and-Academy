import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as sc } from "@supabase/supabase-js";
const SB = () => sc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  const sb = await createClient();
  const { data, error } = await sb.from("reviews").select("*").eq("is_active",true).order("sort_order",{ascending:true});
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
export async function POST(req: Request) {
  if (!await getAuthUser(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const body = await req.json();
  const { data, error } = await SB().from("reviews").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function PUT(req: Request) {
  if (!await getAuthUser(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { id, ...rest } = await req.json();
  const { data, error } = await SB().from("reviews").update(rest).eq("id",id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function DELETE(req: Request) {
  if (!await getAuthUser(req)) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { id } = await req.json();
  const { error } = await SB().from("reviews").delete().eq("id",id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success:true });
}
