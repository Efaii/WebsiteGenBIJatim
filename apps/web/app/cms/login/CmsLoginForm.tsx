"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginCms } from "@/lib/services/cms-auth.service";

const NOTICES: Record<string, string> = {
  required: "Masuk dulu untuk membuka area CMS.",
  expired:
    "Sesi sebelumnya tidak valid atau sudah berakhir. Silakan masuk lagi.",
  "logged-out": "Anda telah keluar dari CMS.",
};

export function CmsLoginForm() {
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
      router.push("/cms");
      router.refresh();
    } catch {
      setError(
        "Tidak bisa masuk. Periksa username dan password, dan pastikan akun Anda aktif.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
        Masuk CMS
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Area ini hanya untuk admin global GenBI Jawa Timur.
      </p>

      {NOTICES[reason] && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {NOTICES[reason]}
        </p>
      )}

      <label
        className="mt-6 block text-sm font-medium text-slate-700"
        htmlFor="cms-username"
      >
        Username
      </label>
      <input
        id="cms-username"
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        autoComplete="username"
        required
      />

      <label
        className="mt-4 block text-sm font-medium text-slate-700"
        htmlFor="cms-password"
      >
        Password
      </label>
      <input
        id="cms-password"
        type="password"
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        required
      />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-genbi-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
