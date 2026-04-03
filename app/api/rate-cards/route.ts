import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/authHelper";
import { createClient as createSC } from "@supabase/supabase-js";

const sc = () => createSC(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rate_cards")
      .select("id,title,file_url,file_type,sort_order,created_at")
      .order("sort_order",{ ascending:true }).order("created_at",{ ascending:true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const ct = req.headers.get("content-type") ?? "";
    let file_url="", file_type:"image"|"pdf"="image", title="", sort_order=0;

    if (ct.includes("multipart/form-data")) {
      const fd   = await req.formData();
      const file = fd.get("file") as File|null;
      title      = (fd.get("title") as string) || "";
      sort_order = Number(fd.get("sort_order") ?? 0);
      if (!file) return NextResponse.json({ error:"No file" }, { status:400 });
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!["jpg","jpeg","png","webp","pdf"].includes(ext))
        return NextResponse.json({ error:"Only JPG,PNG,WebP,PDF allowed" }, { status:400 });
      file_type = ext==="pdf" ? "pdf" : "image";
      const fn  = `rate-cards/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buf = new Uint8Array(await file.arrayBuffer());
      const { error:upErr } = await sc().storage.from("ratecard").upload(fn, buf, { contentType:file.type, upsert:false });
      if (upErr) return NextResponse.json({ error:upErr.message }, { status:500 });
      ({ data:{ publicUrl: file_url } } = sc().storage.from("ratecard").getPublicUrl(fn));
    } else {
      const body = await req.json();
      file_url=body.file_url; file_type=body.file_type??"image";
      title=body.title??""; sort_order=body.sort_order??0;
    }

    if (!file_url) return NextResponse.json({ error:"file_url required" }, { status:400 });
    const { data, error } = await sc().from("rate_cards").insert({ title, file_url, file_type, sort_order }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e:unknown) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { id, title, sort_order } = await req.json();
  if (!id) return NextResponse.json({ error:"id required" }, { status:400 });
  const updates: Record<string,unknown> = {};
  if (title!==undefined) updates.title=title;
  if (sort_order!==undefined) updates.sort_order=sort_order;
  const { data, error } = await sc().from("rate_cards").update(updates).eq("id",id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error:"Unauthorized" }, { status:401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error:"id required" }, { status:400 });
  const { data:card } = await sc().from("rate_cards").select("file_url").eq("id",id).single();
  if (card?.file_url) {
    const match = card.file_url.match(/\/ratecard\/(.+)$/);
    if (match?.[1]) await sc().storage.from("ratecard").remove([match[1]]);
  }
  const { error } = await sc().from("rate_cards").delete().eq("id",id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success:true });
}
