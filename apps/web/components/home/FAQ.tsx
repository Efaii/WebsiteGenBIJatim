"use client";

import { Fragment, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircleQuestion, ArrowRight } from "lucide-react";
import { FAQItem } from "@/types/home.types";

/**
 * Jawaban FAQ memakai penanda **tebal** (markdown bold) untuk menandai kata
 * kunci. Hanya penanda itu yang dipakai tabel faq, jadi alih-alih memasang
 * parser markdown penuh, teks dipecah pada pasangan **...** dan bagian
 * tebalnya dirender sebagai <strong> — sisa tampilan tidak berubah.
 */
const renderAnswer = (answer: string) =>
  answer.split(/(\*\*[^*]+\*\*)/g).map((bagian, index) =>
    bagian.startsWith("**") && bagian.endsWith("**") && bagian.length > 4 ? (
      <strong key={index} className="font-bold">
        {bagian.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{bagian}</Fragment>
    ),
  );

/**
 * FAQ Component
 *
 * Accordion: jawaban membuka tepat di bawah pertanyaannya, di dalam kartu yang
 * sama. Kolom kiri hanya berisi pengantar (ikon, judul, deskripsi) dan isinya
 * tetap sama dari awal sampai akhir — sebelumnya jawaban mengisi kartu di kolom
 * kiri dan kolom itu sticky, sehingga daftar pertanyaan terasa bergeser sendiri
 * saat halaman di-scroll.
 *
 * Tinggi panel dianimasikan oleh framer-motion (`height: 0 <-> auto`) supaya
 * tidak ada lompatan tata letak, dan durasinya menjadi 0 saat pengguna meminta
 * pengurangan gerak lewat `prefers-reduced-motion`.
 */
export const FAQ = ({ faqs }: { faqs: FAQItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const kurangiGerak = useReducedMotion();

  if (!faqs || faqs.length === 0) {
    return (
      <section className="relative bg-genbi-light py-24 md:py-28 lg:py-32 border-t border-genbi-line">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div className="mx-auto max-w-2xl rounded-card border border-genbi-line bg-white px-6 py-12 text-center shadow-sm md:px-10">
            <MessageCircleQuestion className="mx-auto mb-5 h-12 w-12 text-genbi-blue" />
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Informasi FAQ akan segera tersedia.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    /*
     * Latar sengaja dibedakan dari section Berita di atasnya (`bg-genbi-soft`,
     * #f8faff): sebelumnya FAQ memakai `bg-slate-50` (#f8fafc) yang nyaris
     * identik, sehingga batas section tidak terbaca dan kartu-kartunya terasa
     * mengambang di field yang sama. `bg-genbi-light` (#eef5ff) masih satu
     * keluarga biru dengan section lain, jadi graduasinya tetap nyambung.
     *
     * Garis rambut `border-t` di tepi atas menegaskan batas itu tanpa perlu
     * menambah elemen dekoratif baru.
     */
    <section className="py-24 md:py-28 lg:py-32 bg-genbi-light relative border-t border-genbi-line">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full lg:px-6 xl:px-10">
          {/* Kolom pengantar: statis, tidak ikut berubah saat pertanyaan dibuka. */}
          <div className="lg:col-span-5 mb-10 lg:mb-0">
            <div className="flex flex-col">
              <div className="w-16 h-16 bg-white text-genbi-blue rounded-thumb flex items-center justify-center mb-6 shadow-sm border border-genbi-haze/50">
                <MessageCircleQuestion className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
                Punya Pertanyaan? <br />
                <span className="text-genbi-blue">Temukan Jawabannya</span>
              </h2>
              <p className="text-lg text-slate-900 leading-relaxed max-w-lg">
                Kami telah merangkum beberapa pertanyaan yang paling sering
                diajukan seputar Beasiswa Bank Indonesia dan komunitas GenBI.
              </p>
            </div>
          </div>

          {/*
           * Satu panel putih dengan sekat garis rambut — bukan lima kartu
           * ber-shadow yang masing-masing terasa mengambang. Baris yang terbuka
           * ditandai tint biru tipis + teks biru, jadi blok biru penuh tidak
           * lagi diperlukan dan tidak ada kartu di dalam kartu.
           */}
          <div className="lg:col-span-7 lg:pl-10">
            <div className="overflow-hidden rounded-card border border-genbi-line bg-white shadow-sm">
              <div className="divide-y divide-genbi-line">
                {faqs.map((faq, index) => {
                  const terbuka = openIndex === index;
                  return (
                    <div
                      key={`faq-${index}`}
                      className={`transition-colors duration-300 ${
                        terbuka ? "bg-genbi-light" : "bg-white hover:bg-genbi-soft"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(terbuka ? null : index)}
                        aria-expanded={terbuka}
                        aria-controls={`faq-panel-${index}`}
                        className="w-full group flex items-center justify-between gap-4 p-5 lg:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-genbi-blue active:scale-[0.995] transition-transform duration-150 motion-reduce:transition-none cursor-pointer"
                      >
                        <span
                          className={`text-base lg:text-lg font-semibold leading-snug pr-2 transition-colors duration-300 ${
                            terbuka ? "text-genbi-blue" : "text-slate-900 group-hover:text-genbi-blue"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <span
                          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                            terbuka
                              ? "bg-genbi-blue text-white"
                              : "bg-slate-50 text-slate-400 group-hover:bg-genbi-light group-hover:text-genbi-blue"
                          }`}
                        >
                          <ArrowRight
                            className={`w-5 h-5 transition-transform duration-300 motion-reduce:transition-none ${
                              terbuka ? "rotate-90" : "-rotate-45"
                            }`}
                            strokeWidth={2}
                          />
                        </span>
                      </button>

                      <motion.div
                        id={`faq-panel-${index}`}
                        aria-hidden={!terbuka}
                        initial={false}
                        animate={{ height: terbuka ? "auto" : 0 }}
                        transition={
                          kurangiGerak
                            ? { duration: 0 }
                            : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
                        }
                        className="overflow-hidden bg-white"
                      >
                        <div className="border-t border-genbi-line px-5 lg:px-6 py-5 lg:py-6">
                          <div className="text-slate-900 text-[15px] lg:text-base leading-relaxed whitespace-pre-line">
                            {renderAnswer(faq.answer)}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
