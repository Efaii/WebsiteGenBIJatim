import Image from "next/image";
import { connection } from "next/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import { getPeriodHasData, getPublicPeriods } from "@/lib/services/period.service";
import {
  profilDivisions,
  profilHighlights,
  profilKoorkom,
  profilMisi,
  profilPeriode,
  profilQuote,
  profilVisi,
} from "@/content/profil";
import { ProfilCerita } from "./ProfilCerita";
import { ProfilHighlights } from "./ProfilHighlights";
import { ProfilStruktur } from "./ProfilStruktur";

/**
 * Halaman profil tingkat Korwil Jawa Timur.
 *
 * Urutannya: judul rata tengah (pemilih periode ada di navbar), tentang
 * koordinator (foto dan visi & misi), kegiatan terpilih gaya FAQ, struktur
 * organisasi gaya carousel, lalu cerita penutup. Isi statisnya ada di
 * `content/profil.ts`; daftar periode dan penanda ketersediaan data tetap
 * diambil dari API.
 *
 * Catatan tema: halaman ini memakai tema terang yang sama dengan halaman
 * program dan komisariat. Komponen `AboutClient` lama tidak dipakai lagi di
 * sini, tapi TETAP dipakai halaman /about dan tidak boleh diubah.
 */
export default async function ProfilView({
  period,
}: {
  period: string | null;
}) {
  await connection();
  const { periods } = await getPublicPeriods();
  const active = period ?? periods[0] ?? null;
  const hasData = active ? await getPeriodHasData(active) : false;

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/*
         * 1. Judul dua baris, rata tengah. Pemilih periode pindah ke dropdown
         * navbar (permintaan pemilik produk), jadi pill periode dan label
         * kecil "Profil Periode" dihapus dari sini.
         */}
        <section className="border-b border-genbi-line bg-genbi-soft pb-16 pt-36 md:pb-20 md:pt-40">
          <Container className="text-center">
            <h1 className="font-heading text-[2rem] font-bold leading-[1.15] tracking-tight text-slate-900 md:text-[2.25rem] lg:text-[2.5rem]">
              Kenali Koordinator Komisariat GenBI Jatim,
              <br />
              <span className="text-genbi-blue">
                Periode {active ?? profilPeriode}
              </span>
            </h1>
            {active && !hasData && (
              <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-dashed border-genbi-line bg-white px-5 py-4 text-sm text-slate-500">
                Data untuk periode {active} belum tersedia. Bagian naratif di
                bawah tetap berlaku lintas periode.
              </p>
            )}
          </Container>
        </section>

        {/*
         * 2. Tentang koordinator: satu foto landscape di kiri tanpa keterangan
         * (permintaan pemilik produk), visi & misi di kanan. Sudut foto kecil
         * supaya tidak terlihat terlalu rounded.
         */}
        <section className="border-b border-genbi-line bg-white py-20 md:py-24 lg:py-28">
          <Container>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
              <figure>
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-thumb border border-genbi-line bg-genbi-light">
                  <Image
                    src={profilKoorkom.image}
                    alt="Foto Koordinator Komisariat GenBI Jawa Timur"
                    fill
                    sizes="(max-width: 1024px) 90vw, 38vw"
                    className="object-cover"
                  />
                </div>
              </figure>

              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Visi &amp; Misi
                </h2>
                <h3 className="mt-6 font-heading text-lg font-bold text-genbi-blue">
                  Visi
                </h3>
                <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-slate-900 md:text-base">
                  {profilVisi}
                </p>
                <h3 className="mt-8 font-heading text-lg font-bold text-genbi-blue">
                  Misi
                </h3>
                <ol className="mt-3 space-y-3">
                  {profilMisi.map((item, index) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-slate-900 md:text-base"
                    >
                      <span className="mt-0.5 font-heading text-sm font-bold tabular-nums text-slate-900">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>

        {/* 3. Kegiatan terpilih, gaya FAQ. */}
        <ProfilHighlights items={profilHighlights} quote={profilQuote} />

        {/* 4. Struktur organisasi, gaya carousel. */}
        <ProfilStruktur divisions={profilDivisions} />

        {/* 5. Cerita penutup + kolase. */}
        <ProfilCerita />
      </main>

      <Footer />
    </div>
  );
}
