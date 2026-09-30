"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Search, Send } from "lucide-react";
import {
  createCmsAwardee,
  submitCmsAwardeeChanges,
  updateCmsAwardee,
  type AwardeeWritePayload,
  type CmsAwardee,
  type CmsAwardeeOptions,
} from "@/lib/services/cms-membership.service";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SMALL,
  FIELD,
  FIELD_BASE,
  LABEL,
  PANEL,
} from "../../ui";
import {
  AWARDEE_MEMBERSHIP_LABEL,
  AWARDEE_STATUS_BADGE,
  AWARDEE_STATUS_LABEL,
  awardeeStatusClass,
} from "./status";

const PER_PAGE_OPTIONS = [5, 10, 15, 20];
const DEFAULT_PER_PAGE = 10;

const PAGE_BUTTON =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-light hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 disabled:pointer-events-none disabled:opacity-40";

const PAGE_BUTTON_ACTIVE =
  "border-genbi-blue bg-genbi-blue text-white hover:border-genbi-blue hover:bg-genbi-blue hover:text-white";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan data Awardee. Periksa koneksi ke API lalu coba lagi.";
};

type FormState = {
  id: string | null;
  name: string;
  position: string;
  studyProgram: string;
  divisionId: string;
  membershipStatus: "ACTIVE" | "INACTIVE";
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  position: "",
  studyProgram: "",
  divisionId: "",
  membershipStatus: "ACTIVE",
};

/**
 * Pengelolaan Awardee manual: pencarian, form tambah/ubah, daftar per
 * periode dengan status publikasi, dan pengajuan perubahan massal.
 *
 * Perubahan tersimpan sebagai Draft dan baru terbit setelah disetujui admin
 * global pada halaman Persetujuan Awardee.
 */
