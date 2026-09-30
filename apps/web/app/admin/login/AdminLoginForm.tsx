"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CircleAlert, Info, Loader2 } from "lucide-react";
import { loginCms } from "@/lib/services/cms-auth.service";
import { BTN_PRIMARY, FIELD, LABEL, PANEL } from "../ui";

const NOTICES: Record<string, string> = {
  required: "Masuk dulu untuk membuka area admin.",
  expired: "Sesi sebelumnya sudah berakhir. Silakan masuk lagi.",
  "logged-out": "Anda sudah keluar dari area admin.",
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await loginCms(username.trim(), password);
      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Tidak bisa masuk. Periksa username dan password, dan pastikan akun Anda aktif.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${PANEL} p-8`}>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
        Masuk ke admin
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Area pengelolaan GenBI Jawa Timur. Menu mengikuti wewenang peran akun
        Anda.
      </p>

      {NOTICES[reason] && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl border border-genbi-haze bg-genbi-light px-3.5 py-3 text-sm leading-relaxed text-genbi-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{NOTICES[reason]}</span>
        </p>
      )}

      <label className={`${LABEL} mt-6`} htmlFor="admin-username">
        Username
      </label>
      <input
        id="admin-username"
        className={`${FIELD} mt-1`}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />

      <label className={`${LABEL} mt-4`} htmlFor="admin-password">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        className={`${FIELD} mt-1`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`${BTN_PRIMARY} mt-6 w-full`}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {submitting ? "Memproses..." : "Masuk"}
      </button>

      <Link
        href="/"
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-genbi-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke situs publik
      </Link>
    </form>
  );
}
