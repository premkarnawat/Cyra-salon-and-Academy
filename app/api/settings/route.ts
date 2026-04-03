import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { DEFAULT_CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error) return NextResponse.json(DEFAULT_CONFIG);
    const config: Record<string,string> = {};
    data?.forEach(r => { config[r.key] = r.value; });
    return NextResponse.json({ ...DEFAULT_CONFIG, ...config });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const sb   = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const upserts = Object.entries(body).map(([key, value]) => ({
      key, value: String(value), updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from("site_settings").upsert(upserts, { onConflict: "key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
