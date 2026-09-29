"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { ProkerData } from "@repo/types";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/MotionWrapper";
import { StateMessage } from "@/components/StateMessage";
import {
  getAllCommissariats,
  getGlobalCommissariatStats,
  type CommissariatSummary,
} from "@/lib/services/commissariat.service";
import { getAllPrograms } from "@/lib/services/program.service";
import { selectRecentActivities } from "./recent-activities";

/** Statistik ringkas dari API. */
export type CommissariatStats = {
  totalProker: number;
  totalCommissariats: number;
  totalMembers: number;
};

/** Data yang dirender halaman; `null` berarti gagal dimuat. */
export type CommissariatPageData = {
  commissariats: CommissariatSummary[];
  stats: CommissariatStats;
  activities: ProkerData[];
};

/**
 * Gaya judul halaman. Disamakan dengan judul section di beranda
 * (font-heading, hitam tebal, 2rem / 2.5rem / 2.75rem) supaya konsisten.
 */
const PAGE_TITLE_CLASS =
  "font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]";

/**
 * next/image throws "Invalid URL" when a src is neither site-relative nor an
 * absolute URL, and the API can return junk (e.g. a test row with
 * logo_univ="test"). Fall back to the GenBI mark for anything unusable.
 */
const toLogoSrc = (src: string | null | undefined): string =>
  typeof src === "string" && (src.startsWith("/") || /^https?:\/\//.test(src))
    ? src
    : "/assets/logos/genbi.svg";

/** Rapikan spasi ganda dan baris baru dari Excel agar deskripsi rapi di panel. */
const tidyDescription = (text: string): string =>
  text.replace(/\s+/g, " ").trim();

/** Ambil ulang seluruh data dari API (dipakai tombol "Coba Lagi"). */
const fetchPageData = async (): Promise<CommissariatPageData> => {
  const [commissariats, stats, programs] = await Promise.all([
    getAllCommissariats(),
    getGlobalCommissariatStats(),
    getAllPrograms(),
  ]);
  return {
    commissariats,
    stats,
    activities: selectRecentActivities(programs),
  };
};

/**
 * Bagian interaktif halaman komisariat.
 *
 * Data awalnya dirender server (lihat `page.tsx`), jadi halaman tidak lagi
 * menampilkan spinner ketika dibuka. Island ini hanya menangani ulang saat
 * server gagal lewat tombol "Coba Lagi".
 */
export function CommissariatClient({
  data: initialData,
}: {
  data: CommissariatPageData | null;
}) {
  const [data, setData] = useState(initialData);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      setData(await fetchPageData());
    } catch (error) {
      // Tetap di keadaan gagal; pengguna boleh mencoba lagi.
      console.error("Gagal memuat ulang data komisariat:", error);
    } finally {
      setRetrying(false);
    }
  };

  /* --- KEADAAN GAGAL: server/API tidak bisa dihubungi --- */
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-genbi-soft text-slate-900">
        <Navbar />
        <main className="flex-1 pt-28 pb-24">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h1 className={`${PAGE_TITLE_CLASS} text-center`}>
                Pusat Data Komisariat
              </h1>
              <StateMessage
                tone="error"
                title="Data komisariat gagal dimuat"
                description="Server data sedang tidak dapat dihubungi, jadi angka dan daftar di halaman ini belum bisa ditampilkan."
                className="mt-8"
              />
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="rounded-full bg-genbi-blue px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-genbi-blue-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {retrying ? "Memuat..." : "Coba Lagi"}
                </button>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  const { commissariats, stats, activities } = data;

  /*
   * Tiga kartu ringkasan seperti versi sebelumnya. Sengaja div biasa, bukan
   * komponen Card: varian "glass" bawaannya menang urutan CSS atas override
   * bg-white/border-genbi-line, sehingga kartu tampil nyaris transparan.
   */
  const statCards = [
    {
      label: "Total Anggota",
      value: stats.totalMembers,
      badge: "Suramadu - Bojonegoro",
    },
    {
      label: "Komisariat Aktif",
      value: stats.totalCommissariats,
      badge: "Perguruan tinggi",
    },
    {
      label: "Total Program Kerja",
      value: stats.totalProker,
      badge: "Telah Dilaksanakan",
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-clip bg-genbi-soft text-slate-900 selection:bg-genbi-blue selection:text-white">
      <Navbar />

      {/* Latar hero yang mencair ke warna halaman, senada dengan beranda. */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-genbi-light to-genbi-soft"></div>

      <main className="relative z-10 flex-1 pt-28 pb-20">
        <Container>
          {/* Judul & ringkasan angka */}
          <section className="mb-12">
            <div className="relative z-10 mx-auto mb-10 flex max-w-4xl flex-col items-center text-center">
              <h1 className={PAGE_TITLE_CLASS}>Pusat Data Komisariat</h1>
              <div className="mt-4">
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
                  Ringkasan {stats.totalCommissariats} Komisariat GenBI di Jawa
                  Timur beserta jumlah anggota dan program kerjanya.
                </p>
              </div>
            </div>

            <FadeIn once={true} delay={0}>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="group relative overflow-hidden rounded-card border border-genbi-line bg-white p-6 shadow-md transition-colors hover:border-genbi-bright"
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-genbi-haze to-genbi-bright transition-colors group-hover:to-genbi-blue"></div>
                    <div className="relative z-10">
                      <p className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-500">
                        {card.label}
                      </p>
                      <p className="text-4xl font-bold text-slate-900">
                        {card.value}
                      </p>
                      <div className="mt-4 inline-block rounded-full bg-genbi-haze px-3 py-1 text-xs font-semibold text-genbi-ink shadow-sm">
                        {card.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </section>

          {/*
           * Mulai xl tinggi kedua kolom disamakan: kolom daftar direntangkan
           * (flex + auto-rows-fr) supaya kesembilan kartu ikut tumbuh mengisi
           * tinggi panel "Kegiatan Terakhir". Di bawah xl pembagiannya tetap
           * alami supaya panel tidak menyisakan ruang kosong besar.
           */}
          <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 lg:gap-8 xl:items-stretch">
            <div className="flex flex-col lg:col-span-3">
              {commissariats.length === 0 ? (
                <div
                  role="status"
                  className="rounded-card border border-dashed border-genbi-line bg-white/80 py-16 text-center italic text-slate-500"
                >
                  Data komisariat belum tersedia.
                </div>
              ) : (
                <StaggerContainer
                  once={true}
                  staggerDelay={0.05}
                  className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-3"
                >
                  {commissariats.map((comm) => (
                    <StaggerItem key={comm.id}>
                      <div className="group flex h-full flex-col rounded-card border border-genbi-line bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-genbi-bright hover:shadow-md">
                        <div className="flex flex-col p-5 pb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-thumb border border-genbi-line bg-genbi-light text-xl font-bold text-genbi-blue shadow-inner">
                              <Image
                                src={toLogoSrc(comm.logo_univ)}
                                alt={`${comm.name} Logo`}
                                width={48}
                                height={48}
                                className="h-full w-full object-contain p-2"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentElement!.innerHTML =
                                    comm.name.charAt(0);
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-genbi-blue">
                                {comm.name}
                              </h3>
                              {/*
                               * Nama kampus sengaja dibiarkan membungkus ke
                               * baris baru, bukan dipotong: "Politeknik
                               * Elektronika Negeri Surabaya" pernah tampil
                               * terpotong karena tidak cukup ruang.
                               */}
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                {comm.university}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mx-5 flex items-center gap-5 border-t border-genbi-line/70 py-3.5">
                          <p className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold leading-none tabular-nums text-slate-900">
                              {comm.memberCount}
                            </span>
                            <span className="text-xs text-slate-500">
                              Anggota
                            </span>
                          </p>
                          <span
                            className="h-5 w-px bg-genbi-line"
                            aria-hidden="true"
                          ></span>
                          <p className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold leading-none tabular-nums text-slate-900">
                              {comm.prokerCount}
                            </span>
                            <span className="text-xs text-slate-500">
                              Proker
                            </span>
                          </p>
                        </div>

                        <div className="mt-auto p-5 pt-3">
                          <Link
                            href={`/commissariat/${comm.slug}`}
                            className="block w-full"
                          >
                            <div className="group/btn flex h-10 w-full items-center justify-center gap-2 rounded-full border border-genbi-line bg-genbi-light text-sm font-bold text-genbi-ink shadow-sm transition-all hover:border-genbi-blue hover:bg-genbi-blue hover:text-white">
                              Kunjungi Profil
                              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>

            {/*
             * Di layar kecil panel ini tampil lebih dulu supaya kegiatan
             * terbaru tidak terkubur di bawah sembilan kartu komisariat.
             *
             * Sengaja TANPA FadeIn: panelnya tinggi, sedangkan animasi
             * whileInView menunggu 30% elemen terlihat. Di viewport laptop
             * syarat itu baru terpenuhi setelah di-scroll, jadi panel
             * sempat tak terlihat padahal ada di layar pertama.
             */}
            <aside className="order-first lg:order-none lg:col-span-1">
              <div className="xl:h-full">
                <div className="flex flex-col rounded-card border border-genbi-line bg-white p-5 shadow-sm xl:h-full">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      className="h-4 w-4 text-genbi-blue"
                      aria-hidden="true"
                    />
                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                      Kegiatan Terakhir
                    </h2>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Program kerja terbaru yang telah dilaksanakan.
                  </p>

                  {activities.length === 0 ? (
                    <p className="mt-5 text-sm leading-relaxed text-slate-500">
                      Belum ada kegiatan yang bisa ditampilkan.
                    </p>
                  ) : (
                    <ol className="mt-5">
                      {activities.map((activity) => {
                        const description = tidyDescription(
                          activity.description,
                        );
                        const thumbnail = activity.gallery?.[0];
                        return (
                          <li
                            key={activity.id}
                            className="relative border-l border-genbi-line pb-5 pl-5 last:pb-0"
                          >
                            <span
                              className="absolute -left-[3.5px] top-1.5 h-2 w-2 rounded-full bg-genbi-blue"
                              aria-hidden="true"
                            ></span>
                            <Link
                              href={`/program/${activity.id}`}
                              className="group/item block"
                            >
                              <p className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover/item:text-genbi-blue">
                                {activity.title}
                              </p>
                              <div className="mt-1 flex items-center justify-between gap-2 text-sm">
                                <time
                                  dateTime={activity.dateIso ?? undefined}
                                  className="whitespace-nowrap text-slate-500"
                                >
                                  {activity.date}
                                </time>
                                <span
                                  className="min-w-0 truncate font-semibold text-genbi-blue"
                                  title={activity.commissariat}
                                >
                                  {activity.commissariat}
                                </span>
                              </div>
                              {/*
                               * Foto kecil menemani deskripsi singkat. Kolom
                               * panel paling sempit justru di rentang lg
                               * (1024-1279), jadi hanya di rentang itu foto
                               * disembunyikan; di mobile dan xl ke atas tetap
                               * tampil.
                               */}
                              {thumbnail ||
                              (description && description !== "-") ? (
                                <div className="mt-2 flex items-start gap-3">
                                  {thumbnail ? (
                                    <Image
                                      src={thumbnail}
                                      alt=""
                                      width={48}
                                      height={48}
                                      className="h-12 w-12 shrink-0 rounded-thumb object-cover lg:hidden xl:block"
                                    />
                                  ) : null}
                                  {description && description !== "-" ? (
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
                                      {description}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <Link href="/program" className="mt-auto block w-full pt-6">
                    <div className="group/all flex h-10 w-full items-center justify-center gap-2 rounded-full border border-genbi-line bg-genbi-light text-sm font-bold text-genbi-ink shadow-sm transition-all hover:border-genbi-blue hover:bg-genbi-blue hover:text-white">
                      Lihat Semua Program Kerja
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-1" />
                    </div>
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </Container>
      </main>

      <div className="relative border-t border-genbi-line bg-white">
        <Footer />
      </div>
    </div>
  );
}
