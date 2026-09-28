"use client";

import { footerConfig } from "@/config/footer";

/**
 * FooterBottom Component
 * * Purpose: Renders the legal and metadata layer of the navigation architecture.
 * Architecture:
 * - Content: Displays localized copyright strings and navigational policy links.
 * - Layout: Responsive flex container mirroring the global site width constraints.
 */
export function FooterBottom() {
  const { bottom } = footerConfig;

  return (
    <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center text-[12px] text-slate-900 font-medium">
      <p className="text-center md:text-left">
        {bottom.copyright}
      </p>
    </div>
  );
}
