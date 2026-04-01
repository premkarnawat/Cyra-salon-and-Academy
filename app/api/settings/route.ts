import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CONFIG } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) return NextResponse.json(DEFAULT_CONFIG);

    const config: Record<string, string> = {};
    data?.forEach((row) => { config[row.key] = row.value; });
    return NextResponse.json({ ...DEFAULT_CONFIG, ...config });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("site_settings")
      .upsert(upserts, { onConflict: "key" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
