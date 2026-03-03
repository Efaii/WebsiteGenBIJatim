"use client";

import Link from "next/link";
import Image from "next/image";
import { footerConfig } from "@/config/footer";

/**
 * FooterIdentity Component
 * * Purpose: Renders the brand identity, address, and supporting organization logos.
 * Architecture:
 * - Layout: Vertical stack of logo, narrative description, and contact address.
 * - Integration: Pulls dynamic branding data from footerConfig.
 */
export function FooterIdentity() {
  const { identity } = footerConfig;

  return (
    <div className="space-y-4 mb-6 md:mb-0">
      <Link href="/" className="inline-block flex items-center h-11">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 relative">
            <Image
              src={identity.logo}
              alt={`${identity.name} Logo`}
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {identity.name}
          </span>
        </div>
      </Link>
      <p className="text-[14px] leading-relaxed max-w-[280px]">
        {identity.description}
      </p>
      <address className="not-italic text-[13px] space-y-1 max-w-[280px]">
        <p className="font-bold text-slate-900">{identity.address.title}</p>
        <p>{identity.address.line1}</p>
        <p>{identity.address.line2}</p>
      </address>
    </div>
  );
}
