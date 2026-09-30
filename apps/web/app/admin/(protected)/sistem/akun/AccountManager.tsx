"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Plus,
  Power,
} from "lucide-react";
import {
  createCmsAccount,
  resetCmsAccountPassword,
  setCmsAccountStatus,
  type CmsOperatorAccount,
  type CmsOperatorRole,
} from "@/lib/services/cms-account.service";
import { getCmsAwardeeScopeOptions } from "@/lib/services/cms-membership.service";
import { ADMIN_ROLE_LABELS } from "../../../nav";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_SMALL,
  FIELD,
  LABEL,
  PANEL,
} from "../../../ui";

type PeriodOption = {
  id: string;
  label: string;
  commissariatId: string;
  commissariatName: string;
};

const ROLE_OPTIONS: Array<{ value: CmsOperatorRole; label: string }> = [
  { value: "SEKRETARIS_UMUM", label: "Sekretaris umum" },
  { value: "SEKRETARIS_DIVISI", label: "Sekretaris divisi" },
  { value: "ADMIN_GLOBAL", label: "Admin global" },
];

const STATUS_BADGE =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal memproses akun. Periksa koneksi ke API lalu coba lagi.";
};

const EMPTY_FORM = {
  username: "",
  name: "",
  password: "",
  role: "SEKRETARIS_UMUM" as CmsOperatorRole,
  commissariatId: "",
  periodId: "",
  divisionId: "",
};

type CreateForm = typeof EMPTY_FORM;

/**
 * Pengelolaan akun operator: daftar akun beserta peran, scope, dan statusnya,
 * form buat akun (peran dan penugasan), reset password, serta tombol
 * nonaktifkan atau aktifkan. Semua aksi menyegarkan data dari server.
 */
