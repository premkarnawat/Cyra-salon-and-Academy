"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import type { GalleryItem } from "@/types";

const FALLBACK_GALLERY: GalleryItem[] = [
  { id:"g1", title:"Balayage",    media_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",  media_type:"image", sort_order:1, is_active:true, created_at:"" },
  { id:"g2", title:"Keratin",     media_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=800&q=80",  media_type:"image", sort_order:2, is_active:true, created_at:"" },
  { id:"g3", title:"Styling",     media_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80",  media_type:"image", sort_order:3, is_active:true, created_at:"" },
  { id:"g4", title:"Colour",      media_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",  media_type:"image", sort_order:4, is_active:true, created_at:"" },
  { id:"g5", title:"Spa",         media_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&q=80",  media_type:"image", sort_order:5, is_active:true, created_at:"" },
  { id:"g6", title:"Blowout",     media_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",  media_type:"image", sort_order:6, is_active:true, created_at:"" },
  { id:"g7", title:"Bridal",      media_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80",  media_type:"image", sort_order:7, is_active:true, created_at:"" },
  { id:"g8", title:"Highlights",  media_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",  media_type:"image", sort_order:8, is_active:true, created_at:"" },
];

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  const list = gallery.length ? gallery : FALLBACK_GALLERY;
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  return (
    <>
      <section id="gallery" className="py-20 md:py-28 bg-[var(--cream-50)] dark:bg-[var(--dark-900)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <SectionHeader
              tag="📸 Transformations"
              title={<>Our <em className="text-[var(--gold-light)]">Gallery</em></>}
              subtitle="Real results from real clients at Cyra"
            />
          </FadeIn>

          {/* Masonry grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
            {list.map((item, i) => (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-xl mb-3 md:mb-4 break-inside-avoid cursor-pointer group border border-[var(--border-light)] hover:shadow-gold transition-all duration-300 ${i % 5 === 0 ? "row-span-2" : ""}`}
                style={{ aspectRatio: i % 3 === 0 ? "3/4" : "1/1" }}
                onClick={() => setLightbox(item)}
              >
                {item.media_type === "video" ? (
                  <div className="relative w-full h-full bg-[var(--dark-700)]">
                    <video src={item.media_url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30">
                        <Play size={18} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.media_url}
                    alt={item.title || "Gallery"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                )}

                {/* Hover label */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
                  {item.title && (
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold-light)] font-medium">
                      {item.title}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.media_type === "video" ? (
                <video
                  src={lightbox.media_url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  controlsList="nodownload"
                />
              ) : (
                <div className="relative w-full aspect-[4/3]">
                  <Image src={lightbox.media_url} alt={lightbox.title || ""} fill className="object-contain" unoptimized />
                </div>
              )}
            </motion.div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-[var(--gold)]/70 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
