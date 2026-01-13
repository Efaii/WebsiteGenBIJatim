"use client";

import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

export interface ProkerCardProps {
  title: string;
  status: "Upcoming" | "On-going" | "Completed" | string;
  date: string;
  description: string;
  onClick?: () => void;
  className?: string; // Allow minimal overrides
  actionLabel?: string; // Custom button text
  onAction?: (e: React.MouseEvent) => void; // Custom button action
  hideAction?: boolean; // Hide the button completely
}

export function ProkerCard({
  title,
  status,
  date,
  description,
  onClick,
  className,
  actionLabel,
  onAction,
  hideAction,
}: ProkerCardProps) {
  // Date Formatting Logic: Handles "Feb 2025" (2 parts) vs "10 Jan 2025" (3 parts)
  const dateParts = date.split(" ");
  const isFullDate = dateParts.length === 3;
  const mainDate = isFullDate ? dateParts[0] : dateParts[0]; // Day "10" OR Month "Feb"
  const subDate = isFullDate ? `${dateParts[1]} ${dateParts[2]}` : dateParts[1]; // "Jan 2025" OR "2025"

  // Status Styling Logic
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "On-going":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse";
      case "Upcoming":
      default:
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    }
  };

  return (
    <Card
      onClick={onClick}
      variant="glass"
      className={cn(
        "p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:border-cyan-500/30 transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-cyan-500/30 transition-colors">
        <span className="text-xs font-bold text-cyan-400 uppercase">
          {isFullDate ? subDate.split(" ")[0] : mainDate}
        </span>
        <span className="text-xl font-bold text-white">
          {isFullDate ? mainDate : subDate}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
              getStatusStyles(status)
            )}
          >
            {status}
          </span>
        </div>
        <p className="text-blue-100/70 text-sm leading-relaxed mb-4">
          {description}
        </p>
        {!hideAction && (
          <Button
            size="sm"
            variant={onAction ? "secondary" : "outline"}
            className="gap-2 text-xs h-8"
            onClick={(e) => {
              if (onAction) {
                e.stopPropagation();
                onAction(e);
              }
            }}
          >
            {actionLabel || "Lihat Detail"}
          </Button>
        )}
      </div>
    </Card>
  );
}
