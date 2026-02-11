"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      primary:
        "relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-white backdrop-blur-md shadow-[0_8px_20px_-5px_rgba(6,182,212,0.2)] hover:shadow-[0_8px_25px_-5px_rgba(6,182,212,0.4)] hover:border-cyan-400/50 hover:from-cyan-500/30 hover:to-blue-600/30 transition-all duration-300",
      secondary:
        "bg-white/5 border border-white/10 text-blue-100 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-200/30 hover:text-white hover:shadow-lg transition-all duration-300",
      outline:
        "border border-white/20 text-blue-100 bg-transparent hover:bg-white/5 hover:border-white/40",
      ghost: "hover:bg-white/5 text-blue-200 hover:text-white",
    }

  const sizes = {
    sm: "h-8 px-3 text-xs tracking-wide",
    md: "h-10 px-5 py-2 text-sm tracking-wide",
    lg: "h-12 px-6 text-base tracking-wide",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
