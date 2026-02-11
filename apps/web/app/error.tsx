"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan!</h2>
      <p className="text-blue-200/60 max-w-md mb-8 leading-relaxed">
        Maaf, terjadi kesalahan yang tidak terduga. Silakan coba muat ulang
        halaman.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => (window.location.href = "/")}
          variant="secondary"
          size="md"
        >
          Ke Beranda
        </Button>
        <Button onClick={() => reset()} variant="primary" size="md">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
