"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  transitionCmsProgram,
  type CmsProgramItem,
} from "@/lib/services/cms-program.service";
import { BTN_PRIMARY, BTN_SECONDARY, PANEL } from "../../ui";
import {
  PROGRAM_EXECUTION_LABEL,
  PROGRAM_STATUS_BADGE,
  PROGRAM_STATUS_LABEL,
  programStatusClass,
} from "./status";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menjalankan transisi status.";
};

const HINT: Record<string, string> = {
  DRAFT:
    "Unggah Proposal sebelum mengajukan. Admin global yang menyetujui dan menerbitkan.",
  REJECTED:
    "Program Kerja ditolak. Perbaiki sesuai catatan, lalu ajukan ulang ke admin global.",
  SUBMITTED: "Menunggu persetujuan admin global.",
  APPROVED: "Sudah disetujui; menunggu penerbitan admin global.",
  PUBLISHED:
    "Tayang di halaman program publik. Unggah LPJ setelah kegiatan selesai.",
  ARCHIVED: "Program Kerja sudah diarsipkan.",
};

/**
 * Kartu status Program Kerja untuk sekretaris divisi: pengajuan ke admin
 * global dan tautan publik setelah terbit. Persetujuan dan penerbitan
 * dijalankan admin global (ADR 0016 semangat yang sama untuk Program Kerja).
 */
export function ProgramActions({ program }: { program: CmsProgramItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = program.publicationStatus;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await transitionCmsProgram(program.id, "SUBMITTED");
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className="text-sm font-semibold text-slate-900">Status publikasi</h2>
      <p className="mt-3">
        <span
          className={`${PROGRAM_STATUS_BADGE} ${programStatusClass(status)}`}
        >
          {PROGRAM_STATUS_LABEL[status] ?? status}
        </span>
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Pelaksanaan:{" "}
        {PROGRAM_EXECUTION_LABEL[program.executionStatus] ??
          program.executionStatus}
      </p>

      {status === "REJECTED" && program.rejectionReason ? (
        <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700">
          Catatan penolakan: {program.rejectionReason}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {(status === "DRAFT" || status === "REJECTED") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className={`${BTN_PRIMARY} w-full`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy ? "Memproses..." : "Ajukan untuk terbit"}
          </button>
        )}
        {status === "PUBLISHED" && (
          <a
            href={`/program/${program.id}`}
            target="_blank"
            rel="noreferrer"
            className={`${BTN_SECONDARY} w-full`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Lihat publik
          </a>
        )}
      </div>

      {HINT[status] && (
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          {HINT[status]}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
