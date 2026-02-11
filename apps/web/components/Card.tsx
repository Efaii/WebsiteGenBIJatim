import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({
  className = "",
  variant = "glass",
  children,
  ...props
}: CardProps & { variant?: "default" | "glass" | "outline" }) {
  const variants = {
    default: "bg-white text-foreground border border-border/50 shadow-sm",
    glass:
      "bg-white/5 backdrop-blur-md border border-white/10 text-white shadow-sm hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:-translate-y-1",
    outline: "bg-transparent border border-white/20 text-white",
  };

  return (
    <div
      className={`rounded-2xl transition duration-300 ease-out will-change-transform ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-2xl font-bold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
