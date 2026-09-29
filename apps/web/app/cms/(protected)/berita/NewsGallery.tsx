"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { newsAssetUrl } from "@/lib/services/news.service";
import {
  addNewsGalleryAsset,
  deleteNewsGalleryAsset,
  orderNewsGalleryAssets,
  type CmsNewsItem,
} from "@/lib/services/cms-news.service";

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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-base font-bold text-slate-900">
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

      <div className="mt-3 space-y-2">
        {gallery.length === 0 && (
          <p className="text-xs text-slate-400">Belum ada gambar pendukung.</p>
        )}
        {gallery.map((asset, index) => (
          <div
            key={asset.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-2"
          >
            {asset.status === "PUBLIC" ? (
              <Image
                src={newsAssetUrl(asset.storageKey) ?? asset.storageKey}
                alt=""
                width={80}
                height={48}
                className="h-12 w-20 rounded-md border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-dashed border-slate-300 text-[10px] text-slate-400">
                staged
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="break-all text-xs text-slate-600">
                {asset.storageKey}
              </p>
              <p className="text-[11px] text-slate-400">
                {asset.status} · urutan {index + 1}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={busy || index === 0}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={busy || index === gallery.length - 1}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  void run(() => deleteNewsGalleryAsset(news.id, asset.id))
                }
                disabled={busy}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || gallery.length >= GALLERY_LIMIT}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void run(() => addNewsGalleryAsset(news.id, file));
          }}
          className="block w-full text-sm text-slate-600"
        />
        {gallery.length >= GALLERY_LIMIT && (
          <p className="mt-1 text-xs text-amber-700">
            Batas {GALLERY_LIMIT} gambar pendukung tercapai; hapus salah satu
            untuk menambah.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
