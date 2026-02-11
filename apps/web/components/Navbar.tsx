"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/layout/navbar/Logo";
import { NavLinks } from "@/components/layout/navbar/NavLinks";
import { MobileMenu } from "@/components/layout/navbar/MobileMenu";
import { Button } from "@/components/Button";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full bg-blue-950/70 backdrop-blur-xl border-b border-blue-800/20 shadow-sm supports-[backdrop-filter]:bg-blue-950/60"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        <Logo />

        {/* Desktop Menu */}
        <NavLinks />

        <div className="hidden md:flex items-center space-x-4">
          <Link href={siteConfig.links.admin}>
            <Button variant="secondary" size="md" className="rounded-full">
              Login Admin
            </Button>
          </Link>
        </div>

        {/* Mobile Menu (Button + Overlay) */}
        <MobileMenu />
      </div>
    </motion.nav>
  );
}
