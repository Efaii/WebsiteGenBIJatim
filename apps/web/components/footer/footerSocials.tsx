"use client";

import Link from "next/link";
import Image from "next/image";
import { footerConfig } from "@/config/footer";

/**
 * FooterSocials Component
 * * Purpose: Renders social media integration anchors and primary contact conversion links.
 * Architecture:
 * - Layout: Horizontal flex row for social icons followed by a CTA narrative.
 * - Interaction: Supports external URL redirects for social platforms and internal routing for contacts.
 * - Iconography: Leverages standardized Lucide-react components for visual consistency.
 */
export function FooterSocials() {
  const { identity, socials, contact } = footerConfig;

  return (
    <div className="border-t border-slate-100 md:border-none pt-6 md:pt-0 mt-2 md:mt-0">
      <h4 className="font-bold text-slate-900 text-[15px] mb-4">Terhubung</h4>
      <div className="flex flex-wrap gap-3 mb-6">
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 text-blue-600 hover:-translate-y-1 hover:shadow-md"
              title={social.name}
            >
              <Icon size={20} />
            </a>
          );
        })}
      </div>
      <p className="text-[13px] font-medium text-slate-900 mb-1">
        {contact.label}
      </p>
      <Link
        href={contact.href}
        className="inline-flex min-h-[44px] items-center"
      >
        <span className="text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer pb-0.5 hover:border-blue-600">
          {contact.cta}
        </span>
      </Link>

      <div className="pt-4 mt-4 border-t border-slate-100 w-fit">
        <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-2">
          {identity.support.label}
        </p>
        <div className="relative w-32 h-10 opacity-90 hover:opacity-100 transition-opacity">
          <Image
            src={identity.support.logo}
            alt="Supporting Organization Logo"
            fill
            className="object-contain object-left"
          />
        </div>
      </div>
    </div>
  );
}
