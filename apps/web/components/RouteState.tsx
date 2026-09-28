"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";

/**
 * Boundary error untuk route publik.
 *
 * Dipakai oleh `error.tsx` di setiap segmen route yang mengambil data. Karena
 * halaman publik merender Navbar/Footer sendiri (bukan dari root layout),
 * komponen ini ikut merendernya supaya halaman error tetap utuh secara visual.
 */
export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex max-w-lg flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50">
            <TriangleAlert className="h-8 w-8 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold">Konten gagal dimuat</h1>
          <p className="text-sm leading-relaxed text-slate-600" role="alert">
            Halaman ini tidak berhasil mengambil data dari server. Koneksi ke API
            mungkin sedang terganggu.
            {error.digest ? ` Kode kesalahan: ${error.digest}.` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Button onClick={() => reset()} variant="primary" size="md">
              Coba Lagi
            </Button>
            <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Skeleton loading untuk route publik. */
export function RouteLoading({ label = "Memuat halaman..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-600">{label}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
