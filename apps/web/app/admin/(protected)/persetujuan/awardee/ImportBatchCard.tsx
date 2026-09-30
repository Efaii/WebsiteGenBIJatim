"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import {
  getCmsImportBatchDetail,
  type CmsImportBatch,
  type CmsImportBatchDetail,
} from "@/lib/services/cms-membership.service";
import { BTN_SMALL, PANEL } from "../../../ui";
import {
  AWARDEE_STATUS_BADGE,
  AWARDEE_STATUS_LABEL,
  awardeeStatusClass,
} from "../../awardee/status";
import { ApprovalButtons } from "./ApprovalButtons";

const CLASSIFICATION_LABEL: Record<string, string> = {
  NEW: "Baru",
  UPDATED: "Diperbarui",
  UNCHANGED: "Tidak berubah",
  INVALID: "Tidak valid",
  AMBIGUOUS_MATCH: "Perlu tinjauan",
  DUPLICATE_IN_FILE: "Duplikat",
};

const CLASSIFICATION_CLASS: Record<string, string> = {
  NEW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UPDATED: "border-genbi-haze bg-genbi-light text-genbi-blue",
  UNCHANGED: "border-slate-200 bg-slate-100 text-slate-600",
  INVALID: "border-red-200 bg-red-50 text-red-700",
  AMBIGUOUS_MATCH: "border-amber-200 bg-amber-50 text-amber-800",
  DUPLICATE_IN_FILE: "border-red-200 bg-red-50 text-red-700",
};

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memuat isi batch. Periksa koneksi ke API lalu coba lagi.";
};

const text = (value: unknown): string =>
  typeof value === "string" && value.length > 0 ? value : "-";

/**
 * Kartu antrean untuk satu batch impor Awardee.
 *
 * Menampilkan asal scope, pengunggah, ringkasan hitungan baris, dan pratinjau
 * isi batch (dimuat saat dibuka) sebelum admin memutuskan setujui atau tolak.
 */
export function ImportBatchCard({ batch }: { batch: CmsImportBatch }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<CmsImportBatchDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (detail) return;
    setBusy(true);
    setError(null);
    try {
      setDetail(await getCmsImportBatchDetail(batch.id));
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const summary = [
    `${batch.newCount} baru`,
    `${batch.updatedCount} diperbarui`,
    `${batch.unchangedCount} tanpa perubahan`,
  ].join(", ");

  return (
    <li className={`${PANEL} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${AWARDEE_STATUS_BADGE} ${awardeeStatusClass(
                batch.status,
              )}`}
            >
              {AWARDEE_STATUS_LABEL[batch.status] ?? batch.status}
            </span>
            <h2 className="min-w-0 font-heading text-lg font-bold tracking-tight text-slate-900">
              {batch.sourceFilename}
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {batch.commissariatName} - {batch.periodLabel}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Diunggah {batch.uploaderName},{" "}
            {new Date(batch.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-slate-600">
        {batch.totalRows} baris: {summary}.
      </p>

      {expanded ? (
        <div className="mt-3">
          {busy ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Memuat isi batch...
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
              {error}
            </p>
          ) : detail ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Baris</th>
                    <th className="px-4 py-2.5 font-semibold">Nama</th>
                    <th className="px-4 py-2.5 font-semibold">Jabatan</th>
                    <th className="px-4 py-2.5 font-semibold">Divisi</th>
                    <th className="px-4 py-2.5 font-semibold">Prodi</th>
                    <th className="px-4 py-2.5 font-semibold">Klasifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-genbi-line">
                  {detail.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2.5 text-slate-500">
                        #{row.rowNumber}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        {text(row.normalizedValues?.nama ?? row.rawValues.nama)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {text(
                          row.normalizedValues?.jabatan ??
                            row.rawValues.jabatan,
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {text(row.normalizedValues?.divisi)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {text(
                          row.normalizedValues?.prodi ?? row.rawValues.prodi,
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            CLASSIFICATION_CLASS[row.classification] ??
                            CLASSIFICATION_CLASS.UNCHANGED
                          }`}
                        >
                          {CLASSIFICATION_LABEL[row.classification] ??
                            row.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        className={`${BTN_SMALL} mt-3`}
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
        {expanded ? "Tutup pratinjau" : "Pratinjau isi"}
      </button>

      <div className="mt-4 border-t border-genbi-line pt-4">
        <ApprovalButtons kind="IMPORT" id={batch.id} />
      </div>
    </li>
  );
}
