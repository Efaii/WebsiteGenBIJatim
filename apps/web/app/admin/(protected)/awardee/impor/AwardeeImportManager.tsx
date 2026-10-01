"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Loader2,
  Save,
  Send,
  Upload,
} from "lucide-react";
import {
  commitCmsAwardeeImport,
  getCmsAwardeeScopeOptions,
  previewCmsAwardeeImport,
  reviewCmsAwardeeImportAlias,
  submitCmsAwardeeImport,
  type AwardeeImportPreviewResult,
  type AwardeeImportRow,
  type AwardeeImportRowClassification,
  type CmsAwardeeOptions,
} from "@/lib/services/cms-membership.service";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SMALL,
  FIELD,
  FIELD_BASE,
  FILE_INPUT,
  LABEL,
  PANEL,
} from "../../../ui";

type ImportRole = "SEKRETARIS_UMUM" | "ADMIN_GLOBAL";

const PER_PAGE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PER_PAGE = 10;
const LARGE_IMPORT_THRESHOLD = 100;

const PROBLEM_CLASSIFICATIONS: AwardeeImportRowClassification[] = [
  "INVALID",
  "AMBIGUOUS_MATCH",
  "DUPLICATE_IN_FILE",
];

const FILTER_OPTIONS: Array<{
  value: AwardeeImportRowClassification | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "Semua klasifikasi" },
  { value: "NEW", label: "Baru" },
  { value: "UPDATED", label: "Diperbarui" },
  { value: "UNCHANGED", label: "Tidak berubah" },
  { value: "INVALID", label: "Tidak valid" },
  { value: "AMBIGUOUS_MATCH", label: "Perlu tinjauan" },
  { value: "DUPLICATE_IN_FILE", label: "Duplikat" },
];

const CLASSIFICATION_LABEL: Record<AwardeeImportRowClassification, string> = {
  NEW: "Baru",
  UPDATED: "Diperbarui",
  UNCHANGED: "Tidak berubah",
  INVALID: "Tidak valid",
  AMBIGUOUS_MATCH: "Perlu tinjauan",
  DUPLICATE_IN_FILE: "Duplikat",
};

const CLASSIFICATION_CLASS: Record<AwardeeImportRowClassification, string> = {
  NEW: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UPDATED: "border-genbi-haze bg-genbi-light text-genbi-blue",
  UNCHANGED: "border-slate-200 bg-slate-100 text-slate-600",
  INVALID: "border-red-200 bg-red-50 text-red-700",
  AMBIGUOUS_MATCH: "border-amber-200 bg-amber-50 text-amber-800",
  DUPLICATE_IN_FILE: "border-red-200 bg-red-50 text-red-700",
};

const BADGE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

const PAGE_BUTTON =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

const ERROR_LABEL: Record<string, string> = {
  INVALID_COMMISSARIAT: "Nama komisariat tidak dikenali untuk scope ini.",
  INVALID_ROW: "Nama, jabatan, atau program studi kosong.",
  UNMAPPED_DIVISION: "Divisi belum dikenali.",
  DUPLICATE_IN_FILE: "Sama dengan baris lain di berkas ini.",
  AMBIGUOUS_MATCH: "Cocok dengan lebih dari satu data Awardee.",
};

const errorText = (code: string, role: ImportRole): string => {
  if (code === "UNMAPPED_DIVISION")
    return role === "ADMIN_GLOBAL"
      ? "Divisi belum dikenali; tinjau pemetaannya di panel pemetaan."
      : "Divisi belum dikenali; minta admin global meninjau pemetaannya.";
  return ERROR_LABEL[code] ?? code;
};

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memproses impor. Periksa koneksi ke API lalu coba lagi.";
};

type PreviewStatus = "idle" | "previewed" | "committed" | "submitted";

type BusyState = "preview" | "commit" | "submit" | null;

const rowName = (row: AwardeeImportRow): string =>
  row.normalizedValues?.nama ?? String(row.rawValues.nama ?? "-");

const rowPosition = (row: AwardeeImportRow): string =>
  row.normalizedValues?.jabatan ?? String(row.rawValues.jabatan ?? "-");

const rowDivision = (row: AwardeeImportRow): string =>
  row.normalizedValues?.divisi ?? "-";

