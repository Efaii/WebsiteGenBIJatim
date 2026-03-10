"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** Rendering speed of the ticker */
  speed?: "slow" | "normal" | "fast";
  className?: string;
  /** Enables a fading white gradient mask on the left and right edges */
  fadeOverlay?: boolean;
}

/**
 * Reusable Infinite Marquee component utilizing CSS animations for perfect performance.
 * Duplicates its children to ensure a seamless looping effect.
 */
export const Marquee = ({
  children,
  speed = "normal",
  className,
  fadeOverlay = true,
}: MarqueeProps) => {
  const duration =
    speed === "slow" ? "60s" : speed === "fast" ? "15s" : "30s";

  return (
    <div className={cn("w-full relative overflow-hidden group [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]", className)}>
      <div 
        className="flex flex-none items-center gap-16 md:gap-24 pr-16 md:pr-24 animate-ticker will-change-transform transform-gpu group-hover:[animation-play-state:paused]"
        style={{ animationDuration: duration }}
      >
        {children}
        {children}
      </div>
    </div>
  );
};
