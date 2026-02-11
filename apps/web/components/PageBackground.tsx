import React from "react";
import { cn } from "@/lib/utils";

interface PageBackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "intense";
}

export function PageBackground({
  className,
  variant = "default",
}: PageBackgroundProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0",
        className,
      )}
    >
      {/* Top Right Blob */}
      <div
        className={cn(
          "absolute top-0 right-0 rounded-full mix-blend-screen filter animate-blob opacity-30 bg-blue-500/10",
          variant === "subtle" && "w-[400px] h-[400px] blur-[80px] opacity-20",
          variant === "default" && "w-[600px] h-[600px] blur-[100px]",
          variant === "intense" &&
            "w-[800px] h-[800px] blur-[120px] opacity-40",
        )}
      ></div>

      {/* Bottom Left Blob */}
      <div
        className={cn(
          "absolute bottom-0 left-0 rounded-full mix-blend-screen filter animate-blob animation-delay-2000 opacity-30 bg-cyan-500/10",
          variant === "subtle" && "w-[300px] h-[300px] blur-[60px] opacity-20",
          variant === "default" && "w-[500px] h-[500px] blur-[100px]",
          variant === "intense" &&
            "w-[700px] h-[700px] blur-[120px] opacity-40",
        )}
      ></div>

      {/* Center/Extra Blob for Intense variant */}
      {variant === "intense" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>
      )}
    </div>
  );
}
