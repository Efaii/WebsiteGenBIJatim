"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  transitionNews,
  type CmsNewsItem,
  type PublicationStatusValue,
} from "@/lib/services/cms-news.service";
import { BTN_PRIMARY, BTN_SECONDARY, PANEL } from "../../ui";
import {
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  newsStatusClass,
} from "./status";

type NewsRole = "ADMIN_GLOBAL" | "SEKRETARIS_UMUM" | "SEKRETARIS_DIVISI";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menjalankan transisi status.";
};

const GLOBAL_HINT: Record<string, string> = {
  DRAFT: "Terbitkan akan menyetujui sekaligus menayangkan berita ke publik.",
  REJECTED:
    "Berita ditolak. Setelah diperbaiki, terbitkan untuk menyetujui dan menayangkannya.",
  SUBMITTED:
    "Berita menunggu persetujuan. Setujui untuk melanjutkan ke penerbitan.",
  APPROVED: "Berita sudah disetujui. Terbitkan untuk menayangkannya.",
  PUBLISHED:
    "Berita tayang di publik. Menarik ke draft akan menyembunyikannya dari publik.",
};

const SECRETARY_HINT: Record<string, string> = {
  DRAFT:
    "Lengkapi isi dan cover, lalu ajukan untuk terbit. Admin global yang menyetujui dan menerbitkan.",
  REJECTED:
    "Berita ditolak. Perbaiki sesuai catatan, lalu ajukan ulang ke admin global.",
  SUBMITTED: "Menunggu persetujuan admin global.",
  APPROVED: "Sudah disetujui; menunggu penerbitan admin global.",
  PUBLISHED: "Berita tayang di halaman berita publik.",
};

/**
 * Aksi alur terbit berita (jalur kanonik DRAFT -> SUBMITTED -> APPROVED ->
 * PUBLISHED). Admin global menjalankan seluruh lifecycle; sekretaris hanya
 * mengajukan (ADR 0016). Validasi kelengkapan ditegakkan API dan pesannya
 * ditampilkan apa adanya.
 */
export function NewsActions({
  news,
  role,
}: {
  news: CmsNewsItem;
  role: NewsRole;
}) {
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
  const isGlobal = role === "ADMIN_GLOBAL";
  const hint = (isGlobal ? GLOBAL_HINT : SECRETARY_HINT)[status];

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className="text-sm font-semibold text-slate-900">Status terbit</h2>
      <p className="mt-3">
        <span className={`${NEWS_STATUS_BADGE} ${newsStatusClass(status)}`}>
          {NEWS_STATUS_LABEL[status] ?? status}
        </span>
      </p>

      {status === "REJECTED" && news.rejectionReason ? (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
          Catatan penolakan: {news.rejectionReason}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {isGlobal ? (
          <>
            {(status === "DRAFT" || status === "REJECTED") && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(["SUBMITTED", "APPROVED", "PUBLISHED"])}
                className={`${BTN_PRIMARY} w-full`}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {busy ? "Memproses..." : "Terbitkan"}
              </button>
            )}
            {status === "SUBMITTED" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(["APPROVED", "PUBLISHED"])}
                className={`${BTN_PRIMARY} w-full`}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {busy ? "Memproses..." : "Setujui & terbitkan"}
              </button>
            )}
            {status === "APPROVED" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(["PUBLISHED"])}
                className={`${BTN_PRIMARY} w-full`}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {busy ? "Memproses..." : "Terbitkan"}
              </button>
            )}
            {status === "PUBLISHED" && (
              <>
                <a
                  href={`/news/${news.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${BTN_SECONDARY} w-full`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Lihat publik
                </a>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(["DRAFT"])}
                  className={`${BTN_SECONDARY} w-full`}
                >
                  {busy && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {busy ? "Memproses..." : "Tarik ke draft"}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {(status === "DRAFT" || status === "REJECTED") && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(["SUBMITTED"])}
                className={`${BTN_PRIMARY} w-full`}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {busy ? "Memproses..." : "Ajukan untuk terbit"}
              </button>
            )}
            {status === "PUBLISHED" && (
              <a
                href={`/news/${news.slug}`}
                target="_blank"
                rel="noreferrer"
                className={`${BTN_SECONDARY} w-full`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Lihat publik
              </a>
            )}
          </>
        )}
      </div>

      {hint && (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">{hint}</p>
      )}

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
