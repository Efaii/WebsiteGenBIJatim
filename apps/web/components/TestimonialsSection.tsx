"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/Card";
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { SectionHeader } from "./SectionHeader";

const TESTIMONIALS = [
  {
    name: "Fathir Ainur Rochim",
    role: "GenBI 2019 • Analis Bank Indonesia",
    quote: "GenBI adalah inkubator kepemimpinan terbaik.",
    image: "/assets/images/individu.jpg",
  },
  {
    name: "Ainur Rochim Fathir",
    role: "GenBI 2021 • Founder Startup Edukasi",
    quote:
      "Jejaring yang luas dan dukungan penuh untuk inovasi membuat saya berani merintis startup. GenBI mengajarkan saya arti memberi dampak nyata bagi masyarakat luas.",
    image: "/assets/images/individu.jpg",
  },
  {
    name: "Rochim Fathir Ainur",
    role: "GenBI 2020 • Researcher",
    quote:
      "Pengalaman di GenBI sangat luar biasa. Saya belajar banyak hal mulai dari manajemen waktu, kepemimpinan, hingga teknis kebanksentralan yang tidak saya dapatkan di bangku kuliah. Selain itu, kesempatan bertemu dengan tokoh-tokoh inspiratif dan mentor yang suportif membuka wawasan saya tentang dunia profesional yang sesungguhnya. Program kerja yang kami jalankan tidak hanya menggugurkan kewajiban, tetapi benar-benar dirancang untuk memberikan value added bagi lingkungan sekitar, terutama di bidang edukasi ekonomi digital.",
    image: "/assets/images/individu.jpg",
  },
];

export function TestimonialsSection() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<
    (typeof TESTIMONIALS)[0] | null
  >(null);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container px-6 mx-auto relative z-10">
        <SectionHeader
          title="Dampak Nyata GenBI"
          description="Mendengar langsung pengalaman transformatif dari para alumni yang kini berkarya di berbagai sektor strategis."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <StaggerItem key={idx}>
              <Card className="p-2 h-full flex flex-col">
                <CardContent className="flex flex-col h-full">
                  <div className="flex-1 mb-6 relative">
                    <div className="text-4xl text-cyan-500/30 font-serif mb-4 leading-none">
                      &quot;
                    </div>
                    <p className="text-blue-100/80 leading-relaxed italic line-clamp-4">
                      {item.quote}
                    </p>
                    {item.quote.length > 150 && (
                      <button
                        onClick={() => setSelectedTestimonial(item)}
                        className="text-cyan-400 text-xs font-bold mt-2 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Baca Selengkapnya
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-blue-300/60 font-medium">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Testimonial Modal */}
        <AnimatePresence>
          {selectedTestimonial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedTestimonial(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0f172a] border border-white/10 rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl"
              >
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="absolute top-4 right-4 text-blue-200/50 hover:text-white transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-cyan-500/30 flex-shrink-0">
                    <Image
                      src={selectedTestimonial.image}
                      alt={selectedTestimonial.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {selectedTestimonial.name}
                      </h3>
                      <p className="text-cyan-400 text-sm font-medium">
                        {selectedTestimonial.role}
                      </p>
                    </div>
                    <div className="text-5xl text-cyan-500/20 font-serif leading-none mb-2">
                      &quot;
                    </div>
                    <p className="text-blue-100/90 text-lg leading-relaxed italic">
                      {selectedTestimonial.quote}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
