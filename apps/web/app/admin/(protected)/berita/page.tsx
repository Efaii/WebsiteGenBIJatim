import Link from "next/link";
import { ArrowRight, Newspaper, Plus } from "lucide-react";
import { AdminForbiddenPanel } from "../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { BTN_PRIMARY, PANEL } from "../../ui";
import {
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  newsStatusClass,
} from "./status";

export const metadata = { title: "Berita" };

export default async function AdminNewsListPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const items = (await cmsApiGet<CmsNewsItem[]>("/v1/news/cms")) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Berita
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Tulis dan terbitkan berita, lalu atur posisinya di beranda.
          </p>
        </div>
        <Link href="/admin/berita/baru" className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" aria-hidden />
          Berita baru
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <Newspaper className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Belum ada berita
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Mulai dengan membuat draft pertama.
          </p>
          <Link href="/admin/berita/baru" className={`${BTN_PRIMARY} mt-5`}>
            <Plus className="h-4 w-4" aria-hidden />
            Berita baru
          </Link>
        </div>
      ) : (
        <div className={`${PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Kategori</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Beranda</th>
                  <th className="px-5 py-3 font-semibold">Diperbarui</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="max-w-[320px] px-5 py-4 font-medium text-slate-900">
                      {item.title}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.category ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`${NEWS_STATUS_BADGE} ${newsStatusClass(
                          item.publicationStatus,
                        )}`}
                      >
                        {NEWS_STATUS_LABEL[item.publicationStatus] ??
                          item.publicationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.featuredOrder ? (
                        <span
                          className={`${NEWS_STATUS_BADGE} ${
                            item.publicationStatus === "PUBLISHED"
                              ? "border-genbi-haze bg-genbi-light text-genbi-blue"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          Slot {item.featuredOrder}
                          {item.publicationStatus === "PUBLISHED"
                            ? ""
                            : " (tidak valid)"}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {new Date(item.updatedAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/berita/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light"
                      >
                        Kelola
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