export function AwardeeManager({
  items,
  options,
}: {
  items: CmsAwardee[];
  options: CmsAwardeeOptions;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      items.filter((item) =>
        ["DRAFT", "REJECTED"].includes(item.publicationStatus),
      ).length,
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.name} ${item.position} ${item.division?.name ?? ""} ${
        item.studyProgram
      }`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(startIndex, startIndex + perPage);

  const pageNumbers: Array<number | "gap"> = [];
  let previous = 0;
  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const isEdge = candidate === 1 || candidate === totalPages;
    const isNear = Math.abs(candidate - currentPage) <= 1;
    if (isEdge || isNear) {
      if (previous && candidate - previous > 1) pageNumbers.push("gap");
      pageNumbers.push(candidate);
      previous = candidate;
    }
  }

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setError(null);
    setMessage(null);
  };

  const openEdit = (item: CmsAwardee) => {
    setForm({
      id: item.id,
      name: item.name,
      position: item.position,
      studyProgram: item.studyProgram,
      divisionId: item.divisionId ?? "",
      membershipStatus: item.membershipStatus,
    });
    setError(null);
    setMessage(null);
  };

  const valid =
    form !== null &&
    form.name.trim().length > 0 &&
    form.position.trim().length > 0 &&
    form.studyProgram.trim().length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const payload: AwardeeWritePayload = {
        name: form.name.trim(),
        position: form.position.trim(),
        studyProgram: form.studyProgram.trim(),
        divisionId: form.divisionId || null,
        membershipStatus: form.membershipStatus,
      };
      if (form.id) {
        await updateCmsAwardee(form.id, payload);
        setMessage(
          "Perubahan tersimpan sebagai Draft. Ajukan perubahan agar disetujui admin global.",
        );
      } else {
        await createCmsAwardee(payload);
        setMessage(
          "Awardee baru tersimpan sebagai Draft. Ajukan perubahan agar disetujui admin global.",
        );
      }
      setForm(null);
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitChanges = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const count = await submitCmsAwardeeChanges();
      setMessage(`${count} perubahan diajukan untuk persetujuan admin global.`);
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className={`${PANEL} p-4 md:p-6`}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className={LABEL} htmlFor="awardee-cari">
              Cari
            </label>
            <input
              id="awardee-cari"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Nama, jabatan, divisi, atau prodi"
              className={`${FIELD} mt-1`}
            />
          </div>
          <button type="button" onClick={openCreate} className={BTN_PRIMARY}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah Awardee
          </button>
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => void submitChanges()}
              disabled={submitting}
              className={BTN_SECONDARY}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              {submitting
                ? "Mengajukan..."
                : `Ajukan perubahan (${pendingCount})`}
            </button>
          )}
        </div>
        {message && (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
            {error}
          </p>
        )}
      </section>

      {form && (
        <section className={`${PANEL} p-4 md:p-6`}>
          <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {form.id ? "Ubah Awardee" : "Tambah Awardee"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="awardee-nama">
                  Nama
                </label>
                <input
                  id="awardee-nama"
                  value={form.name}
                  maxLength={191}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={`${FIELD} mt-1`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="awardee-jabatan">
                  Jabatan
                </label>
                <input
                  id="awardee-jabatan"
                  value={form.position}
                  maxLength={191}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, position: event.target.value })
                  }
                  className={`${FIELD} mt-1`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="awardee-divisi">
                  Divisi
                </label>
                <select
                  id="awardee-divisi"
                  value={form.divisionId}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, divisionId: event.target.value })
                  }
                  className={`${FIELD} mt-1`}
                >
                  <option value="">(tanpa divisi)</option>
                  {options.divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="awardee-prodi">
                  Program studi
                </label>
                <input
                  id="awardee-prodi"
                  value={form.studyProgram}
                  maxLength={191}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({ ...form, studyProgram: event.target.value })
                  }
                  className={`${FIELD} mt-1`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="awardee-status">
                  Status keanggotaan
                </label>
                <select
                  id="awardee-status"
                  value={form.membershipStatus}
                  disabled={busy}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      membershipStatus: event.target
                        .value as FormState["membershipStatus"],
                    })
                  }
                  className={`${FIELD} mt-1`}
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Nonaktif</option>
                </select>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Menyimpan mengembalikan entri ke status Draft. Entri baru tampil
              publik setelah perubahan disetujui admin global.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy || !valid}
                className={BTN_PRIMARY}
              >
                {busy && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                {busy ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setForm(null);
                  setError(null);
                }}
                className={BTN_SECONDARY}
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      )}

      {filtered.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <Search className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            {items.length === 0
              ? "Belum ada data Awardee"
              : "Tidak ada Awardee yang cocok"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {items.length === 0
              ? "Mulai dengan menambah entri pertama."
              : "Ubah kata kunci atau bersihkan pencarian."}
          </p>
        </div>
      ) : (
        <div className={`${PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Jabatan</th>
                  <th className="px-5 py-3 font-semibold">Divisi</th>
                  <th className="px-5 py-3 font-semibold">Prodi</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="max-w-[260px] px-5 py-4 font-medium text-slate-900">
                      {item.name}
                      {item.publicationStatus === "REJECTED" &&
                      item.rejectionReason ? (
                        <span className="mt-0.5 block text-xs font-normal leading-relaxed text-red-700">
                          Catatan: {item.rejectionReason}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.position}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.division?.name ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.studyProgram}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap gap-1.5">
                        <span
                          className={`${AWARDEE_STATUS_BADGE} ${awardeeStatusClass(
                            item.publicationStatus,
                          )}`}
                        >
                          {AWARDEE_STATUS_LABEL[item.publicationStatus] ??
                            item.publicationStatus}
                        </span>
                        {item.membershipStatus === "INACTIVE" && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            {AWARDEE_MEMBERSHIP_LABEL.INACTIVE}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className={BTN_SMALL}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-genbi-line px-5 py-4">
            <p className="text-xs text-slate-500">
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + perPage, filtered.length)} dari{" "}
              {filtered.length} Awardee
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
              {pageNumbers.map((entry, index) =>
                entry === "gap" ? (
                  <span
                    key={`gap-${index}`}
                    className="px-1 text-xs text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setPage(entry)}
                    aria-current={entry === currentPage ? "page" : undefined}
                    className={`${PAGE_BUTTON} ${
                      entry === currentPage ? PAGE_BUTTON_ACTIVE : ""
                    }`}
                  >
                    {entry}
                  </button>
                ),
              )}
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
        </div>
      )}
    </div>
  );
}
