import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Instagram,
  LayoutGrid,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import { BackLink } from "@/components/BackLink";
import type { Document, ProkerData } from "@repo/types";
import { periodSlug } from "@/lib/services/period.service";
import type {
  CommissariatAwardee,
  CommissariatStructure,
} from "@/lib/services/commissariat.service";
import { publicProgramItems } from "@/lib/program-presentation.mjs";
import { CommissariatTabs } from "./CommissariatTabs";
import { ArsipPanel } from "./panels/ArsipPanel";
import { StructurePanel } from "./panels/StructurePanel";
import {
  commissariatDisplayName,
  contactEmail,
  instagramLabel,
  instagramUrl,
  isMeaningfulText,
  tidyText,
} from "./display";

type CommissariatDetailData = {
  slug: string;
  name: string;
  university: string;
  logo_univ: string;
  logo_genbi: string;
  cover_image: string;
  description: string;
  memberCount?: number;
  socials?: { instagram?: string; email?: string };
  instagram?: string;
  email?: string;
  documents?: Document[];
  proker: ProkerData[];
};

type Props = {
  data: CommissariatDetailData;
  periods: string[];
  period: string;
  structure: CommissariatStructure | null;
  awardees: CommissariatAwardee[];
  initialTab?: string;
};

const TAB_IDS = ["profil", "proker", "awardee", "arsip"] as const;

/**
 * Halaman detail komisariat.
 *
 * Identitas komisariat diringkas jadi satu kartu informasi tanpa gambar
 * (logo, nama, angka ringkas, periode, sosial media), lalu isi berat dipisah
 * menjadi tab "Profil & Kepengurusan", "Program Kerja", dan "Data Awardee"
 * lewat `CommissariatTabs`.
 */
export default function CommissariatDetail({
  data,
  periods,
  period,
  structure,
  awardees,
  initialTab,
}: Props) {
  const documents = data.documents ?? [];
  // Proker yang batal/belum terbit tidak ikut tampil, sejalan dengan /program.
  const proker = publicProgramItems(data.proker ?? []);
  const memberCount = data.memberCount ?? awardees.length;
  const divisionCount = structure?.divisions.length ?? 0;
  const instagram = instagramUrl(data.socials?.instagram || data.instagram);
  const email = contactEmail(data.socials?.email || data.email);
  const description = isMeaningfulText(data.description)
    ? tidyText(data.description)
    : "";
  const displayName = commissariatDisplayName(data.name);
  const multiPeriods = periods.length > 1;

  // Tab untuk tautan periode: turun ke "profil" kalau arsip tidak tersedia.
  const requestedTab = TAB_IDS.find((id) => id === initialTab) ?? "profil";
  const activeTabForLinks =
    requestedTab === "arsip" && documents.length === 0 ? "profil" : requestedTab;

  const periodHref = (label: string) => {
    const params = new URLSearchParams();
    params.set("periode", periodSlug(label));
    if (activeTabForLinks !== "profil") params.set("tab", activeTabForLinks);
    return `/commissariat/${data.slug}?${params.toString()}`;
  };

  // API bisa mengirim src yang tidak bisa dipakai next/image; jaga seperti
  // halaman daftar komisariat.
  const logoSrc =
    typeof data.logo_univ === "string" &&
    (data.logo_univ.startsWith("/") || /^https?:\/\//.test(data.logo_univ))
      ? data.logo_univ
      : "/assets/logos/genbi.svg";

  const stats: Array<{ icon: LucideIcon; value: number; label: string }> = [];
  if (memberCount > 0) {
    stats.push({ icon: Users, value: memberCount, label: "Anggota" });
  }
  if (proker.length > 0) {
    stats.push({ icon: CalendarDays, value: proker.length, label: "Program Kerja" });
  }
  if (divisionCount > 0) {
    stats.push({ icon: LayoutGrid, value: divisionCount, label: "Divisi" });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-genbi-soft text-slate-900 selection:bg-genbi-blue selection:text-white">
      <Navbar />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-genbi-light to-genbi-soft" />

      <main className="relative z-10 flex-1 pb-20 pt-24">
        <Container>
          {/*
            Breadcrumb "Komisariat > nama" diganti tombol kembali atas
            permintaan pemilik produk: pengunjung awam langsung tahu cara
            kembali. Perilaku sama dengan halaman detail program (riwayat
            peramban, fallback ke daftar komisariat).
          */}
          <div className="mb-4">
            <BackLink
              label="Kembali ke Komisariat"
              fallbackHref="/commissariat"
            />
          </div>

          {/* Kartu identitas ringkas: tanpa gambar sampul, fokus ke informasi. */}
          <section
            aria-labelledby="komisariat-heading"
            className="rounded-card border border-genbi-line bg-white p-5 shadow-sm md:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-media border border-genbi-line bg-white p-2 shadow-sm md:h-20 md:w-20 md:p-2.5">
                <Image
                  src={logoSrc}
                  alt={`Logo ${data.university}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  id="komisariat-heading"
                  className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
                >
                  {displayName}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 md:text-base">
                  {data.university}
                </p>
                {description.length > 0 && (
                  <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-genbi-line pt-4">
              {stats.length > 0 && (
                <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <li
                        key={stat.label}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Icon
                          className="h-4 w-4 text-genbi-blue"
                          aria-hidden="true"
                        />
                        <span className="font-bold tabular-nums text-slate-900">
                          {stat.value}
                        </span>
                        <span>{stat.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {(instagram || email) && (
                <div className="flex flex-wrap items-center gap-2">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-genbi-line bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-genbi-bright hover:text-genbi-blue active:scale-[0.98]"
                    >
                      <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
                      {instagramLabel(
                        data.socials?.instagram || data.instagram,
                      )}
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-genbi-line bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:border-genbi-bright hover:text-genbi-blue active:scale-[0.98]"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{email}</span>
                    </a>
                  )}
                </div>
              )}

              {multiPeriods && (
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <span className="text-sm font-semibold text-slate-500">
                    Periode
                  </span>
                  {periods.map((label) => {
                    const active = label === period;
                    return (
                      <Link
                        key={label}
                        href={periodHref(label)}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors active:scale-[0.98] ${
                          active
                            ? "border-genbi-blue bg-genbi-blue font-bold text-white shadow-sm"
                            : "border-genbi-line bg-white font-semibold text-slate-600 hover:border-genbi-bright hover:text-genbi-blue"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </Container>

        <div className="mt-10 md:mt-12">
          <CommissariatTabs
            initialTab={initialTab}
            periodSlugParam={multiPeriods ? periodSlug(period) : null}
            structurePanel={
              <StructurePanel structure={structure} period={period} />
            }
            arsipPanel={
              documents.length > 0 ? (
                <ArsipPanel documents={documents} />
              ) : null
            }
            proker={proker}
            awardees={awardees}
            awardeePeriod={period}
          />
        </div>
      </main>

      <div className="relative border-t border-genbi-line bg-white">
        <Footer />
      </div>
    </div>
  );
}
