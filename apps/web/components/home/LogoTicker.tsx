"use client";

import Image from "next/image";
import { Marquee } from "@/components/ui/Marquee";
import { CommissariatItem } from "@/types/home.types";

/**
 * @component LogoTicker
 * @description Renders a dedicated section for partnership logos using a smooth infinite marquee.
 */
export function LogoTicker({
  commissariats,
}: {
  commissariats: CommissariatItem[];
}) {
  return (
    <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      <div className="container lg:px-8 xl:px-12 mx-auto relative z-10 max-w-7xl">
        <div className="w-full lg:px-6 xl:px-10">
          <div className="w-full">
            <div className="text-center mb-8">
              <p className="text-slate-600 text-xs md:text-sm font-semibold tracking-widest uppercase">
                Menaungi Mahasiswa Terbaik dari 9 Perguruan Tinggi Mitra
              </p>
            </div>
            
            <Marquee speed="fast">
              {commissariats.map((comm) => (
                <div
                  key={comm.id}
                  className="flex-none relative h-16 md:h-20 w-auto flex items-center justify-center group/logo"
                >
                  <Image
                    src={comm.logo}
                    alt={`Logo ${comm.name}`}
                    width={180}
                    height={80}
                    loading="eager"
                    unoptimized
                    className="h-full w-auto object-contain max-w-[150px] md:max-w-[180px] opacity-70 group-hover/logo:opacity-100 transition-opacity duration-300 transform-gpu"
                  />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
