import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileImage, Newspaper, Plus } from "lucide-react";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { newsAssetUrl } from "@/lib/services/news.service";
import { newsBylineParts, newsBylineText } from "@/lib/news-byline";
import { BTN_PRIMARY, PANEL } from "../../ui";
import { FeatureSlotCards, type SlotCardNews } from "./FeatureSlotCards";
import { SlotSelect } from "./SlotSelect";
import {
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  newsStatusClass,
} from "./status";

export const metadata = { title: "Berita" };

const coverAssetOf = (item: CmsNewsItem) =>
  item.coverAssets.find(
    (asset) => asset.role === "COVER" && asset.status === "PUBLIC",
  ) ??
  item.coverAssets.find((asset) => asset.role === "COVER") ??
  null;

const coverUrlOf = (item: CmsNewsItem): string | null => {
  const asset = coverAssetOf(item);
  if (!asset || !asset.storageKey.startsWith("/uploads")) return null;
  return newsAssetUrl(asset.storageKey);
};

const toCard = (item: CmsNewsItem): SlotCardNews => ({
  id: item.id,
  title: item.title,
  coverUrl: coverUrlOf(item),
  status: item.publicationStatus,
});

/**
 * Daftar Berita admin.
 *
 * Tiga kartu slot beranda di atas (berita pilihan yang tayang di beranda,
 * lengkap dengan thumbnail dan status) lalu tabel seluruh berita dengan
 * thumbnail, status, dan pemilih slot cepat. Hanya admin global yang melihat
 * bagian slot.
 */
export default async function AdminNewsListPage() {
  const session = await getCmsPageSession();
  const isGlobal = session.role === "ADMIN_GLOBAL";

  const items = (await cmsApiGet<CmsNewsItem[]>("/v1/news/cms")) ?? [];
  const published = items.filter(
    (item) => item.publicationStatus === "PUBLISHED",
  );
  const slots = [1, 2, 3].map((order) => {
    const occupant = items.find((item) => item.featuredOrder === order) ?? null;
    return { order, news: occupant ? toCard(occupant) : null };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Berita
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            {isGlobal
              ? "Tulis dan terbitkan berita, pilih tiga berita untuk slot beranda, dan pantau status semua berita."
              : "Tulis dan ajukan berita komisariat Anda. Admin global yang menyetujui dan menerbitkannya."}
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
        <>
          {isGlobal ? (
            <FeatureSlotCards slots={slots} options={published.map(toCard)} />
          ) : null}

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
              Semua berita ({items.length})
            </h2>
            <div className={`${PANEL} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Gambar</th>
                      <th className="px-5 py-3 font-semibold">Judul</th>
                      <th className="px-5 py-3 font-semibold">Kategori</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      {isGlobal ? (
                        <th className="px-5 py-3 font-semibold">
                          Slot beranda
                        </th>
                      ) : null}
                      <th className="px-5 py-3 font-semibold">Diperbarui</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-genbi-line">
                    {items.map((item) => {
                      const coverUrl = coverUrlOf(item);
                      const invalidPick =
                        item.featuredOrder !== null &&
                        item.publicationStatus !== "PUBLISHED";
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors duration-200 hover:bg-genbi-soft/70"
                        >
                          <td className="px-5 py-3">
                            {coverUrl ? (
                              <Image
                                src={coverUrl}
                                alt=""
                                width={96}
                                height={56}
                                className="h-14 w-24 rounded-thumb border border-genbi-line object-cover"
                              />
                            ) : (
                              <span className="flex h-14 w-24 items-center justify-center rounded-thumb border border-dashed border-slate-200 text-slate-300">
                                <FileImage className="h-4 w-4" aria-hidden />
                              </span>
                            )}
                          </td>
                          <td className="max-w-[320px] px-5 py-3">
                            <span className="block font-medium text-slate-900">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {newsBylineText(
                                newsBylineParts({
                                  author: item.author,
                                  publisher: item.publisher,
                                }),
                              )}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {item.category ?? "-"}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`${NEWS_STATUS_BADGE} ${newsStatusClass(
                                item.publicationStatus,
                              )}`}
                            >
                              {NEWS_STATUS_LABEL[item.publicationStatus] ??
                                item.publicationStatus}
                            </span>
                          </td>
                          {isGlobal ? (
                            <td className="px-5 py-3">
                              <SlotSelect
                                newsId={item.id}
                                value={item.featuredOrder}
                                published={
                                  item.publicationStatus === "PUBLISHED"
                                }
                              />
                              {invalidPick ? (
                                <span className="mt-1 block text-[11px] leading-snug text-amber-700">
                                  Slot tidak valid; beranda memakai berita
                                  terbaru.
                                </span>
                              ) : null}
                            </td>
                          ) : null}
                          <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                            {new Date(item.updatedAt).toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/admin/berita/${item.id}`}
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light"
                            >
                              Kelola
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
