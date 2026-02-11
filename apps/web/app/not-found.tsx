import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white p-6 text-center">
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
        <h1 className="relative text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
          404
        </h1>
      </div>
      <h2 className="text-2xl font-bold mt-4 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-blue-200/60 max-w-md mb-8 leading-relaxed">
        Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau
        tidak pernah ada.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg" className="rounded-full">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
