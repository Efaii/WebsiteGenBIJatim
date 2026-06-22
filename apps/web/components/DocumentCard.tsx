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
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
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
        className="p-6 h-full bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 group hover:-translate-y-1 hover:border-blue-300 relative overflow-hidden"
      >
        <div className="flex items-start justify-between mb-6">
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform duration-300 bg-white",
              style.bg,
              style.border,
              style.color
            )}
          >
            {style.icon}
          </div>
          <div className="px-3 py-1 rounded-lg text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500">
            {fileType}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
          {title}
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>{date}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{size}</span>
          </div>
          <div
            className="p-1.5 rounded-full hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
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
