"use client";

import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";
import { GoldDivider } from "@/components/ui/GoldDivider";

interface AboutSectionProps {
  aboutText?: string;
  aboutImageUrl?: string;
}

export function AboutSection({ aboutText, aboutImageUrl }: AboutSectionProps) {
  if (!aboutText && !aboutImageUrl) return null;

  return (
    <section id="about" className="py-16 md:py-24 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* LEFT: Image */}
            {aboutImageUrl && (
              <div className="flex-shrink-0 flex flex-col items-center">
                {/* Textured background card */}
                <div
                  style={{
                    position: "relative",
                    padding: "10px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, rgba(191,160,106,0.18) 0%, rgba(212,180,131,0.08) 100%)",
                    border: "1px solid rgba(191,160,106,0.25)",
                    boxShadow: "0 8px 32px rgba(140,110,48,0.12)",
                  }}
                >
                  {/* Subtle dot texture overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "16px",
                      backgroundImage: "radial-gradient(circle, rgba(191,160,106,0.12) 1px, transparent 1px)",
                      backgroundSize: "12px 12px",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      width: "200px",
                      height: "240px",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={aboutImageUrl}
                      alt="About Cyra"
                      fill
                      className="object-cover object-top"
                      sizes="200px"
                      quality={90}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT: Text */}
            <div className="flex-1 text-center md:text-left">
              {/* Section tag */}
              <p
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "0.75rem",
                }}
              >
              </p>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  fontWeight: 400,
                  color: "#1F2937",
                  lineHeight: 1.15,
                  marginBottom: "1.25rem",
                }}
              >
                About <em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>Us</em>
              </h2>

              <GoldDivider className="mb-5 mx-auto md:mx-0" />

              {aboutText && (
                <p
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: "1rem",
                    color: "#4B5563",
                    lineHeight: 1.85,
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                  className="md:mx-0"
                >
                  {aboutText}
                </p>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
