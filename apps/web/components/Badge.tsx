import { cn } from "@/lib/utils";
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
}

export const Badge = ({
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  const variants = {
    default:
      "border-transparent bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20",
    secondary: "border-transparent bg-white/10 text-white hover:bg-white/20",
    destructive:
      "border-transparent bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
    outline: "text-white border-white/20 hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
};
