"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { newsAssetUrl } from "@/lib/services/news.service";
import {
  addNewsGalleryAsset,
  deleteNewsGalleryAsset,
  orderNewsGalleryAssets,
  type CmsNewsItem,
} from "@/lib/services/cms-news.service";
import { BTN_ICON, FILE_INPUT, PANEL } from "../../ui";

const GALLERY_LIMIT = 4;

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memproses galeri. Coba lagi.";
};

/**
 * Galeri pendukung berita (ADR 0010): sampai empat gambar ber-role GALLERY di
 * samping satu gambar utama (cover). Urutan menentukan tampilan publik; berkas
 * yang dihapus ikut dibersihkan dari storage.
 */
export function NewsGallery({ news }: { news: CmsNewsItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cover =
    news.coverAssets.find(
      (asset) => asset.role === "COVER" && asset.status !== "SUPERSEDED",
    ) ?? null;
  const gallery = news.coverAssets
    .filter(
      (asset) => asset.role === "GALLERY" && asset.status !== "SUPERSEDED",
    )
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const ids = gallery.map((asset) => asset.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    void run(() => orderNewsGalleryAssets(news.id, next));
  };

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className="text-sm font-semibold text-slate-900">
        Galeri pendukung ({gallery.length}/{GALLERY_LIMIT})
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Gambar utama tetap satu (cover, dikelola di formulir atas). Sampai empat
        gambar pendukung; unggahan dikonversi WebP otomatis dan urutan di sini
        menentukan tampilan publik.
      </p>
      {cover && (
        <p className="mt-2 break-all text-xs text-slate-500">
          Gambar utama: {cover.storageKey} ({cover.status})
        </p>
      )}

      <div className="mt-4 space-y-2">
        {gallery.length === 0 && (
          <p className="text-xs text-slate-400">Belum ada gambar pendukung.</p>
        )}
        {gallery.map((asset, index) => (
          <div
            key={asset.id}
            className="flex items-center gap-3 rounded-2xl border border-genbi-line bg-genbi-soft/40 p-2.5"
          >
            {asset.status === "PUBLIC" ? (
              <Image
                src={newsAssetUrl(asset.storageKey) ?? asset.storageKey}
                alt=""
                width={80}
                height={48}
                className="h-12 w-20 rounded-thumb border border-genbi-line object-cover"
              />
            ) : (
              <div className="flex h-12 w-20 items-center justify-center rounded-thumb border border-dashed border-slate-300 text-[10px] text-slate-400">
                staged
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="break-all text-xs text-slate-600">
                {asset.storageKey}
              </p>
              <p className="text-[11px] text-slate-400">
                {asset.status}, urutan {index + 1}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={busy || index === 0}
                aria-label="Naikkan urutan"
                className={BTN_ICON}
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={busy || index === gallery.length - 1}
                aria-label="Turunkan urutan"
                className={BTN_ICON}
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() =>
                  void run(() => deleteNewsGalleryAsset(news.id, asset.id))
                }
                disabled={busy}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-3.5 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:pointer-events-none disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || gallery.length >= GALLERY_LIMIT}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void run(() => addNewsGalleryAsset(news.id, file));
          }}
          className={FILE_INPUT}
        />
        {gallery.length >= GALLERY_LIMIT && (
          <p className="mt-2 text-xs text-amber-700">
            Batas {GALLERY_LIMIT} gambar pendukung tercapai; hapus salah satu
            untuk menambah.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
