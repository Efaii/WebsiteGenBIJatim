"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import {
  cmsProgramArtifactUrl,
  uploadCmsProgramArtifact,
  type CmsProgramItem,
} from "@/lib/services/cms-program.service";
import { BTN_SECONDARY, BTN_SMALL, FILE_INPUT, LABEL, PANEL } from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal mengunggah berkas. Periksa koneksi ke API lalu coba lagi.";
};

const formatBytes = (size: number): string =>
  size >= 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;

const KIND_LABEL: Record<string, string> = {
  proposal: "Proposal",
  lpj: "LPJ",
};

/**
 * Berkas Program Kerja: daftar Proposal/LPJ dengan unduhan setelah disetujui,
 * plus unggahan Proposal pada fase draft dan LPJ setelah disetujui. Program
 * Kerja lama hasil rekonsiliasi tidak menerima berkas baru.
 */
export function ProgramArtifacts({
  program,
  canManage = true,
}: {
  program: CmsProgramItem;
  canManage?: boolean;
}) {
  const router = useRouter();
  const [busyKind, setBusyKind] = useState<"proposal" | "lpj" | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [lpjFile, setLpjFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const status = program.publicationStatus;
  const downloadable = ["APPROVED", "PUBLISHED"].includes(status);
  const isCmsOrigin = program.authorAccountId !== null;
  const canUploadProposal =
    canManage && isCmsOrigin && ["DRAFT", "REJECTED"].includes(status);
  const canUploadLpj =
    canManage && isCmsOrigin && ["APPROVED", "PUBLISHED"].includes(status);

  const upload = async (kind: "proposal" | "lpj", file: File | null) => {
    if (!file) {
      setError("Pilih berkas PDF terlebih dahulu.");
      return;
    }
    if (file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) {
      setError("Berkas harus PDF maksimal 10 MB.");
      return;
    }
    setBusyKind(kind);
    setError(null);
    setMessage(null);
    try {
      await uploadCmsProgramArtifact(program.id, kind, file);
      setMessage(
        kind === "proposal" ? "Proposal terunggah." : "LPJ terunggah.",
      );
      if (kind === "proposal") setProposalFile(null);
      else setLpjFile(null);
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusyKind(null);
    }
  };

  return (
    <section className={`${PANEL} p-6`}>
      <h2 className="text-sm font-semibold text-slate-900">Berkas</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Proposal diunggah sebelum mengajukan; LPJ menyusul setelah kegiatan
        selesai. Format PDF maksimal 10 MB.
      </p>

      {program.artifacts.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Belum ada berkas.</p>
      ) : (
        <ul className="mt-3 divide-y divide-genbi-line">
          {program.artifacts.map((artifact) => (
            <li
              key={artifact.id}
              className="flex flex-wrap items-center gap-3 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-thumb bg-genbi-light text-genbi-blue">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  {KIND_LABEL[artifact.kind] ?? artifact.kind}
                </span>
                <span className="block break-all text-xs text-slate-500">
                  {artifact.originalFilename} ({formatBytes(artifact.byteSize)})
                </span>
              </span>
              {downloadable ? (
                <a
                  href={cmsProgramArtifactUrl(program.id, artifact.id)}
                  target="_blank"
                  rel="noreferrer"
                  className={BTN_SMALL}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  Unduh
                </a>
              ) : (
                <span className="text-xs text-slate-400">
                  Unduhan terbuka setelah disetujui
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {canUploadProposal && (
        <div className="mt-4 border-t border-genbi-line pt-4">
          <label className={LABEL} htmlFor="proker-proposal">
            Unggah Proposal
          </label>
          <input
            id="proker-proposal"
            type="file"
            accept="application/pdf,.pdf"
            disabled={busyKind !== null}
            onChange={(event) =>
              setProposalFile(event.target.files?.[0] ?? null)
            }
            className={`${FILE_INPUT} mt-2`}
          />
          <button
            type="button"
            disabled={busyKind !== null}
            onClick={() => void upload("proposal", proposalFile)}
            className={`${BTN_SECONDARY} mt-3`}
          >
            {busyKind === "proposal" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {busyKind === "proposal" ? "Mengunggah..." : "Unggah Proposal"}
          </button>
        </div>
      )}

      {canUploadLpj && (
        <div className="mt-4 border-t border-genbi-line pt-4">
          <label className={LABEL} htmlFor="proker-lpj">
            Unggah LPJ
          </label>
          <input
            id="proker-lpj"
            type="file"
            accept="application/pdf,.pdf"
            disabled={busyKind !== null}
            onChange={(event) => setLpjFile(event.target.files?.[0] ?? null)}
            className={`${FILE_INPUT} mt-2`}
          />
          <button
            type="button"
            disabled={busyKind !== null}
            onClick={() => void upload("lpj", lpjFile)}
            className={`${BTN_SECONDARY} mt-3`}
          >
            {busyKind === "lpj" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            {busyKind === "lpj" ? "Mengunggah..." : "Unggah LPJ"}
          </button>
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-700">
          {message}
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
