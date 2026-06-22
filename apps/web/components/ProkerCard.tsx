import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/Card";
import { cn, getAssetUrl } from "@/lib/utils";
import {
  Calendar,
  Tag,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export interface ProkerCardProps {
  title: string;
  status: "Upcoming" | "On-going" | "Completed" | string;
  category?: "Mingguan" | "Bulanan" | "Agenda" | "Project" | string;
  date: string;
  description: string;
  image?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function ProkerCard({
  title,
  status,
  category,
  date,
  description,
  image,
  onClick,
  href,
  className,
}: ProkerCardProps) {
  // Date Formatting Logic: Handles "Feb 2025" (2 parts) vs "10 Jan 2025" (3 parts) vs "Menyusul"
  const dateParts = (date || "").split(" ");
  const isFullDate = dateParts.length >= 2;
  const mainDate = dateParts[0] || "PROKER"; 
  const subDate = isFullDate ? dateParts.slice(1).join(" ") : "";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-emerald-500 bg-emerald-50 border-emerald-100";
      case "On-going":
        return "text-cyan-500 bg-cyan-50 border-cyan-100";
      default:
        return "text-blue-500 bg-blue-50 border-blue-100";
    }
  };

  const CardWrapper = (
    <div
      onClick={!href ? onClick : undefined}
      className={cn(
        "flex flex-col w-full h-full group overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-200 hover:bg-white hover:border-blue-200 shadow-sm hover:shadow-lg transition-[transform,box-shadow,background-color,border-color] duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] transform-gpu",
        (onClick || href) && "cursor-pointer",
        className,
      )}
    >
      {/* Image Section - Standard aspect-video */}
      <div className="relative w-full aspect-video bg-white overflow-hidden shrink-0">
        {getAssetUrl(image) ? (
          <Image
            src={getAssetUrl(image)!}
            alt={title}
            fill
            unoptimized
            className="object-cover group-hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8 opacity-20 bg-slate-100"
          >
            <div className="w-full h-full border-2 border-dashed border-current rounded-xl" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {category && (
            <span className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-white rounded-full uppercase shadow-sm">
              {category}
            </span>
          )}
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase shadow-sm flex items-center gap-1.5 bg-white transition-colors duration-300",
              status === "Completed" ? "text-emerald-600" :
              status === "On-going" ? "text-cyan-600" : "text-blue-600"
            )}
          >
            {status === "On-going" && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
              </span>
            )}
            {status === "Completed" && (
              <CheckCircle2 size={11} className="text-emerald-600" />
            )}
            {status}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="flex items-center gap-2 text-slate-900 text-[11px] font-medium mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </div>
          <h3 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm line-clamp-2 mt-2 leading-relaxed text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex justify-between items-center border-t border-slate-300 pt-2 mt-2">
          <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
            Lihat Detail
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full h-full">
        {CardWrapper}
      </Link>
    );
  }

  return CardWrapper;
}
