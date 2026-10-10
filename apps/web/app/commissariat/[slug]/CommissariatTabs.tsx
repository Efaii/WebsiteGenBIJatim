"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ClipboardList,
  FolderOpen,
  GraduationCap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/Container";
import type { CommissariatAwardee } from "@/lib/services/commissariat.service";
import type { ProkerData } from "@repo/types";
import { AwardeePanel } from "./panels/AwardeePanel";
import { ProkerPanel } from "./panels/ProkerPanel";

type TabID = "profil" | "proker" | "awardee" | "arsip";

type TabDefinition = {
  id: TabID;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const BASE_TABS: TabDefinition[] = [
  {
    id: "profil",
    label: "Profil & Kepengurusan",
    shortLabel: "Profil",
    icon: Users,
  },
  {
    id: "proker",
    label: "Program Kerja",
    shortLabel: "Program",
    icon: ClipboardList,
  },
  {
    id: "awardee",
    label: "Data Awardee",
    shortLabel: "Awardee",
    icon: GraduationCap,
  },
];

const ARSIP_TAB: TabDefinition = {
  id: "arsip",
  label: "Arsip",
  shortLabel: "Arsip",
  icon: FolderOpen,
};

type Props = {
  initialTab?: string;
  /** Nilai `?periode=` yang dipakai tautan balik saat tab diganti. */
  periodSlugParam: string | null;
  /** Panel profil dirender server dan dikirim sebagai slot (lihat catatan). */
  structurePanel: ReactNode;
  /** Slot arsip; null saat komisariat tidak punya dokumen. */
  arsipPanel: ReactNode | null;
  proker: ProkerData[];
  awardees: CommissariatAwardee[];
  awardeePeriod: string;
};

/**
 * Tab halaman detail komisariat.
 *
 * Tab aktif disimpan di URL (`?tab=`) supaya tautan bisa dibagikan dan muat
 * ulang tetap mendarat di bagian yang sama. Tab diganti secara optimistis di
 * client, lalu URL dirapikan lewat `router.replace` tanpa menggulir halaman;
 * gulir diarahkan manual ke bilah tab agar konteks tetap terlihat.
 *
 * Catatan komposisi: panel profil dan arsip datang sebagai prop (server
 * component) supaya daftar pengurus yang panjang tidak ikut ke bundle client.
 */
export function CommissariatTabs({
  initialTab,
  periodSlugParam,
  structurePanel,
  arsipPanel,
  proker,
  awardees,
  awardeePeriod,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabs = arsipPanel ? [...BASE_TABS, ARSIP_TAB] : BASE_TABS;
  const initial = tabs.some((tab) => tab.id === initialTab)
    ? (initialTab as TabID)
    : "profil";
  const [activeTab, setActiveTab] = useState<TabID>(initial);

  const selectTab = (id: TabID) => {
    if (id === activeTab) return;
    setActiveTab(id);

    const params = new URLSearchParams();
    if (periodSlugParam) params.set("periode", periodSlugParam);
    if (id !== "profil") params.set("tab", id);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });

    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
    tabRefs.current[nextIndex]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  };

  return (
    <section ref={sectionRef} className="scroll-mt-20 md:scroll-mt-[72px]">
      {/* Bilah tab menempel di bawah navbar supaya tetap terjangkau saat
          pembaca menggulir jauh ke dalam tabel awardee. Kontrolnya berupa
          kotak membulat putih dengan pil aktif gradien; radius sengaja
          diturunkan dari kapsul penuh agar lebih dekat ke kotak dan selaras
          dengan kontrol lain di halaman ini. */}
      <div className="sticky top-20 z-30 border-y border-genbi-line bg-genbi-soft/85 backdrop-blur-md md:top-[72px]">
        <Container className="flex items-center py-2.5">
          <div
            role="tablist"
            aria-label="Bagian profil komisariat"
            onKeyDown={handleKeyDown}
            className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-genbi-line bg-white p-1 shadow-[0_10px_30px_-18px_rgba(16,42,92,0.45)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab, index) => {
              const active = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-2 rounded-thumb px-4 py-2 text-sm font-bold transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 focus-visible:ring-offset-1",
                    active
                      ? "text-white"
                      : "text-slate-500 hover:bg-genbi-light/70 hover:text-genbi-ink",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="commissariat-tab-pill"
                      className="absolute inset-0 rounded-thumb bg-gradient-to-b from-genbi-blue to-genbi-blue-hover shadow-[0_8px_18px_-10px_rgba(30,99,255,0.9)]"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 38 }
                      }
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
                  <span className="relative z-10 whitespace-nowrap">
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className="pt-8 md:pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }
            }
            className="focus-visible:outline-none"
          >
            {activeTab === "profil" && structurePanel}
            {activeTab === "proker" && <ProkerPanel proker={proker} />}
            {activeTab === "awardee" && (
              <AwardeePanel awardees={awardees} period={awardeePeriod} />
            )}
            {activeTab === "arsip" && arsipPanel}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
