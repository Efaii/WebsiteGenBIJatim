"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  CheckCircle,
  Target,
  Trophy,
  Image as ImageIcon,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/Button";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProkerData {
  id: number;
  title: string;
  status: string;
  date: string;
  description: string;
  description_long?: string; // Richer description
  objectives?: string[]; // Tujuan
  benefits?: string[]; // Manfaat
  gallery?: string[]; // Array of image URLs
  documentation?: string;
  newsUrl?: string; // Link to news article
}

interface ProkerDetailModalProps {
  item: ProkerData;
  onClose: () => void;
  contextTitle?: string;
}

export const ProkerDetailModal = ({
  item,
  onClose,
  contextTitle = "Detail Program Kerja",
}: ProkerDetailModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f172a] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 flex items-end p-8 flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md border border-white/5 z-20"
          >
            <X size={20} />
          </button>

          {/* Title & Badge */}
          <div className="relative z-10 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-cyan-300 backdrop-blur-md">
                {contextTitle}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
                  item.status === "Completed"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : item.status === "On-going"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse"
                    : "bg-blue-500/10 text-blue-300 border-blue-500/20"
                )}
              >
                {item.status}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
              {item.title}
            </h2>
            <div className="flex items-center gap-2 text-blue-200/80 text-sm">
              <Calendar size={16} />
              <span>{item.date}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]">
          <div className="p-8 space-y-8">
            {/* 1. Description & Main Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Description */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                    Deskripsi Kegiatan
                  </h3>
                  <p className="text-blue-100/80 leading-relaxed whitespace-pre-line">
                    {item.description_long || item.description}
                  </p>
                </div>

                {/* Gallery Preview (If any) */}
                {item.gallery && item.gallery.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <ImageIcon size={20} className="text-cyan-400" />
                      Galeri Kegiatan
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {item.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group"
                        >
                          <Image
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-blue-950/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Objectives & Benefits */}
              <div className="space-y-6">
                {/* Objectives */}
                {item.objectives && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <Target size={16} className="text-cyan-400" />
                      Tujuan
                    </h3>
                    <ul className="space-y-3">
                      {item.objectives.map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-blue-100/70"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0"></span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {item.benefits && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <Trophy size={16} className="text-yellow-400" />
                      Output / Manfaat
                    </h3>
                    <ul className="space-y-3">
                      {item.benefits.map((ben, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-blue-100/70"
                        >
                          <CheckCircle
                            size={14}
                            className="text-green-400 mt-0.5 flex-shrink-0"
                          />
                          {ben}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#0f172a]/50 backdrop-blur-xl flex justify-end gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-blue-200 hover:text-white"
          >
            Tutup
          </Button>
          {item.newsUrl && (
            <Button
              variant="outline"
              className="gap-2 border-white/20 hover:bg-white/10"
              onClick={() => {
                window.open(item.newsUrl, "_blank");
              }}
            >
              <Newspaper size={16} />
              Baca Liputan
            </Button>
          )}
          {item.documentation && (
            <Button
              variant="primary"
              className="shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              onClick={() => {
                window.open(item.documentation, "_blank");
              }}
            >
              Lihat Dokumentasi Lengkap
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
