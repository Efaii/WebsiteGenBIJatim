"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function HydrationLoader({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth transition even on fast connections
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isHydrated && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-white"
          >
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-[24px] opacity-20 animate-pulse"></div>
                <div className="w-16 h-16 relative animate-[spin_3s_linear_infinite]">
                  <Image
                    src="/assets/logos/genbi.svg"
                    alt="GenBI Jatim Logo"
                    fill
                    sizes="64px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <p className="text-blue-800/80 text-sm font-semibold animate-pulse tracking-[0.2em] text-center uppercase">
                Memuat
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={!isHydrated ? "invisible" : "visible"}>
        {children}
      </div>
    </>
  );
}
