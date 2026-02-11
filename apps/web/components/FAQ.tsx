"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideUp } from "./MotionWrapper";
import { SectionHeader } from "./SectionHeader";

const faqs = [
  {
    question: "Apakah semua mahasiswa di Jawa Timur bisa mendaftar?",
    answer:
      "Beasiswa Bank Indonesia (KPw Jatim) dikhususkan bagi mahasiswa jenjang S1/D3/D4 di 9 Perguruan Tinggi Mitra: ITS, UNAIR, UINSA, UNESA, UPN Veteran Jatim, PENS, UTM, UIN MADURA, dan UNUGIRI. Pastikan kampusmu termasuk dalam daftar mitra kami.",
  },
  {
    question: "Apa keuntungan menjadi anggota GenBI selain bantuan dana?",
    answer:
      "Tentu! Selain bantuan pendidikan, benefit terbesar adalah tergabung dalam komunitas GenBI. Kamu akan mendapatkan pelatihan kepemimpinan eksklusif, perluasan jejaring profesional, serta kesempatan berkontribusi langsung dalam berbagai proyek sosial bersama Bank Indonesia.",
  },
  {
    question: "Apa perbedaan Beasiswa Reguler dan Unggulan?",
    answer:
      "Beasiswa Unggulan biasanya memiliki persyaratan IPK yang lebih tinggi, kemampuan bahasa Inggris yang baik (TOEFL/IELTS), dan track record prestasi yang kuat. Penerima Beasiswa Unggulan juga sering dilibatkan dalam event-event berskala internasional.",
  },
  {
    question: "Bagaimana tahapan seleksi beasiswa ini?",
    answer:
      "Proses seleksi terdiri dari dua tahap utama: 1) Seleksi Administrasi di tingkat Perguruan Tinggi (Pemberkasan), dan 2) Seleksi Wawancara langsung oleh user dari Bank Indonesia. Keduanya harus dilalui untuk dinyatakan lolos.",
  },
  {
    question: "Kapan periode pendaftaran biasanya dibuka?",
    answer:
      "Siklus pendaftaran umumnya dibuka pada awal tahun (Februari - Maret). Namun, jadwal spesifik bisa berbeda tiap kampus. Kami sarankan untuk selalu memantau Instagram @genbi_jatim dan Biro Kemahasiswaan kampus masing-masing.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <div className="container px-6 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            title="Pertanyaan Umum"
            description="Seputar Beasiswa Bank Indonesia dan Komunitas GenBI."
          />

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) => {
  return (
    <FadeIn delay={index * 0.1}>
      <div className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/10">
        <button
          onClick={onClick}
          className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer"
        >
          <span
            className={`text-lg font-medium transition-colors duration-300 ${
              isOpen ? "text-cyan-400" : "text-white"
            }`}
          >
            {question}
          </span>
          <span
            className={`flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 ${
              isOpen
                ? "rotate-180 bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                : "text-white"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 text-blue-200/80 leading-relaxed border-t border-white/5 pt-4">
                {answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  );
};
