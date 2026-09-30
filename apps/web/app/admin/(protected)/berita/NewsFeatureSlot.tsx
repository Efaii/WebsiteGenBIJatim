"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  setNewsFeaturedOrder,
  type CmsNewsItem,
} from "@/lib/services/cms-news.service";
import { BTN_PRIMARY, FIELD_BASE, PANEL } from "../../ui";

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
    <section className={`${PANEL} p-6`}>
      <h2 className="text-sm font-semibold text-slate-900">Slot beranda</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Pilih posisi tampil di bagian Berita pada beranda. Hanya berita terbit
        yang bisa mengisi slot; satu slot hanya untuk satu berita.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setMessage(null);
            setError(null);
          }}
          disabled={busy}
          className={`${FIELD_BASE} disabled:bg-slate-50 disabled:text-slate-400`}
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
          className={BTN_PRIMARY}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? "Menyimpan..." : "Simpan slot"}
        </button>
      </div>
      {!published && (
        <p className="mt-3 text-xs leading-relaxed text-amber-700">
          Hanya berita terbit yang dapat menempati slot; berita ini berstatus{" "}
          {news.publicationStatus}.
        </p>
      )}
      {invalidPick && (
        <p className="mt-3 text-xs leading-relaxed text-amber-700">
          Pilihan slot {news.featuredOrder} tidak valid karena berita tidak
          terbit, sehingga beranda mengisinya otomatis dari berita terbit
          terbaru.
        </p>
      )}
      {message && (
        <p className="mt-3 text-xs font-semibold text-emerald-700">{message}</p>
      )}
      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