const rowStudyProgram = (row: AwardeeImportRow): string =>
  row.normalizedValues?.prodi ?? String(row.rawValues.prodi ?? "-");

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/**
 * Alur impor batch Awardee: unggah berkas, tinjau pratinjau per baris,
 * tinjau pemetaan divisi (admin global), simpan batch, lalu ajukan.
 *
 * Pratinjau berlaku 30 menit. Baris Baru dan Diperbarui tersimpan sebagai
 * Draft sampai batch disetujui admin global di halaman Persetujuan Awardee.
 */
export function AwardeeImportManager({
  role,
  options,
}: {
  role: ImportRole;
  options: CmsAwardeeOptions;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminPeriodId, setAdminPeriodId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<AwardeeImportPreviewResult | null>(
    null,
  );
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [busy, setBusy] = useState<BusyState>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [backupEvidence, setBackupEvidence] = useState("");
  const [filter, setFilter] = useState<AwardeeImportRowClassification | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [scopeDivisions, setScopeDivisions] = useState<Array<{
    id: string;
    name: string;
  }> | null>(null);
  const [divisionError, setDivisionError] = useState<string | null>(null);
  const [aliasSelections, setAliasSelections] = useState<
    Record<string, string>
  >({});
  const [aliasSaved, setAliasSaved] = useState<Record<string, boolean>>({});
  const [aliasBusy, setAliasBusy] = useState<string | null>(null);

  const periods = useMemo(() => options.periods ?? [], [options.periods]);

  const activeScope = useMemo(() => {
    if (role === "SEKRETARIS_UMUM") {
      if (!options.commissariat?.id || !options.period?.id) return null;
      return {
        commissariatId: options.commissariat.id,
        periodId: options.period.id,
      };
    }
    const period = periods.find((item) => item.id === adminPeriodId);
    if (!period) return null;
    return { commissariatId: period.commissariatId, periodId: period.id };
  }, [role, options.commissariat, options.period, periods, adminPeriodId]);

  const activeScopeLabel = useMemo(() => {
    if (!activeScope) return null;
    if (role === "SEKRETARIS_UMUM")
      return `${options.commissariat?.name ?? "Komisariat"} - ${
        options.period?.label ?? "Periode"
      }`;
    const period = periods.find((item) => item.id === activeScope.periodId);
    return period ? `${period.commissariatName} - ${period.label}` : null;
  }, [activeScope, role, options, periods]);

  const problemRows = useMemo(
    () =>
      preview
        ? preview.rows.filter((row) =>
            PROBLEM_CLASSIFICATIONS.includes(row.classification),
          )
        : [],
    [preview],
  );
  const problemCount = problemRows.length;
  const problemCodes = useMemo(
    () => Array.from(new Set(problemRows.flatMap((row) => row.errors))),
    [problemRows],
  );

  const unmappedValues = useMemo(() => {
    if (!preview) return [] as string[];
    const values = new Set<string>();
    for (const row of preview.rows) {
      if (
        row.errors.includes("UNMAPPED_DIVISION") &&
        row.normalizedValues?.divisi
      )
        values.add(row.normalizedValues.divisi);
    }
    return Array.from(values);
  }, [preview]);

  const showAliasPanel =
    role === "ADMIN_GLOBAL" && unmappedValues.length > 0 && status !== "idle";

  useEffect(() => {
    if (!showAliasPanel || !activeScope) return;
    let cancelled = false;
    void (async () => {
      try {
        const scoped = await getCmsAwardeeScopeOptions(
          activeScope.commissariatId,
          activeScope.periodId,
        );
        if (!cancelled) setScopeDivisions(scoped.divisions);
      } catch {
        if (!cancelled)
          setDivisionError("Gagal memuat daftar divisi scope ini.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showAliasPanel, activeScope]);

  const filteredRows = useMemo(() => {
    if (!preview) return [] as AwardeeImportRow[];
    if (filter === "ALL") return preview.rows;
    return preview.rows.filter((row) => row.classification === filter);
  }, [preview, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pageRows = filteredRows.slice(startIndex, startIndex + perPage);

  const largeNeedsConfirm = Boolean(
    preview && preview.totalRows > LARGE_IMPORT_THRESHOLD,
  );
  const commitDisabled =
    busy !== null ||
    problemCount > 0 ||
    (largeNeedsConfirm && !(backupConfirmed && backupEvidence.trim()));

  const handlePreview = async () => {
    if (!file || !activeScope) return;
    setBusy("preview");
    setError(null);
    setMessage(null);
    try {
      const result = await previewCmsAwardeeImport(
        file,
        activeScope.commissariatId,
        activeScope.periodId,
      );
      setPreview(result);
      setStatus("previewed");
      setFilter("ALL");
      setPage(1);
      setBackupConfirmed(false);
      setBackupEvidence("");
      setScopeDivisions(null);
      setDivisionError(null);
      setAliasSelections({});
      setAliasSaved({});
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    setBusy("commit");
    setError(null);
    setMessage(null);
    try {
      await commitCmsAwardeeImport(preview.previewId, {
        confirmLargeImport: largeNeedsConfirm ? backupConfirmed : undefined,
        backupEvidenceId: largeNeedsConfirm ? backupEvidence.trim() : undefined,
      });
      setStatus("committed");
      setMessage(
        "Batch tersimpan sebagai Draft. Ajukan untuk disetujui admin global.",
      );
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setBusy("submit");
    setError(null);
    setMessage(null);
    try {
      await submitCmsAwardeeImport(preview.previewId);
      setStatus("submitted");
      setMessage(
        "Batch diajukan. Setelah disetujui admin global, seluruh baris batch ini terbit di halaman Awardee.",
      );
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const resetImport = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreview(null);
    setStatus("idle");
    setError(null);
    setMessage(null);
    setBackupConfirmed(false);
    setBackupEvidence("");
    setFilter("ALL");
    setPage(1);
    setScopeDivisions(null);
    setDivisionError(null);
    setAliasSelections({});
    setAliasSaved({});
  };

  const saveAlias = async (rawValue: string) => {
    if (!activeScope) return;
    const divisionId = aliasSelections[rawValue];
    if (!divisionId) {
      setError("Pilih divisi tujuan lebih dulu.");
      return;
    }
    setAliasBusy(rawValue);
    setError(null);
    try {
      await reviewCmsAwardeeImportAlias({
        kind: "DIVISION",
        rawValue,
        commissariatId: activeScope.commissariatId,
        periodId: activeScope.periodId,
        divisionId,
      });
      setAliasSaved((prev) => ({ ...prev, [rawValue]: true }));
      setMessage(
        `Pemetaan "${rawValue}" disimpan. Unggah ulang berkas agar pratinjau baru memakai pemetaan ini.`,
      );
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setAliasBusy(null);
    }
  };

  const stats = preview
    ? [
        {
          label: "Total baris",
          value: preview.totalRows,
          className: "border-slate-200 bg-white text-slate-700",
        },
        {
          label: "Baru",
          value: preview.newCount,
          className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        },
        {
          label: "Diperbarui",
          value: preview.updatedCount,
          className: "border-genbi-haze bg-genbi-light text-genbi-blue",
        },
        {
          label: "Tidak berubah",
          value: preview.unchangedCount,
          className: "border-slate-200 bg-slate-50 text-slate-600",
        },
        {
          label: "Tidak valid",
          value: preview.invalidCount,
          className: "border-red-200 bg-red-50 text-red-700",
        },
        {
          label: "Perlu tinjauan",
          value: preview.ambiguousCount,
          className: "border-amber-200 bg-amber-50 text-amber-800",
        },
        {
          label: "Duplikat",
          value: preview.duplicateCount,
          className: "border-red-200 bg-red-50 text-red-700",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <section className={`${PANEL} p-4 md:p-6`}>
        <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
          Unggah berkas
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Format kolom: Komisariat, Nama Lengkap, Jabatan, Divisi, Prodi. Satu
          sheet data, berkas .xlsx maksimal 10 MB.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="impor-scope">
              {role === "SEKRETARIS_UMUM"
                ? "Scope akun"
                : "Komisariat dan periode"}
            </label>
            {role === "SEKRETARIS_UMUM" ? (
              <p
                id="impor-scope"
                className={`${FIELD} mt-1 border-slate-200 bg-genbi-soft text-slate-700`}
              >
                {activeScopeLabel ?? "Scope akun belum tersedia."}
              </p>
            ) : (
              <select
                id="impor-scope"
                value={adminPeriodId}
                onChange={(event) => setAdminPeriodId(event.target.value)}
                className={`${FIELD} mt-1`}
              >
                <option value="">Pilih komisariat dan periode</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.commissariatName} - {period.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={LABEL} htmlFor="impor-file">
              Berkas Excel
            </label>
            <input
              ref={fileInputRef}
              id="impor-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError(null);
              }}
              className={`${FILE_INPUT} mt-1`}
            />
            {file ? (
              <p className="mt-1 text-xs text-slate-500">
                {file.name} ({formatFileSize(file.size)})
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Belum ada berkas dipilih.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!file || !activeScope || busy !== null}
            className={BTN_PRIMARY}
          >
            {busy === "preview" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="h-4 w-4" aria-hidden />
            )}
            Unggah dan pratinjau
          </button>
          {preview ? (
            <button
              type="button"
              onClick={resetImport}
              disabled={busy !== null}
              className={BTN_SECONDARY}
            >
              Bersihkan
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-thumb border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="leading-relaxed">{error}</p>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-thumb border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p className="leading-relaxed">{message}</p>
        </div>
      ) : null}

      {preview ? (
        <section className={`${PANEL} p-4 md:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
                Hasil pratinjau
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Sheet {preview.sourceSheet} -{" "}
                {activeScopeLabel ?? "scope terpilih"}
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Pratinjau berlaku 30 menit sejak diunggah.
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-thumb border px-3 py-2.5 ${stat.className}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {problemCount > 0 ? (
            <div className="mt-4 flex items-start gap-2 rounded-thumb border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
                aria-hidden
              />
              <div className="text-sm leading-relaxed text-red-700">
                <p className="font-semibold">
                  {problemCount} baris bermasalah. Batch tidak dapat disimpan
                  sebelum berkas diperbaiki lalu diunggah ulang.
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {problemCodes.map((code) => (
                    <li key={code}>{errorText(code, role)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {problemCount === 0 && largeNeedsConfirm ? (
            <div className="mt-4 rounded-thumb border border-genbi-haze bg-genbi-soft px-4 py-3">
              <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-genbi-blue"
                  aria-hidden
                />
                <p>
                  Batch ini berisi {preview.totalRows} baris, di atas{" "}
                  {LARGE_IMPORT_THRESHOLD} baris. Sesuai kebijakan impor,
                  penyimpanan memerlukan konfirmasi backup database.
                </p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={backupConfirmed}
                    onChange={(event) =>
                      setBackupConfirmed(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-genbi-blue focus:ring-genbi-blue/40"
                  />
                  Saya sudah mem-backup database sebelum menyimpan batch ini.
                </label>
                <div>
                  <label className={LABEL} htmlFor="impor-backup">
                    Bukti backup
                  </label>
                  <input
                    id="impor-backup"
                    type="text"
                    value={backupEvidence}
                    onChange={(event) => setBackupEvidence(event.target.value)}
                    placeholder="Nama berkas atau lokasi backup"
                    className={`${FIELD} mt-1`}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {showAliasPanel ? (
            <div className="mt-4 rounded-thumb border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Pemetaan divisi belum dikenali
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Pilih divisi tujuan untuk tiap nilai dari berkas, lalu
                    unggah ulang berkas agar pratinjau baru memakai pemetaan
                    ini.
                  </p>
                </div>
              </div>
              {divisionError ? (
                <p className="mt-2 text-xs text-red-700">{divisionError}</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {unmappedValues.map((rawValue, index) => (
                    <li
                      key={rawValue}
                      className="flex flex-wrap items-end gap-3 rounded-thumb border border-amber-200 bg-white p-3"
                    >
                      <div className="min-w-[160px] flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Nilai di berkas
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">
                          {rawValue}
                        </p>
                      </div>
                      <div className="min-w-[200px] flex-1">
                        <label
                          className={LABEL}
                          htmlFor={`impor-alias-${index}`}
                        >
                          Divisi tujuan
                        </label>
                        <select
                          id={`impor-alias-${index}`}
                          value={aliasSelections[rawValue] ?? ""}
                          onChange={(event) =>
                            setAliasSelections((prev) => ({
                              ...prev,
                              [rawValue]: event.target.value,
                            }))
                          }
                          className={`${FIELD} mt-1`}
                        >
                          <option value="">Pilih divisi</option>
                          {(scopeDivisions ?? []).map((division) => (
                            <option key={division.id} value={division.id}>
                              {division.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveAlias(rawValue)}
                        disabled={
                          aliasBusy !== null ||
                          aliasSaved[rawValue] ||
                          !aliasSelections[rawValue]
                        }
                        className={BTN_SMALL}
                      >
                        {aliasBusy === rawValue ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden
                          />
                        ) : null}
                        {aliasSaved[rawValue] ? "Tersimpan" : "Simpan pemetaan"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-genbi-line pt-4">
            {status === "previewed" ? (
              <button
                type="button"
                onClick={handleCommit}
                disabled={commitDisabled}
                className={BTN_PRIMARY}
              >
                {busy === "commit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                Simpan batch
              </button>
            ) : null}
            {status === "committed" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy !== null}
                className={BTN_PRIMARY}
              >
                {busy === "submit" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
                Ajukan untuk persetujuan
              </button>
            ) : null}
            {status === "submitted" ? (
              <button
                type="button"
                onClick={resetImport}
                disabled={busy !== null}
                className={BTN_SECONDARY}
              >
                Unggah berkas lain
              </button>
            ) : null}
            <p className="text-xs leading-relaxed text-slate-500">
              {status === "previewed" && problemCount === 0
                ? "Baris Baru dan Diperbarui tersimpan sebagai Draft setelah batch disimpan."
                : null}
              {status === "committed"
                ? "Batch tersimpan. Langkah terakhir: ajukan agar admin global menilai."
                : null}
              {status === "submitted"
                ? "Menunggu persetujuan admin global di halaman Persetujuan Awardee."
                : null}
            </p>
          </div>
        </section>
      ) : null}

      {preview ? (
        <section className={`${PANEL} p-4 md:p-6`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
                Pratinjau per baris
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Periksa baris bermasalah sebelum menyimpan batch.
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <label className={LABEL} htmlFor="impor-filter">
                  Klasifikasi
                </label>
                <select
                  id="impor-filter"
                  value={filter}
                  onChange={(event) => {
                    setFilter(
                      event.target.value as
                        | AwardeeImportRowClassification
                        | "ALL",
                    );
                    setPage(1);
                  }}
                  className={`${FIELD_BASE} mt-1 block`}
                >
                  {FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Baris</th>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Jabatan</th>
                  <th className="px-4 py-3 font-semibold">Divisi</th>
                  <th className="px-4 py-3 font-semibold">Prodi</th>
                  <th className="px-4 py-3 font-semibold">Klasifikasi</th>
                  <th className="px-4 py-3 font-semibold">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {pageRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="px-4 py-3 text-slate-500">
                      #{row.rowNumber}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 font-medium text-slate-900">
                      {rowName(row)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {rowPosition(row)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {rowDivision(row)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {rowStudyProgram(row)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${BADGE} ${
                          CLASSIFICATION_CLASS[row.classification]
                        }`}
                      >
                        {CLASSIFICATION_LABEL[row.classification]}
                      </span>
                    </td>
                    <td className="max-w-[260px] px-4 py-3 text-xs leading-relaxed text-slate-500">
                      {row.errors.length === 0
                        ? "-"
                        : row.errors
                            .map((code) => errorText(code, role))
                            .join(" ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-genbi-line pt-4">
            <p className="text-xs text-slate-500">
              {filteredRows.length === 0
                ? "Tidak ada baris pada klasifikasi ini."
                : `Menampilkan ${startIndex + 1}-${Math.min(
                    startIndex + perPage,
                    filteredRows.length,
                  )} dari ${filteredRows.length} baris`}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Per halaman</span>
              <select
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="Jumlah per halaman"
                className={`${FIELD_BASE} px-2 py-1 text-xs`}
              >
                {PER_PAGE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <nav
              className="flex items-center gap-1"
              aria-label="Navigasi halaman"
            >
              <button
                type="button"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={PAGE_BUTTON}
              >
                Sebelumnya
              </button>
              <span className="px-1 text-xs text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={PAGE_BUTTON}
              >
                Berikutnya
              </button>
            </nav>
          </div>
        </section>
      ) : null}

      {!preview ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <FileSpreadsheet className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Belum ada pratinjau
          </p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
            Pilih berkas Excel lalu unggah untuk melihat klasifikasi tiap baris:
            Baru, Diperbarui, Tidak berubah, atau baris bermasalah yang perlu
            diperbaiki.
          </p>
        </div>
      ) : null}
    </div>
  );
}
