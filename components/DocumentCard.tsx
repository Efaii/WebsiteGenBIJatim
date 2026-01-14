"use client";

import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/Card";

export interface DocumentCardProps {
  title: string;
  fileType: string;
  date: string;
  size: string;
  url?: string; // Optional download URL
  onClick?: () => void; // Optional custom click handler (e.g. preview)
  onDownload?: () => void; // Optional download handler (icon click)
}

export function DocumentCard({
  title,
  fileType,
  date,
  size,
  url,
  onClick,
  onDownload,
}: DocumentCardProps) {
  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "PDF":
        return {
          icon: <FileText className="w-6 h-6" />,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
        };
      case "XLSX":
      case "XLS":
        return {
          icon: <FileSpreadsheet className="w-6 h-6" />,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        };
      case "PPTX":
      case "PPT":
        return {
          icon: <Presentation className="w-6 h-6" />,
          color: "text-orange-400",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
        };
      case "ZIP":
      case "RAR":
        return {
          icon: <FileArchive className="w-6 h-6" />,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
        };
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        };
    }
  };

  const style = getFileIcon(fileType);

  return (
    <div
      onClick={
        onClick ||
        (() => {
          if (url) window.open(url, "_blank");
        })
      }
      className="block h-full cursor-pointer"
    >
      <Card
        variant="glass"
        className="p-6 h-full hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1 hover:border-cyan-500/30 relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform duration-300",
              style.bg,
              style.border,
              style.color
            )}
          >
            {style.icon}
          </div>
          <div className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-blue-200 backdrop-blur-sm">
            {fileType}
          </div>
        </div>

        <h3 className="font-bold text-white text-lg mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors leading-snug">
          {title}
        </h3>

        <div className="flex items-center justify-between text-xs text-blue-200/50 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span>{date}</span>
            <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
            <span>{size}</span>
          </div>
          <div
            className="p-1.5 rounded-full hover:bg-white/10 text-cyan-500/50 hover:text-cyan-400 transition-colors"
            onClick={(e) => {
              if (onDownload) {
                e.stopPropagation();
                onDownload();
              }
            }}
          >
            <Download className="w-4 h-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
