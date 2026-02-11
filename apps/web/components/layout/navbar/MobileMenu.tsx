"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/config/site";

export function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <button
        className="md:hidden text-white p-2 focus:outline-none"
        onClick={toggleMenu}
      >
        <div className="w-6 h-6 flex flex-col justify-around relative">
          <span
            className={`w-full h-0.5 bg-white transition-all transform ${
              isMobileMenuOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-white transition-all opacity-100 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-white transition-all transform ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-blue-950/95 backdrop-blur-xl pt-24 px-6 md:hidden overflow-hidden"
          >
            <div className="flex flex-col space-y-6 text-center">
              {siteConfig.navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold text-white py-2 border-b border-white/10"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={siteConfig.links.admin}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="primary" size="lg" className="w-full mt-4">
                  Login Admin
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
