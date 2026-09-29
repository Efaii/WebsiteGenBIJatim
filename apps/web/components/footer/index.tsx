"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { footerConfig } from "@/config/footer";
import { FooterIdentity } from "./footerIdentity";
import { FooterLinks } from "./footerLinks";
import { FooterSocials } from "./footerSocials";
import { FooterBottom } from "./footerBottom";

/**
 * Footer Component
 * * Purpose: Acts as the root orchestrator for the global footer navigation system.
 * Architecture:
 * - State Management: Synchronizes local accordion visibility for mobile viewports.
 * - Layout: Responsive grid system mirroring the global brand architecture.
 * - Composition: Integrates identity assets, sequential link columns, and social conversion layers.
 */
export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <footer className="w-full text-slate-900 pt-16 pb-8 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="w-full relative z-10">
        {/*
          Memakai Container yang sama dengan seluruh section beranda, supaya
          tepi kiri footer segaris dengan Hero/About/Berita. Sebelumnya di sini
          ada `max-w-7xl` (1280px) + `lg:px-6 xl:px-10` bertingkat, sehingga
          konten footer mulai di x=168 sementara section mulai di x=64 pada
          viewport 1440 - selisih 104px yang terbaca sebagai bug tata letak.
        */}
        <Container className="relative z-10">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8 lg:gap-10 mb-12">
              {/* --- IDENTITY SECTION --- */}
              <FooterIdentity />

              {/* --- NAVIGATION SECTIONS --- */}
              {footerConfig.sections.map((section) => (
                <FooterLinks
                  key={section.id}
                  title={section.title}
                  links={section.links}
                  isOpen={openSection === section.id}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}

              {/* --- SOCIALS & CONTACT SECTION --- */}
              <FooterSocials />
            </div>

            {/* --- LEGAL & COPYRIGHT BAR --- */}
            <FooterBottom />
          </div>
        </Container>
      </div>
    </footer>
  );
}
