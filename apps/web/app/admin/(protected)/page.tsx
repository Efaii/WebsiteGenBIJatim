import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  ExternalLink,
  House,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { AdminForbiddenPanel } from "./AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsFaqItem } from "@/lib/services/cms-faq.service";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { PANEL } from "../ui";

export const metadata = { title: "Ringkasan" };

type Shortcut = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const SHORTCUTS: Shortcut[] = [
  {
    href: "/admin/beranda",
    icon: House,
    title: "Beranda",
    description:
      "Ubah teks hero, Tentang GenBI, Pilar, dan Sejarah Perjalanan beserta medianya. Perubahan tayang setelah Simpan.",
  },
  {
    href: "/admin/berita",
    icon: Newspaper,
    title: "Berita",
    description:
      "Tulis, sunting, dan terbitkan berita. Atur juga posisi tampilnya di bagian Berita pada beranda.",
  },
  {
    href: "/admin/faq",
    icon: CircleHelp,
    title: "FAQ",
    description:
      "Kelola pertanyaan yang tampil di bagian FAQ beranda: tambah, ubah, urutkan, aktifkan.",
  },
];

/**
 * Ringkasan area admin: salam, status singkat, dan pintasan ke tiap bagian.
 * Angka status dibaca dari API kanonik yang sama dengan halaman lainnya;
 * bila API tidak menjawab, kalimat status cukup dihilangkan.
 */
export default async function AdminHomePage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const [news, faqs] = await Promise.all([
    cmsApiGet<CmsNewsItem[]>("/v1/news/cms"),
    cmsApiGet<CmsFaqItem[]>("/v1/faqs/cms"),
  ]);

  const stats =
    news === null || faqs === null
      ? null
      : `${news.length} berita (${
          news.filter((item) => item.publicationStatus === "PUBLISHED").length
        } terbit) dan ${faqs.length} FAQ`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Ringkasan
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Kelola konten beranda, berita, dan FAQ GenBI Jawa Timur dari satu
          tempat.
        </p>
      </div>

      <section className={`${PANEL} p-6 md:p-8`}>
        <p className="text-sm font-semibold uppercase tracking-wider text-genbi-blue">
          Halo, {session.username ?? "admin"}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Anda masuk sebagai{" "}
          <strong className="font-semibold text-slate-900">admin global</strong>
          . Setiap perubahan yang disimpan langsung tayang di situs publik.
          {stats ? ` Saat ini tercatat ${stats}.` : null}
        </p>
      </section>

      <section className={`${PANEL} overflow-hidden`}>
        <h2 className="border-b border-genbi-line px-6 py-4 text-sm font-semibold text-slate-900 md:px-8">
          Pintasan
        </h2>
        <ul className="divide-y divide-genbi-line">
          {SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-genbi-soft md:px-8"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-thumb bg-genbi-light text-genbi-blue">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-genbi-blue-hover">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-genbi-blue"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
          <li>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-genbi-soft md:px-8"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-thumb bg-genbi-light text-genbi-blue">
                <ExternalLink className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-genbi-blue-hover">
                  Lihat situs publik
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">
                  Buka beranda GenBI Jatim di tab baru untuk memeriksa hasil.
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-genbi-blue"
                aria-hidden
              />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
