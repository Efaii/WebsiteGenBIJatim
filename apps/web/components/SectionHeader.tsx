"use client";

import { FadeIn, SlideUp, BlurIn } from "./MotionWrapper";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center" | "right";
  variant?: "dark" | "light";
  className?: string;
  children?: React.ReactNode; // For custom content injected into description area
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  variant = "dark",
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
        className,
      )}
    >
      <div className="w-full">
        {eyebrow && (
          <FadeIn once={true}>
            <span className={cn(
              "font-bold tracking-widest text-sm uppercase mb-3 block",
              variant === "dark" ? "text-cyan-400" : "text-blue-600"
            )}>
              {/* Global Rule: mb-3 for Eyebrow-to-Heading gap */}
              {eyebrow}
            </span>
          </FadeIn>
        )}
        <BlurIn once={true}>
          <h2 className={cn(
            "h2",
            variant === "dark" ? "text-white" : "text-slate-900"
          )}>
            {/* Global Rule: h2 token for all Section Headings */}
            {title}
          </h2>
        </BlurIn>
      </div>

      {(description || children) && (
        <SlideUp once={true} delay={0.2} className="w-full">
          <div className="mt-6">
            {/* Global Rule: mt-6 for Heading-to-Description gap */}
            {description && (
              <p
                className={cn(
                  "text-lg leading-relaxed",
                  variant === "dark" ? "text-blue-200/80" : "text-slate-600",
                  align === "center" && "mx-auto max-w-2xl",
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
