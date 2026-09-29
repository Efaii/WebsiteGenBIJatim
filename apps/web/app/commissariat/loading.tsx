import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";

/**
 * Skeleton rute `/commissariat` (tampil saat navigasi klien menunggu server).
 *
 * Bentuknya sengaja mengikuti layout final: judul, tiga kartu ringkasan,
 * grid kartu komisariat, dan panel "Kegiatan Terakhir" supaya tidak ada
 * lompatan tata letak saat data selesai dimuat. Denyutnya hanya aktif untuk
 * pengguna yang tidak meminta gerakan minimum (`motion-safe`).
 */
export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-genbi-soft text-slate-900">
      <Navbar />

      <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-genbi-light to-genbi-soft"></div>

      <main className="relative z-10 flex-1 pt-28 pb-20 motion-safe:animate-pulse">
        <p className="sr-only">Memuat data komisariat...</p>
        <Container>
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="h-10 w-72 max-w-full rounded-full bg-genbi-line/70"></div>
            <div className="h-5 w-96 max-w-full rounded-full bg-genbi-line/60"></div>
          </div>

          <div className="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-card border border-genbi-line bg-white p-6 shadow-sm"
              >
                <div className="h-3 w-24 rounded-full bg-genbi-line/70"></div>
                <div className="mt-3 h-9 w-20 rounded-thumb bg-genbi-line/80"></div>
                <div className="mt-4 h-6 w-28 rounded-full bg-genbi-line/60"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 lg:gap-8 xl:items-stretch">
            <div className="flex flex-col lg:col-span-3">
              <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-card border border-genbi-line bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 rounded-thumb bg-genbi-line/70"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/5 rounded-full bg-genbi-line/80"></div>
                        <div className="h-3 w-4/5 rounded-full bg-genbi-line/60"></div>
                      </div>
                    </div>
                    <div className="mt-4 h-10 rounded-thumb bg-genbi-line/50"></div>
                    <div className="mt-4 h-10 rounded-full bg-genbi-line/60"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-first flex flex-col lg:order-none lg:col-span-1">
              <div className="flex flex-col rounded-card border border-genbi-line bg-white p-5 shadow-sm xl:h-full">
                <div className="h-5 w-40 rounded-full bg-genbi-line/80"></div>
                <div className="mt-2 h-3 w-3/4 rounded-full bg-genbi-line/60"></div>
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index}>
                      <div className="h-4 w-5/6 rounded-full bg-genbi-line/80"></div>
                      <div className="mt-2 h-3 w-2/3 rounded-full bg-genbi-line/60"></div>
                      <div className="mt-2 flex items-start gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-thumb bg-genbi-line/70 lg:hidden xl:block"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-full rounded-full bg-genbi-line/60"></div>
                          <div className="h-3 w-4/5 rounded-full bg-genbi-line/60"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <div className="h-10 rounded-full bg-genbi-line/60"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <div className="relative border-t border-genbi-line bg-white">
        <Footer />
      </div>
    </div>
  );
}
