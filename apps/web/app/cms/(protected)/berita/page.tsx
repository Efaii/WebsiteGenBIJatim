import Link from "next/link";
import { CmsForbiddenPanel } from "../CmsForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";

export const metadata = { title: "Berita | CMS GenBI Jatim" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Menunggu persetujuan",
  APPROVED: "Disetujui",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
  ARCHIVED: "Arsip",
};

export default async function CmsNewsListPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  const items = (await cmsApiGet<CmsNewsItem[]>("/v1/news/cms")) ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-bold text-slate-900">
          Berita
        </h1>
        <Link
          href="/cms/berita/baru"
          className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + Berita baru
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Belum ada berita.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Diperbarui</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.category ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {STATUS_LABEL[item.publicationStatus] ??
                        item.publicationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(item.updatedAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="text-genbi-blue hover:underline"
                      href={`/cms/berita/${item.id}`}
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
