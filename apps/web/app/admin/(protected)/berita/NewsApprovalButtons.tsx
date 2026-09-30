"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { transitionNews } from "@/lib/services/cms-news.service";
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, FIELD, LABEL } from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menjalankan aksi persetujuan.";
};

/**
 * Aksi persetujuan Berita untuk admin global: Setujui & terbitkan, atau Tolak
 * dengan catatan wajib. Dipakai di halaman Persetujuan Berita dan di kartu
 * status halaman kelola berita supaya perilakunya sama.
 *
 * Setelah aksi berhasil, sinyal `admin:approvals-changed` dikirim agar badge
 * jumlah menunggu di sidebar menyegar.
 */
export function NewsApprovalButtons({ newsId }: { newsId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const notify = () =>
    window.dispatchEvent(new Event("admin:approvals-changed"));

  const approve = async () => {
    setBusy(true);
    setError(null);
    try {
      await transitionNews(newsId, "APPROVED");
      await transitionNews(newsId, "PUBLISHED");
      notify();
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      setError("Catatan penolakan wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await transitionNews(newsId, "REJECTED", reason.trim());
      notify();
      setRejecting(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!rejecting ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => void approve()}
            className={`${BTN_PRIMARY} w-full`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy ? "Memproses..." : "Setujui & terbitkan"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setRejecting(true);
              setError(null);
            }}
            className={`${BTN_SECONDARY} w-full`}
          >
            Tolak
          </button>
        </>
      ) : (
        <>
          <label className={LABEL} htmlFor={`tolak-${newsId}`}>
            Catatan penolakan
          </label>
          <textarea
            id={`tolak-${newsId}`}
            value={reason}
            rows={3}
            maxLength={2000}
            disabled={busy}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Jelaskan bagian yang perlu diperbaiki pengaju."
            className={FIELD}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void reject()}
              className={BTN_DANGER}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {busy ? "Mengirim..." : "Kirim penolakan"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setRejecting(false);
                setReason("");
                setError(null);
              }}
              className={BTN_SECONDARY}
            >
              Batal
            </button>
          </div>
        </>
      )}

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
