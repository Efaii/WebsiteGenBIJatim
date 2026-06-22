"use client";

import { Download, BookOpen, Presentation } from "lucide-react";
import { FadeIn } from "@/components/MotionWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { Document } from "@repo/types";

interface DocumentsProps {
  documents: Document[];
}

export function Documents({ documents }: DocumentsProps) {
  return (
    <section className="container mx-auto px-6 lg:px-8 xl:px-12 max-w-7xl relative z-10 mb-24">
      <FadeIn once>
        <SectionHeader
          title="Arsip & Dokumen Publik"
          description="Transparansi laporan pertanggungjawaban dan ketetapan organisasi."
          align="center"
        />
      </FadeIn>

      <div className="max-w-7xl mx-auto mt-12">
        {documents && documents.length > 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            {documents.map((doc, i) => (
              <div
                key={doc.id || i}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-50 transition-colors ${i !== documents.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div className="flex gap-4 items-center mb-4 sm:mb-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.type === "SK" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                  >
                    {doc.type === "SK" ? (
                      <Presentation className="w-6 h-6" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold tracking-tight text-slate-900 text-base mb-1">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="uppercase tracking-wider text-slate-400">
                        {doc.fileType || "PDF"}
                      </span>
                      <span>•</span>
                      <span>{doc.size || "Unknown Size"}</span>
                      <span>•</span>
                      <span>{doc.date || "Unknown Date"}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={doc.url?.startsWith('/uploads') 
                    ? `${process.env.NEXT_PUBLIC_API_URL}${doc.url}` 
                    : doc.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:-translate-y-2 transition-transform duration-200 ease-[cubic-bezier(0,0.55,0.45,1)] font-semibold py-2.5 px-6 rounded-[2rem] shadow-sm"
                >
                  <Download className="w-4 h-4" /> Unduh
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-700 mb-2">
              Dokumen Belum Tersedia
            </h3>
            <p className="text-slate-500 max-w-md">
              Arsip LPJ, SK, atau Proposal saat ini sedang dipersiapkan oleh
              administrator.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
