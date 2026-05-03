// Server Component — no "use client" directive
// All data fetched here at request time → full HTML sent to browser → SEO-friendly
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CONFIG } from "@/lib/constants";
import { HomeClient } from "@/app/_components/HomeClient";
import type { Banner, RateCard, GalleryItem, SiteConfig } from "@/types";

async function getConfig(): Promise<SiteConfig> {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("site_settings").select("key, value");
    if (error || !data) return DEFAULT_CONFIG as SiteConfig;
    const map: Record<string, string> = {};
    data.forEach(r => { map[r.key] = r.value; });
    return { ...DEFAULT_CONFIG, ...map } as SiteConfig;
  } catch {
    return DEFAULT_CONFIG as SiteConfig;
  }
}

async function getBanners(): Promise<Banner[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getRateCards(): Promise<RateCard[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("rate_cards")
      .select("id,title,file_url,file_type,sort_order,created_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getGallery(): Promise<GalleryItem[]> {
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("gallery")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // All 4 fetches run in parallel — fast, server-side, SEO-visible
  const [config, banners, rateCards, gallery] = await Promise.all([
    getConfig(),
    getBanners(),
    getRateCards(),
    getGallery(),
  ]);

  return (
    <HomeClient
      initialConfig={config}
      initialBanners={banners}
      initialRateCards={rateCards}
      initialGallery={gallery}
    />
  );
}
