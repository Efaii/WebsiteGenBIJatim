import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    let variantStyles = "";
    switch (variant) {
      case "default":
        variantStyles = "bg-blue-700 text-white hover:bg-blue-800";
        break;
      case "destructive":
        variantStyles = "bg-red-500 text-white hover:bg-red-600";
        break;
      case "outline":
        variantStyles =
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground";
        break;
      case "secondary":
        variantStyles =
          "bg-secondary text-secondary-foreground hover:bg-secondary/80";
        break;
      case "ghost":
        variantStyles = "hover:bg-slate-100 hover:text-slate-900";
        break;
      case "link":
        variantStyles = "text-primary underline-offset-4 hover:underline";
        break;
      default:
        variantStyles = "bg-blue-700 text-white hover:bg-blue-800";
    }

    let sizeStyles = "";
    switch (size) {
      case "default":
        sizeStyles = "h-10 px-4 py-2";
        break;
      case "sm":
        sizeStyles = "h-9 rounded-md px-3";
        break;
      case "lg":
        sizeStyles = "h-11 rounded-md px-8";
        break;
      case "icon":
        sizeStyles = "h-10 w-10";
        break;
      default:
        sizeStyles = "h-10 px-4 py-2";
    }

    return (
      <button
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
