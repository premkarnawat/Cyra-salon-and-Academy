"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";

/* ✅ SAFE FALLBACK */
const FALLBACK = [
  {
    id: "g1",
    title: "Balayage",
    media_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
    media_type: "image",
  },
  {
    id: "g2",
    title: "Keratin",
    media_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1200&q=80",
    media_type: "image",
  },
];

const AUTO_MS = 7000;
const SWIPE_MIN = 50;

export function GallerySection(props: any) {
  const gallery = props?.gallery || [];
  const list = Array.isArray(gallery) && gallery.length ? gallery : FALLBACK;
  const total = list.length;

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);

  const dragX = useMotionValue(0);

  /* ✅ FIXED TIMER (IMPORTANT) */
  const timer = useRef<any>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setDir(1);
      setCur((c: number) => (c + 1) % total);
    }, AUTO_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [resetTimer]);

  function goTo(next: number, direction: number) {
    setDir(direction);
    setCur((next + total) % total);
    resetTimer();
  }

  function onDragEnd(_: any, info: any) {
    if (info.offset.x < -SWIPE_MIN) goTo(cur + 1, 1);
    else if (info.offset.x > SWIPE_MIN) goTo(cur - 1, -1);

    animate(dragX, 0, { duration: 0.25 });
  }

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.45 },
    }),
    exit: (d: number) => ({
      x: d > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const item = list[cur];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <FadeIn>
          <SectionHeader
            tag="📸 Transformations"
            title={
              <>
                Our{" "}
                <em className="text-[var(--gold-light)] not-italic font-normal">
                  Gallery
                </em>
              </>
            }
            subtitle="Swipe to explore luxury transformations"
          />
        </FadeIn>

        <div className="rounded-3xl overflow-hidden border shadow-xl bg-[#F8F9FB]">

          {/* ✅ FIXED FRAME (NO CROPPING) */}
          <div className="relative w-full h-[70vh] sm:h-[85vh] flex items-center justify-center overflow-hidden">

            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={item.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={onDragEnd}
                style={{ x: dragX }}
                className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
              >

                {/* ✅ IMAGE FULL FIT */}
                <Image
                  src={item.media_url}
                  alt={item.title || "Gallery"}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Title */}
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-xl">{item.title}</p>
                </div>

                {/* Counter */}
                <div className="absolute bottom-5 right-5 bg-black/40 text-white text-xs px-3 py-1 rounded-full">
                  {cur + 1}/{total}
                </div>

                {/* Play icon */}
                {item.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={42} className="text-white" />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Dots */}
        <div className="mt-5 flex justify-center gap-2">
          {list.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => goTo(i, i > cur ? 1 : -1)}
              className={`rounded-full ${
                i === cur ? "w-8 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
