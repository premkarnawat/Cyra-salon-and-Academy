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

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("cyra_session_id");
  if (!sid) {
    sid = generateSessionId();
    sessionStorage.setItem("cyra_session_id", sid);
  }
  return sid;
}

export function isFormSubmitted(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("cyra_form_submitted") === "true";
}

export function markFormSubmitted(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("cyra_form_submitted", "true");
}

export function starArray(rating: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < rating);
}

export const WHATSAPP_MESSAGES = {
  offers: "Heyy, I want to inquire about offers and packages 🌟",
  services: "Heyy, I want to inquire about rates and services 💇‍♀️",
  general: "Heyy, I want to inquire about Cyra Salon ✨",
  booking: (service: string) =>
    `Heyy, I want to book "${service}" at Cyra Salon. Please share availability 📅`,
};
