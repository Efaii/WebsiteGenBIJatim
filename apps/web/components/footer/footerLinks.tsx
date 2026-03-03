"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FooterLinks Component
 * * Purpose: Renders a column of navigation links with mobile-responsive accordion behavior.
 * Architecture:
 * - Componentry: Utilizes a composite button-list structure.
 * - Interaction: Delegates toggle state to the parent orchestrator.
 * - Logic: Conditionally renders grid-based visibility for mobile viewports.
 */

type LinkItem = {
  label: string;
  href: string;
  isBold?: boolean;
};

type FooterLinksProps = {
  title: string;
  links: LinkItem[];
  isOpen: boolean;
  onToggle: () => void;
};

export function FooterLinks({
  title,
  links,
  isOpen,
  onToggle,
}: FooterLinksProps) {
  return (
    <div className="border-t border-slate-100 md:border-none pt-4 md:pt-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full md:cursor-auto md:pointer-events-none md:mb-2 group h-11 md:h-auto"
      >
        <h4 className="font-bold text-slate-900 text-[15px]">{title}</h4>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-900 md:hidden transition-transform duration-300",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out md:grid-rows-[1fr] md:opacity-100",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <ul className="overflow-hidden md:!overflow-visible flex flex-col gap-1 text-[14px] font-medium">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center min-h-[44px] md:min-h-0 md:py-1.5 hover:text-blue-600 transition-colors",
                  link.isBold &&
                    "text-blue-600 hover:text-blue-700 font-bold text-[12px] uppercase tracking-wider mt-1",
                )}
              >
                {link.label} {link.isBold}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
