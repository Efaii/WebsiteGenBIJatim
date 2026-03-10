"use client";

import { motion } from "framer-motion";
import { Briefcase, Globe, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/MotionWrapper";
import { SectionHeader } from "@/components/SectionHeader";

/**
 * @component Features
 * @description Showcases the three core pillars/benefits of GenBI.
 */
export function Features() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="container px-6 lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          {/* SECTION HEADER */}
          <SectionHeader
            title={
              <>
                Tumbuh Bersama <span className="text-blue-600">3 Pilar Utama</span>
              </>
            }
            description="Lebih dari sekadar beasiswa, GenBI adalah wadah bagi Anda untuk bertransformasi melalui tiga peran strategis bagi bangsa."
            align="left"
            variant="light"
            className="mb-6"
          />

          {/* VALUES BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0.2} amount={0.3}>
              <ValueItem
                icon={Briefcase}
                title="Front-Liner"
                desc="Menjadi garda terdepan komunikasi kebijakan Bank Indonesia melalui mentorship eksklusif bersama para praktisi ekonomi."
              />
            </FadeIn>
            <FadeIn delay={0.3} amount={0.3}>
              <ValueItem
                icon={Globe}
                title="Agent of Change"
                desc="Penggerak perubahan nyata secara nasional dengan berkolaborasi dalam jejaring luas mahasiswa antar kampus Jawa Timur."
              />
            </FadeIn>
            <FadeIn delay={0.4} amount={0.3}>
              <ValueItem
                icon={TrendingUp}
                title="Future Leaders"
                desc="Membentuk calon pemimpin masa depan yang visioner melalui berbagai program pengembangan soft-skill dan kepemimpinan."
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * @subcomponent ValueItem
 * @description Renders individual program value blocks with icon and description.
 */
function ValueItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, transition: { ease: "circOut" } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full gap-6 p-8 rounded-[2rem] bg-slate-50 border border-slate-200/60 shadow-xl shadow-slate-200/50 hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 transition-[background-color,border-color,box-shadow] duration-300 group transform-gpu will-change-[transform,background-color,border-color]"
    >
      {/* ICON_WRAPPER_UI */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-blue-600 bg-white shadow-inner border border-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shrink-0 transform-gpu">
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>

      {/* TEXT_CONTENT_UI */}
      <div className="flex flex-col flex-1">
        <h3 className="h4 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-600 text-sm lg:text-base leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
