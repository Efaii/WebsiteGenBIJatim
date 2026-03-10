"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Button Component
 * * Purpose: Atomic interaction primitive for all navigation and conversion surfaces.
 * Architecture:
 * - Variants: `primary` (Solid Blue), `white` (White/Dark Text for CTA), `outline` (Bordered), `ghost` (Minimal).
 * - Sizes: `sm`, `md`, `lg`, `xl` (Landing page hero/CTA scale).
 * - Integration: Uses `cn()` for deterministic class merging with consumer overrides.
 */

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "white" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-md shadow-blue-900/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]",
    secondary:
      "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900",
    white:
      "bg-white text-slate-900 shadow-lg hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98]",
    outline:
      "bg-transparent border border-slate-300 text-slate-900 hover:bg-slate-50 hover:text-blue-700 hover:border-slate-400",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs tracking-wide",
    md: "h-10 px-5 py-2 text-sm tracking-wide",
    lg: "h-12 px-6 text-base tracking-wide",
    xl: "h-auto px-4 lg:px-8 py-3.5 text-[13px] lg:text-base font-bold tracking-wide",
  };

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
