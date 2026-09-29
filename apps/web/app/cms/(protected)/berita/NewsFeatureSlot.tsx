"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  setNewsFeaturedOrder,
  type CmsNewsItem,
} from "@/lib/services/cms-news.service";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan slot. Coba lagi.";
};

/**
 * Pemilih slot beranda (ADR 0012): hanya berita terbit yang bisa menempati
 * slot 1-3; slot yang sama otomatis dilepas dari berita lain oleh API. Pilihan
 * yang tidak valid (berita tidak lagi terbit) ditandai di sini dan beranda
 * mengisinya otomatis dari berita terbit terbaru.
 */
export function NewsFeatureSlot({ news }: { news: CmsNewsItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState(
    news.featuredOrder ? String(news.featuredOrder) : "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const published = news.publicationStatus === "PUBLISHED";
  const invalidPick = news.featuredOrder !== null && !published;

  const save = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await setNewsFeaturedOrder(news.id, value === "" ? null : Number(value));
      setMessage("Slot tersimpan.");
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-700">Slot beranda</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
        >
          <option value="">Tidak tampil</option>
          <option value="1" disabled={!published}>
            Slot 1
          </option>
          <option value="2" disabled={!published}>
            Slot 2
          </option>
          <option value="3" disabled={!published}>
            Slot 3
          </option>
        </select>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Menyimpan..." : "Simpan slot"}
        </button>
      </div>
      {!published && (
        <p className="text-xs text-amber-700">
          Hanya berita terbit yang dapat menempati slot; berita ini berstatus{" "}
          {news.publicationStatus}.
        </p>
      )}
      {invalidPick && (
        <p className="text-xs text-amber-700">
          Pilihan slot {news.featuredOrder} tidak valid karena berita tidak
          terbit — beranda mengisinya otomatis dari berita terbit terbaru.
        </p>
      )}
      {message && <p className="text-xs text-emerald-700">{message}</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
