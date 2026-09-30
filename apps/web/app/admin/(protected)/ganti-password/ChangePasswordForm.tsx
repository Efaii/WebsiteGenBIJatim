"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2 } from "lucide-react";
import { changeCmsPassword } from "@/lib/services/cms-auth.service";
import { BTN_PRIMARY, BTN_SECONDARY, FIELD, LABEL, PANEL } from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan password. Periksa koneksi ke API lalu coba lagi.";
};

/**
 * Form ganti password mandiri: password lama, password baru, dan konfirmasi.
 *
 * Setelah berhasil, pengguna diarahkan ke ringkasan admin dan guard akan
 * berhenti mengalihkan karena `mustChangePassword` sudah bersih.
 */
export function ChangePasswordForm({ username }: { username: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru belum sama.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changeCmsPassword(currentPassword, newPassword);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${PANEL} mt-6 p-6 md:p-8`}>
      <p className="text-sm text-slate-500">
        Masuk sebagai{" "}
        <span className="font-semibold text-slate-700">{username}</span>
      </p>

      <label className={`${LABEL} mt-6`} htmlFor="password-lama">
        Password saat ini
      </label>
      <input
        id="password-lama"
        type="password"
        className={`${FIELD} mt-1`}
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      <label className={`${LABEL} mt-4`} htmlFor="password-baru">
        Password baru
      </label>
      <input
        id="password-baru"
        type="password"
        className={`${FIELD} mt-1`}
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
      />
      <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter.</p>

      <label className={`${LABEL} mt-4`} htmlFor="password-konfirmasi">
        Konfirmasi password baru
      </label>
      <input
        id="password-konfirmasi"
        type="password"
        className={`${FIELD} mt-1`}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
        minLength={8}
        required
      />

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? "Menyimpan..." : "Simpan password baru"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
          }}
          className={BTN_SECONDARY}
        >
          Bersihkan
        </button>
      </div>
    </form>
  );
}
