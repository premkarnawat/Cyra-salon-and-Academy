import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as createSC } from "@supabase/supabase-js";

const SB = () => createSC(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  if (!await getAuthUser(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all users
  const { data: users, error: usersErr } = await SB()
    .from("users")
    .select("id, name, phone, dob, created_at")
    .order("created_at", { ascending: false });

  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 });

  // Fetch all visits
  const { data: visits } = await SB()
    .from("visits")
    .select("id, user_id, visited_at, user_agent")
    .order("visited_at", { ascending: false });

  // Group visits by user_id
  const visitMap: Record<string, { id: string; visited_at: string; user_agent?: string }[]> = {};
  for (const v of (visits ?? [])) {
    if (!visitMap[v.user_id]) visitMap[v.user_id] = [];
    visitMap[v.user_id].push({ id: v.id, visited_at: v.visited_at, user_agent: v.user_agent });
  }

  // Attach visits to each user
  const result = (users ?? []).map(u => ({
    ...u,
    visit_count:   visitMap[u.id]?.length ?? 0,
    last_visit_at: visitMap[u.id]?.[0]?.visited_at ?? u.created_at,
    visits:        visitMap[u.id] ?? [],
  }));

  return NextResponse.json(result);
}

export async function DELETE(req: Request) {
  if (!await getAuthUser(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  // Delete visits first (FK)
  await SB().from("visits").delete().eq("user_id", id);
  const { error } = await SB().from("users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
