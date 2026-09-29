"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  transitionNews,
  type CmsNewsItem,
  type PublicationStatusValue,
} from "@/lib/services/cms-news.service";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menjalankan transisi status.";
};

const primaryClass =
  "rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50";
const secondaryClass =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";

/**
 * Aksi alur terbit berita (jalur kanonik DRAFT → SUBMITTED → APPROVED →
 * PUBLISHED). Admin global menjalankan ketiganya berurutan; validasi
 * kelengkapan (kategori/ringkasan/isi/cover) ditegakkan API dan pesannya
 * ditampilkan apa adanya.
 */
export function NewsActions({ news }: { news: CmsNewsItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (steps: PublicationStatusValue[]) => {
    setBusy(true);
    setError(null);
    try {
      for (const status of steps) {
        await transitionNews(news.id, status);
      }
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const status = news.publicationStatus;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {(status === "DRAFT" || status === "REJECTED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(["SUBMITTED", "APPROVED", "PUBLISHED"])}
            className={primaryClass}
          >
            {busy ? "Memproses..." : "Terbitkan"}
          </button>
        )}
        {status === "SUBMITTED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(["APPROVED", "PUBLISHED"])}
            className={primaryClass}
          >
            {busy ? "Memproses..." : "Setujui & terbitkan"}
          </button>
        )}
        {status === "APPROVED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(["PUBLISHED"])}
            className={primaryClass}
          >
            {busy ? "Memproses..." : "Terbitkan"}
          </button>
        )}
        {status === "PUBLISHED" && (
          <>
            <a
              href={`/news/${news.slug}`}
              target="_blank"
              rel="noreferrer"
              className={secondaryClass}
            >
              Lihat publik
            </a>
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(["DRAFT"])}
              className={secondaryClass}
            >
              {busy ? "Memproses..." : "Tarik ke draft"}
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Status: <span className="font-medium text-slate-700">{status}</span>
      </p>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
