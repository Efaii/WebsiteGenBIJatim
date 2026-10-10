"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/*
 * Tombol "kembali" generik untuk halaman detail.
 *
 * Perilaku (permintaan pemilik produk): kembali ke HALAMAN SEBELUMNYA lewat
 * riwayat peramban, bukan selalu membuka halaman daftar.
 * - Kalau datang dari halaman situs ini (`document.referrer` searah), pakai
 *   `router.back()`.
 * - Kalau tidak, cek riwayat tab: `history.length > 2` berarti ada minimal
 *   satu halaman lain sebelum halaman ini (angka 2 bisa berasal dari entri
 *   awal peramban), baru pakai `router.back()`.
 * - Selain itu (tautan dibuka langsung), jatuh ke `fallbackHref` supaya
 *   tombol tidak diam atau mundur ke halaman kosong.
 * Komponen ini klien karena butuh `useRouter`.
 */
export function BackLink({
  label,
  fallbackHref,
}: {
  label: string;
  fallbackHref: string;
}) {
  const router = useRouter();

  function handleClick() {
    const cameFromThisSite =
      document.referrer !== "" &&
      document.referrer.startsWith(window.location.origin);

    if (cameFromThisSite || window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex cursor-pointer items-center gap-2 rounded-sm text-sm font-semibold text-genbi-ink/75 transition-colors hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 focus-visible:ring-offset-2"
    >
      <ArrowLeft
        size={16}
        className="transition-transform group-hover:-translate-x-0.5"
      />
      {label}
    </button>
  );
}
