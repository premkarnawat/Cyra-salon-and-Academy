import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getWhatsAppLink(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function getSupabaseImageUrl(path: string, bucket: string = "media"): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function starArray(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < rating);
}

export const WHATSAPP_MESSAGES = {
  offers:   "Heyy, I want to inquire about offers and packages 🌟",
  services: "Heyy, I want to inquire about rates and services 💇‍♀️",
  general:  "Heyy, I want to inquire about Cyra Salon ✨",
  booking:  (service: string) =>
    `Heyy, I want to book "${service}" at Cyra Salon. Please share availability 📅`,
};

// ── Legacy shims — keep these so existing imports don't break ─────────────────
// Real logic lives in lib/userTracking.ts
export { checkUser as isFormSubmitted } from "@/lib/userTracking";
