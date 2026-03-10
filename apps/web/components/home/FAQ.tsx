"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem, BlurIn } from "../MotionWrapper";
import { SectionHeader } from "../SectionHeader";
import { Plus, MessageCircleQuestion, Info, ArrowRight, X } from "lucide-react";
import { FAQItem } from "@/types/home.types";
import { cn } from "@/lib/utils";

/**
 * FAQ Component
 * * Purpose: Provides an interactive support interface with a dual-logic system.
 * Architecture:
 * - Desktop View: Uses a split-view master-detail pattern with a sticky navigation sidebar.
 * - Mobile View: Employs a high-performance bottom sheet (drawer) for contextual answers.
 * - Performance: Hardware-accelerated transitions via GPU transform to prevent reflow lag.
 */
export const FAQ = ({ faqs }: { faqs: FAQItem[] }) => {
  if (!faqs || faqs.length === 0) return null;

  /* --- COMPONENT STATE MANAGEMENT --- */
  // Separated indices to prevent UI conflicts between responsive breakpoints
  const [activeMasterIndex, setActiveMasterIndex] = useState<number | null>(
    null,
  );
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(
    null,
  );

  /* --- SIDE EFFECTS & LIFECYCLE --- */
  // Manages UX consistency by locking background scrolling when mobile overlays are active
  useEffect(() => {
    if (mobileActiveIndex !== null && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileActiveIndex]);

  return (
    <section className="py-16 md:py-24 bg-slate-50 relative">
      {/* --- CONTENT ARCHITECTURE WRAPPER --- */}
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full lg:px-6 xl:px-10">
          {/* --- NARRATIVE & DETAIL PREVIEW COLUMN --- */}
          <div className="lg:col-span-5 relative h-full">
            {/* Sticky behavior ensures information remains accessible during scroll */}
            <div className="lg:sticky lg:top-24 xl:top-32 flex flex-col">
              {/* MOBILE VIEWPORT HEADER */}
              <div className="lg:hidden mb-12 flex flex-col items-start text-left">
                <FadeIn delay={0.1} amount={0.1}>
                  <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100/50">
                    <MessageCircleQuestion className="w-8 h-8" />
                  </div>
                </FadeIn>
                <FadeIn delay={0.2} amount={0.1}>
                  <h2 className="h2 text-slate-900 mb-6">
                    Punya Pertanyaan? <br />
                    <span className="text-blue-600">Temukan Jawabannya</span>
                  </h2>
                </FadeIn>
                <FadeIn delay={0.3} amount={0.1}>
                  <p className="text-lg leading-relaxed text-slate-600">
                    Kami telah merangkum beberapa pertanyaan yang paling sering diajukan seputar Beasiswa Bank Indonesia.
                  </p>
                </FadeIn>
              </div>

              {/* DESKTOP VIEWPORT DETAIL PANEL */}
              <div className="hidden lg:block relative w-full">
                <AnimatePresence mode="wait">
                  {activeMasterIndex === null ? (
                    /* Default state: Instructions and context */
                    <div className="w-full flex flex-col">
                      <FadeIn delay={0.1} amount={0.1}>
                        <div className="w-16 h-16 bg-white text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100/50">
                          <MessageCircleQuestion className="w-8 h-8" />
                        </div>
                      </FadeIn>
                      <FadeIn delay={0.2} amount={0.1}>
                        <h2 className="h2 text-slate-900 mb-6">
                          Punya Pertanyaan? <br />
                          <span className="text-blue-600">
                            Temukan Jawabannya
                          </span>
                        </h2>
                      </FadeIn>
                      <FadeIn delay={0.3} amount={0.1}>
                        <p className="text-lg leading-relaxed text-slate-600 mb-6">
                          Kami telah merangkum beberapa pertanyaan yang paling sering diajukan seputar Beasiswa Bank Indonesia dan komunitas GenBI.
                        </p>
                      </FadeIn>
                      <FadeIn delay={0.4} amount={0.1}>
                        <div className="inline-flex items-center gap-4 p-4 pr-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm text-blue-800">
                          <div className="w-10 h-10 bg-slate-100 rounded-full shadow-sm flex items-center justify-center shrink-0">
                            <ArrowRight className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-900">
                              Interaksi Tersedia
                            </p>
                            <p className="text-sm font-medium text-blue-700">
                              Pilih pertanyaan di kanan untuk melihat detail
                            </p>
                          </div>
                        </div>
                      </FadeIn>
                    </div>
                  ) : (
                    /* Active state: Dynamic answer rendering */
                    <motion.div
                      key={`detail-view-${activeMasterIndex}`}
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col w-full max-h-[calc(100vh-12rem)] overflow-hidden"
                    >
                      <div className="px-6 lg:px-8 py-6 shrink-0 border-b border-slate-200 bg-white z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm border border-blue-100/50 shrink-0">
                            <MessageCircleQuestion className="w-6 h-6" />
                          </div>
                          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
                            {faqs[activeMasterIndex].question}
                          </h3>
                        </div>
                      </div>
                      <div className="px-6 lg:px-8 py-6 overflow-y-auto flex-1 relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors">
                        <div className="text-slate-600 text-base lg:text-lg leading-relaxed whitespace-pre-line">
                          {faqs[activeMasterIndex].answer}
                        </div>
                      </div>
                      <div className="px-6 lg:px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 mt-auto">
                        <button
                          onClick={() => setActiveMasterIndex(null)}
                          className="text-slate-900 hover:text-blue-600 font-bold transition-colors flex items-center gap-2 text-sm cursor-pointer"
                        >
                          &larr; Kembali
                        </button>
                        <a
                          href="https://instagram.com/genbi_jatim"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Tanya via DM <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* --- INTERACTIVE FAQ LIST COLUMN --- */}
          <div className="lg:col-span-7 lg:pl-10">
            {/* MOBILE LIST: Sequential vertical cards */}
            <div className="lg:hidden space-y-4">
                {faqs.map((faq, index) => (
                  <FadeIn key={`mobile-${index}`} amount={0.1} delay={0.1 + index * 0.05}>
                    <button
                      onClick={() => setMobileActiveIndex(index)}
                      className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-200/80 shadow-md shadow-slate-200/50 active:bg-blue-600 active:text-white transition-colors text-left"
                    >
                      <span className="font-bold text-[15px] text-slate-800 pr-4 leading-snug flex-1 transition-colors">
                        {faq.question}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <div className="relative">
                          <ArrowRight
                            className="w-5 h-5 transform-gpu origin-center -rotate-45 translate-x-[1px] transition-transform duration-500"
                            strokeWidth={2}
                          />
                        </div>
                      </div>
                    </button>
                  </FadeIn>
                ))}
            </div>

            {/* DESKTOP LIST: Navigation cards triggering detail view updates */}
            <div className="hidden lg:block space-y-4">
                {faqs.map((faq, index) => (
                  <FadeIn key={`desktop-${index}`} amount={0.1} delay={0.45 + index * 0.05}>
                    <button
                      onClick={() => setActiveMasterIndex(index)}
                      className="w-full text-left focus:outline-none cursor-pointer group block"
                    >
                      <div
                        className={cn(
                          "w-full rounded-[2rem] overflow-hidden transition-[background-color,border-color,color,box-shadow,transform] duration-300 flex items-center justify-between p-6 transform-gpu will-change-transform",
                          activeMasterIndex === index
                            ? "bg-blue-600 border border-blue-600 shadow-xl shadow-blue-600/20 text-white"
                            : "bg-white border border-slate-200/80 group-hover:bg-slate-100 group-hover:border-blue-200 group-hover:shadow-xl group-hover:translate-x-1 group-hover:-translate-y-1"
                        )}
                      >
                        <span
                          className={cn(
                            "text-lg font-semibold transition-colors duration-300 pr-4 leading-snug",
                            activeMasterIndex === index ? "text-white" : "text-slate-800 group-hover:text-blue-600"
                          )}
                        >
                          {faq.question}
                        </span>
                        <span
                          className={cn(
                            "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300",
                            activeMasterIndex === index
                              ? "bg-white text-blue-600 shadow-inner"
                              : "bg-slate-100 text-blue-600 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-100",
                          )}
                        >
                          <div className="relative">
                            <ArrowRight
                              className={cn(
                                "w-5 h-5 transform-gpu origin-center transition-transform duration-500",
                                activeMasterIndex === index
                                  ? "translate-x-0 rotate-0"
                                  : "translate-x-[1px] -rotate-45",
                              )}
                              strokeWidth={2}
                            />
                          </div>
                        </span>
                      </div>
                    </button>
                  </FadeIn>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- RESPONSIVE BOTTOM SHEET OVERLAY --- */}
      {/* --- PERSISTENT MOBILE BOTTOM SHEET --- */}
      <div
        className={cn(
          "fixed inset-0 z-[150] lg:hidden flex flex-col justify-end transition-[opacity,visibility] duration-300",
          mobileActiveIndex !== null
            ? "pointer-events-auto"
            : "pointer-events-none",
        )}
      >
        {/* Optimized Backdrop: Hardware-accelerated with transform-gpu */}
        <div
          onClick={() => setMobileActiveIndex(null)}
          className={cn(
            "absolute inset-0 bg-slate-900/60 backdrop-blur-[4px] transform-gpu transition-opacity duration-300",
            mobileActiveIndex !== null ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Answer Panel: Implements high-fidelity spring physics via CSS */}
        <div
          style={{ willChange: "transform" }}
          className={cn(
            "relative bg-slate-100 rounded-t-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform-gpu transition-transform duration-500",
            // Smoother out-cubic easing to prevent jumping/overshooting
            "ease-[cubic-bezier(0.215,0.61,0.355,1)]",
            mobileActiveIndex !== null ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Visual affordance for drag behavior */}
          <div className="w-full flex justify-center my-4 shrink-0">
            <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
          </div>

          {/* Panel Functional Header */}
          <div className="px-6 mb-4 pb-4 border-b border-slate-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                Detail Jawaban
              </span>
            </div>
            <button
              onClick={() => setMobileActiveIndex(null)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-transform"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Narrative Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="mb-6 p-5 bg-blue-600 border border-blue-300 rounded-[2rem] relative overflow-hidden">
              <p className="text-white font-bold text-[17px] leading-snug relative z-10">
                {mobileActiveIndex !== null && faqs[mobileActiveIndex]
                  ? faqs[mobileActiveIndex].question
                  : faqs[0]?.question}
              </p>
            </div>

            <div className="text-slate-600 text-base leading-relaxed whitespace-pre-line px-1 mb-6">
              {mobileActiveIndex !== null && faqs[mobileActiveIndex]
                ? faqs[mobileActiveIndex].answer
                : faqs[0]?.answer}
            </div>

            {/* Direct Conversion / External Support Link */}
            <div className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">
                  Masih Bingung?
                </span>
                <span className="text-[10px] text-slate-900 font-medium">
                  Tanya via DM Instagram
                </span>
              </div>
              <a
                href="https://instagram.com/genbi_jatim"
                target="_blank"
                className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
              >
                <ArrowRight size={18} strokeWidth={2} className="transform-gpu origin-center" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