export function AccountManager({
  accounts,
  periods,
}: {
  accounts: CmsOperatorAccount[];
  periods: PeriodOption[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>({ ...EMPTY_FORM });
  const [divisions, setDivisions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [resetTarget, setResetTarget] = useState<CmsOperatorAccount | null>(
    null,
  );
  const [resetPassword, setResetPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const commissariats = useMemo(() => {
    const map = new Map<string, string>();
    for (const period of periods)
      map.set(period.commissariatId, period.commissariatName);
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [periods]);

  const periodOptions = useMemo(
    () => periods.filter((item) => item.commissariatId === form.commissariatId),
    [periods, form.commissariatId],
  );

  useEffect(() => {
    if (
      form.role !== "SEKRETARIS_DIVISI" ||
      !form.commissariatId ||
      !form.periodId
    ) {
      setDivisions([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const scoped = await getCmsAwardeeScopeOptions(
          form.commissariatId,
          form.periodId,
        );
        if (!cancelled) setDivisions(scoped.divisions);
      } catch {
        if (!cancelled) setDivisions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.role, form.commissariatId, form.periodId]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setCreateOpen(true);
    setResetTarget(null);
    setError(null);
    setMessage(null);
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy("create");
    setError(null);
    setMessage(null);
    try {
      const username = form.username.trim().toLowerCase();
      await createCmsAccount({
        username,
        name: form.name.trim(),
        password: form.password,
        role: form.role,
        commissariatId:
          form.role === "ADMIN_GLOBAL" ? null : form.commissariatId || null,
        periodId: form.role === "ADMIN_GLOBAL" ? null : form.periodId || null,
        divisionId:
          form.role === "SEKRETARIS_DIVISI" ? form.divisionId || null : null,
      });
      setMessage(
        `Akun ${username} dibuat dengan password awal. Password wajib diganti saat login pertama.`,
      );
      setCreateOpen(false);
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetTarget) return;
    setBusy("reset");
    setError(null);
    setMessage(null);
    try {
      await resetCmsAccountPassword(resetTarget.id, resetPassword);
      setMessage(
        `Password ${resetTarget.username} diganti. Akun wajib memakai password baru saat masuk berikutnya.`,
      );
      setResetTarget(null);
      setResetPassword("");
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const toggleStatus = async (account: CmsOperatorAccount) => {
    const next = account.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    setBusy(account.id);
    setError(null);
    setMessage(null);
    try {
      await setCmsAccountStatus(account.id, next);
      setMessage(
        next === "DISABLED"
          ? `Akun ${account.username} dinonaktifkan dan sesinya dihentikan.`
          : `Akun ${account.username} diaktifkan kembali.`,
      );
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const scopeLockedForRole = form.role !== "ADMIN_GLOBAL";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {accounts.length} akun operator terdaftar.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className={BTN_PRIMARY}
          disabled={createOpen}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Buat akun operator
        </button>
      </div>

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

      {createOpen ? (
        <section className={`${PANEL} p-4 md:p-6`}>
          <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
            Buat akun operator
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Akun bersama dipakai sesuai peran dan scope. Password awal
            diserahkan ke operator dan wajib diganti saat login pertama.
          </p>
          <form onSubmit={submitCreate} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="akun-username">
                  Username
                </label>
                <input
                  id="akun-username"
                  className={`${FIELD} mt-1`}
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  autoComplete="off"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Huruf kecil, angka, titik, garis bawah, atau strip.
                </p>
              </div>

              <div>
                <label className={LABEL} htmlFor="akun-nama">
                  Nama operator
                </label>
                <input
                  id="akun-nama"
                  className={`${FIELD} mt-1`}
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="akun-password">
                  Password awal
                </label>
                <input
                  id="akun-password"
                  type="password"
                  className={`${FIELD} mt-1`}
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Minimal 8 karakter.
                </p>
              </div>

              <div>
                <label className={LABEL} htmlFor="akun-role">
                  Peran
                </label>
                <select
                  id="akun-role"
                  className={`${FIELD} mt-1`}
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      role: event.target.value as CmsOperatorRole,
                      divisionId: "",
                    }))
                  }
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {scopeLockedForRole ? (
                <>
                  <div>
                    <label className={LABEL} htmlFor="akun-komisariat">
                      Komisariat
                    </label>
                    <select
                      id="akun-komisariat"
                      className={`${FIELD} mt-1`}
                      value={form.commissariatId}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          commissariatId: event.target.value,
                          periodId: "",
                          divisionId: "",
                        }))
                      }
                      required
                    >
                      <option value="">Pilih komisariat</option>
                      {commissariats.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="akun-periode">
                      Periode
                    </label>
                    <select
                      id="akun-periode"
                      className={`${FIELD} mt-1`}
                      value={form.periodId}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          periodId: event.target.value,
                          divisionId: "",
                        }))
                      }
                      required
                    >
                      <option value="">Pilih periode</option>
                      {periodOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}

              {form.role === "SEKRETARIS_DIVISI" ? (
                <div>
                  <label className={LABEL} htmlFor="akun-divisi">
                    Divisi
                  </label>
                  <select
                    id="akun-divisi"
                    className={`${FIELD} mt-1`}
                    value={form.divisionId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        divisionId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Pilih divisi</option>
                    {divisions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy !== null}
                className={BTN_PRIMARY}
              >
                {busy === "create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" aria-hidden />
                )}
                Simpan akun
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setCreateOpen(false);
                  setError(null);
                }}
                className={BTN_SECONDARY}
              >
                Batal
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {resetTarget ? (
        <section className={`${PANEL} p-4 md:p-6`}>
          <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
            Reset password {resetTarget.username}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Sesi aktif akun ini dihentikan dan password wajib diganti saat login
            berikutnya.
          </p>
          <form
            onSubmit={submitReset}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px] flex-1">
              <label className={LABEL} htmlFor="akun-reset-password">
                Password baru
              </label>
              <input
                id="akun-reset-password"
                type="password"
                className={`${FIELD} mt-1`}
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy !== null}
              className={BTN_PRIMARY}
            >
              {busy === "reset" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="h-4 w-4" aria-hidden />
              )}
              Simpan password
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                setResetTarget(null);
                setResetPassword("");
                setError(null);
              }}
              className={BTN_SECONDARY}
            >
              Batal
            </button>
          </form>
        </section>
      ) : null}

      {accounts.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <KeyRound className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Belum ada akun operator
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Mulai dengan membuat akun pertama.
          </p>
        </div>
      ) : (
        <div className={`${PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Akun</th>
                  <th className="px-5 py-3 font-semibold">Peran</th>
                  <th className="px-5 py-3 font-semibold">Scope</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="max-w-[240px] px-5 py-4">
                      <span className="block font-medium text-slate-900">
                        {account.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {account.username}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {ADMIN_ROLE_LABELS[account.role]}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {account.assignment
                        ? `${account.assignment.commissariat ?? "-"} - ${
                            account.assignment.period ?? "-"
                          }${
                            account.assignment.division
                              ? ` - ${account.assignment.division}`
                              : ""
                          }`
                        : "Lintas komisariat"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap gap-1.5">
                        <span
                          className={`${STATUS_BADGE} ${
                            account.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {account.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                        </span>
                        {account.mustChangePassword ? (
                          <span
                            className={`${STATUS_BADGE} border-amber-200 bg-amber-50 text-amber-800`}
                          >
                            Wajib ganti password
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => {
                            setResetTarget(account);
                            setResetPassword("");
                            setCreateOpen(false);
                            setError(null);
                            setMessage(null);
                          }}
                          className={BTN_SMALL}
                        >
                          <KeyRound className="h-3.5 w-3.5" aria-hidden />
                          Reset password
                        </button>
                        <button
                          type="button"
                          disabled={busy !== null}
                          onClick={() => void toggleStatus(account)}
                          className={BTN_SMALL}
                        >
                          {busy === account.id ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Power className="h-3.5 w-3.5" aria-hidden />
                          )}
                          {account.status === "ACTIVE"
                            ? "Nonaktifkan"
                            : "Aktifkan"}
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
