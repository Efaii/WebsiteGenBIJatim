"use client";

import { FadeIn, SlideUp } from "./MotionWrapper";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center" | "right";
  /**
   * Varian tema. `"dark"` adalah bawaan supaya halaman yang sudah memakainya
   * (mis. /profil) tidak berubah. `"light"` dipakai di atas latar terang:
   * eyebrow memakai aksen biru, judul near-black, deskripsi abu tua.
   */
  tone?: "light" | "dark";
  className?: string;
  children?: React.ReactNode; // For custom content injected into description area
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
  className,
  children,
}: SectionHeaderProps) {
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  const nada = {
    dark: {
      eyebrow: "text-cyan-400",
      title: "text-white",
      description: "text-blue-200/80",
    },
    light: {
      eyebrow: "text-genbi-blue",
      title: "text-slate-900",
      description: "text-slate-600",
    },
  }[tone];

  return (
    <div
      className={cn(
        "flex flex-col mb-12 relative z-10 max-w-4xl", // Global Rule: mb-12 for header-to-content gap (Matched to FAQ)
        alignClass[align],
        className
      )}
    >
      <FadeIn once={false}>
        {eyebrow && (
          <span className={cn("font-bold tracking-widest text-sm uppercase mb-3 block", nada.eyebrow)}>
            {/* Global Rule: mb-3 for Eyebrow-to-Heading gap */}
            {eyebrow}
          </span>
        )}
        <h2 className={cn("text-3xl md:text-4xl font-bold tracking-tight leading-tight", nada.title)}>
          {/* Global Rule: text-3xl md:text-4xl for all Section Headings */}
          {title}
        </h2>
      </FadeIn>

      {(description || children) && (
        <SlideUp once={false} delay={0.2} className="w-full">
          <div className="mt-6">
            {/* Global Rule: mt-6 for Heading-to-Description gap */}
            {description && (
              <p
                className={cn(
                  "text-lg leading-relaxed",
                  nada.description,
                  align === "center" && "mx-auto max-w-2xl"
                )}
              >
                {description}
              </p>
            )}
            {children}
          </div>
        </SlideUp>
      )}
    </div>
  );
}
