"use client";

import { FadeIn, SlideUp } from "./MotionWrapper";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  children?: React.ReactNode; // For custom content injected into description area
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
}: SectionHeaderProps) {
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

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
          <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase mb-3 block">
            {/* Global Rule: mb-3 for Eyebrow-to-Heading gap */}
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
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
                  "text-lg text-blue-200/80 leading-relaxed",
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
