import Image from "next/image";
import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata = { title: "Masuk" };

/**
 * Halaman masuk admin.
 *
 * Dua kolom mulai lg: panel merek bergradasi biru GenBI di kiri, formulir di
 * kanan. Di layar kecil panel merek disederhanakan menjadi baris logo di atas
 * formulir. Gradien dan tipografi mengikuti bahasa visual halaman publik.
 */
export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-genbi-ink p-12 lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-genbi-blue/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-genbi-bright/30 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="relative h-11 w-11 shrink-0">
            <Image
              src="/assets/logos/genbi.svg"
              alt=""
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            GenBI <span className="text-genbi-brand-red">Jatim</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-genbi-haze">
            Panel Konten
          </span>
          <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-white xl:text-4xl">
            Energi Baru untuk Indonesia
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-genbi-haze/90">
            Satu tempat untuk mengelola beranda, berita, dan FAQ GenBI Jawa
            Timur. Khusus admin global.
          </p>
        </div>

        <p className="relative z-10 text-xs leading-relaxed text-white/70">
          Kantor Perwakilan Bank Indonesia Provinsi Jawa Timur, Jl. Pahlawan No.
          105, Surabaya.
        </p>
      </aside>

      <section className="flex items-center justify-center bg-genbi-soft px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="relative h-10 w-10 shrink-0">
              <Image
                src="/assets/logos/genbi.svg"
                alt=""
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </span>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-genbi-ink">GenBI</span>{" "}
              <span className="text-genbi-brand-red">Jatim</span>
            </span>
            <span className="rounded-full border border-genbi-haze bg-genbi-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-genbi-blue">
              Admin
            </span>
          </div>
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
