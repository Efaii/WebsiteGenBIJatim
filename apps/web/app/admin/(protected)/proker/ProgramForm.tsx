"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  createCmsProgram,
  updateCmsProgram,
  type CmsProgramItem,
  type ProgramWritePayload,
} from "@/lib/services/cms-program.service";
import { BTN_PRIMARY, FIELD, LABEL, PANEL } from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan Program Kerja. Periksa koneksi ke API lalu coba lagi.";
};

/**
 * Formulir Program Kerja (buat draft baru / sunting draft atau hasil
 * penolakan). Cakupan komisariat, periode, dan divisi diambil dari akun.
 */
export function ProgramForm({
  program,
  canManage = true,
}: {
  program?: CmsProgramItem;
  canManage?: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(program?.namaProker ?? "");
  const [description, setDescription] = useState(
    program?.deskripsiProker ?? "",
  );
  const [objectives, setObjectives] = useState(
    (program?.objectives ?? []).join("\n"),
  );
  const [format, setFormat] = useState(program?.formatPelaksanaan ?? "");
  const [startDate, setStartDate] = useState(
    program?.startDate?.slice(0, 10) ?? "",
  );
  const [endDate, setEndDate] = useState(program?.endDate?.slice(0, 10) ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editing = Boolean(program);
  const editable =
    canManage &&
    (!program || ["DRAFT", "REJECTED"].includes(program.publicationStatus));
  const objectiveLines = objectives
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const valid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    format.trim().length > 0 &&
    objectiveLines.length > 0 &&
    startDate.length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const payload: ProgramWritePayload = {
        title: title.trim(),
        description: description.trim(),
        format: format.trim(),
        objectives: objectiveLines,
        startDate,
        ...(endDate ? { endDate } : {}),
      };
      if (editing && program) {
        await updateCmsProgram(program.id, payload);
        setMessage("Perubahan tersimpan.");
        router.refresh();
      } else {
        const created = await createCmsProgram(payload);
        router.push(`/admin/proker/${created.id}`);
      }
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${PANEL} space-y-5 p-6`}>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          Isi Program Kerja
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Lengkapi judul, deskripsi, tujuan, format pelaksanaan, dan tanggal.
          Draft bisa disimpan kapan saja.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="proker-title">
          Judul
        </label>
        <input
          id="proker-title"
          value={title}
          maxLength={160}
          disabled={!editable}
          onChange={(event) => setTitle(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="proker-description">
          Deskripsi
        </label>
        <textarea
          id="proker-description"
          value={description}
          rows={5}
          maxLength={5000}
          disabled={!editable}
          onChange={(event) => setDescription(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="proker-objectives">
          Tujuan (satu per baris)
        </label>
        <textarea
          id="proker-objectives"
          value={objectives}
          rows={4}
          disabled={!editable}
          onChange={(event) => setObjectives(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="proker-format">
          Format pelaksanaan
        </label>
        <input
          id="proker-format"
          value={format}
          maxLength={120}
          placeholder="mis. Online"
          disabled={!editable}
          onChange={(event) => setFormat(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="proker-start">
            Tanggal mulai
          </label>
          <input
            id="proker-start"
            type="date"
            value={startDate}
            disabled={!editable}
            onChange={(event) => setStartDate(event.target.value)}
            className={`${FIELD} mt-1`}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="proker-end">
            Tanggal selesai
          </label>
          <input
            id="proker-end"
            type="date"
            value={endDate}
            disabled={!editable}
            onChange={(event) => setEndDate(event.target.value)}
            className={`${FIELD} mt-1`}
          />
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Opsional; kosong berarti sama dengan tanggal mulai.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {editable && (
          <button
            type="submit"
            disabled={busy || !valid}
            className={BTN_PRIMARY}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy
              ? "Menyimpan..."
              : editing
                ? "Simpan perubahan"
                : "Buat draft"}
          </button>
        )}
        {!editable && program && (
          <p className="text-xs text-slate-500">
            {canManage
              ? `Program Kerja berstatus ${program.publicationStatus} tidak dapat disunting.`
              : "Hanya sekretaris divisi terkait yang dapat menyunting Program Kerja ini."}
          </p>
        )}
      </div>
    </form>
  );
}
