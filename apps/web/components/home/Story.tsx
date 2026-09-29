"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { FadeIn } from "@/components/MotionWrapper";
import { Container } from "@/components/Container";
import { homeContent } from "@/content/home";
import { cn } from "@/lib/utils";

type Milestone = {
  year: string;
  title: string;
  description: string;
};

/**
 * Satu milestone timeline.
 *
 * Node-nya menyala saat milestone masuk viewport. HANYA elemen dekoratif
 * (cincin dan titik node) yang dianimasikan; teksnya selalu terlihat penuh,
 * supaya konten tidak pernah bergantung pada animasi yang berhasil dijalankan.
 */
function MilestoneItem({
  milestone,
  index,
  isLast,
}: {
  milestone: Milestone;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const active = reduce ? true : inView;
  const isLeft = index % 2 === 0;

  return (
    <li ref={ref} className="relative pb-12 last:pb-0 md:pb-16">
      {/*
        Node. `top-2` dipakai sampai md karena ukuran tahunnya masih 24px;
        mulai md tahunnya 28px sehingga pusat optis angka tahun bergeser ~2px
        ke bawah, dan node ikut digeser supaya tetap tepat di tengah angka.
      */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-3 top-2 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border transition-colors duration-500 md:top-[10px] lg:left-1/2",
          active || isLast ? "border-white" : "border-white/30",
        )}
      >
        {/*
          Putih, senada dengan garis dan kepala komet: seluruh timeline satu
          bahasa monokrom. Karena warnanya kini seragam, keadaan "menyala"
          dibedakan lewat kecerahan dan ukuran, bukan lagi lewat warna, jadi
          jarak antara belum dan sudah menyala sengaja dibuat lebar:
          redup 40% / 4px  ->  penuh + pendar / 6px.
        */}
        <span
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            isLast
              ? "h-2 w-2 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
              : active
                ? "h-1.5 w-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.55)]"
                : "h-1 w-1 bg-white/40",
          )}
        />
      </span>

      {/*
        Di bawah lg timeline memakai SATU sisi: garis di kiri, seluruh konten di
        kanan. Sebelumnya layout bergantian sudah aktif dari md, yang membuat
        kolom teks hanya ~306px di tablet sehingga deskripsi terpecah jadi
        banyak baris pendek. Mulai lg kolomnya cukup lebar untuk bergantian.
      */}
      <div className="pl-10 lg:grid lg:grid-cols-2 lg:gap-12 lg:pl-0">
        <div
          className={cn(
            isLeft ? "lg:col-start-1 lg:pr-6 lg:text-right" : "lg:col-start-2 lg:pl-6",
          )}
        >
          <p className="font-heading text-2xl font-bold tabular-nums text-[#35C7F3] md:text-[28px]">
            {milestone.year}
          </p>
          <h3 className="mt-2 text-lg font-bold leading-snug text-white md:text-xl">
            {milestone.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-[15px] leading-relaxed text-[#DCEAFF]/85 md:text-base lg:max-w-sm",
              isLeft && "lg:ml-auto",
            )}
          >
            {milestone.description}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * StorySection (Sejarah Perjalanan)
 *
 * Timeline VERTIKAL, tetap seperti desain sebelumnya: garis tipis di tengah
 * pada desktop dan di kiri pada mobile/tablet, dengan konten bergantian
 * kiri-kanan mulai lg. Tidak ada kartu, konten langsung di atas latar.
 *
 * Latar gelap dipertahankan sebagai satu-satunya blok gelap di halaman
 * (perangkat "Color Block Story" yang dipakai sekali), berupa gradien dengan
 * pendar tipis.
 *
 * Garis timeline terisi mengikuti scroll, dan node menyala saat milestone-nya
 * masuk viewport. Gerak itu punya alasan: section ini bercerita tentang
 * perjalanan waktu, jadi progres garis = progres waktu. Semuanya berhenti
 * otomatis saat pengguna meminta gerakan minimum.
 *
 * Sengaja tidak dipaksa muat dalam satu layar: jarak antar milestone dibuat
 * lega supaya mudah diikuti.
 */
export function Story() {
  const { heading, description, milestones } = homeContent.story;
  const listRef = useRef<HTMLOListElement>(null);
  const [listHeight, setListHeight] = useState(0);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: listRef,
    /*
     * Garis terisi tepat selama daftar ini melintas: mulai saat puncaknya
     * mencapai 80% tinggi viewport, selesai saat ujung bawahnya melewati titik
     * yang sama. Jadi lintasan penuh justru ketika seluruh milestone sudah
     * terlihat, bukan setelah pengguna melewatinya jauh.
     */
    offset: ["start 80%", "end 80%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  /*
   * Kepala komet perlu tahu tinggi daftar dalam piksel supaya bisa digerakkan
   * dengan `translateY` (transform, bukan properti layout). Diukur ulang saat
   * ukuran berubah, jadi tetap akurat ketika teks membungkus berbeda.
   */
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => setListHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rentangnya sudah memasukkan setengah tinggi kepala (5px) agar titiknya
  // berada tepat di ujung garis, bukan di bawahnya.
  const headY = useTransform(progress, [0, 1], [-5, Math.max(0, listHeight - 5)]);

  return (
    <section
      data-section="story"
      className="relative overflow-hidden bg-[#163A73] py-24 text-white md:py-28 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#163A73] via-[#123E86] to-[#1557B8]"
      />
      {/* Pendar ambient dikurangi supaya tidak terasa seperti neon. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-24 h-[440px] w-[440px] rounded-full bg-[#35C7F3]/[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-[380px] w-[380px] rounded-full bg-[#2E8BFF]/[0.06] blur-3xl"
      />

      <Container className="relative z-10">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            <p className="mt-4 text-base text-[#DCEAFF]/85 md:text-[17px]">{description}</p>
          </div>
        </FadeIn>

        {/* Lebar dibatasi supaya blok teks tidak terpisah terlalu jauh dari garis. */}
        <ol ref={listRef} className="relative mx-auto mt-14 w-full max-w-5xl md:mt-16">
          {/*
            Lintasan dasar: selalu terlihat, termasuk sebelum JavaScript jalan.
            Tetap 1px dan redup supaya tidak bersaing dengan lintasan progres.

            Warnanya ikut jadi putih redup supaya seluruh garis satu bahasa
            monokrom: bagian belum terisi = putih tipis, bagian terisi = putih
            terang. Node dan tahun mengikuti bahasa yang sama.
          */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-3 top-0 -ml-px w-px bg-white/20 lg:left-1/2"
          />
          {/*
            Lintasan progres: terisi dari atas mengikuti scroll.

            Putih dipilih karena memberi kontras tertinggi di atas gradien latar
            yang makin terang ke bawah (6,8 : 1 di titik terburuk, versus 5,18 : 1
            saat masih cyan terang). Ketebalan 2px di mobile, 3px di desktop.

            `-ml-px` memusatkan garis pada sumbu, bukan `-translate-x-1/2`,
            karena framer-motion menulis properti transform untuk scaleY.
          */}
          <motion.span
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : progress }}
            className="absolute bottom-0 left-3 top-0 -ml-px w-0.5 origin-top bg-gradient-to-b from-white via-white/90 to-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)] md:w-[3px] lg:left-1/2"
          />
          {/*
            Kepala komet: titik terang yang bergerak tepat di ujung pengisian.
            Inilah yang membuat geraknya benar-benar terlihat, karena mata jauh
            lebih mudah mengikuti objek yang bergerak daripada mengikuti batas
            yang berubah. Digerakkan dengan transform (translateY), bukan
            properti layout, dan posisinya dihitung dari tinggi daftar.
          */}
          <motion.span
            aria-hidden="true"
            style={{ y: reduce ? Math.max(0, listHeight - 5) : headY }}
            className="pointer-events-none absolute left-3 top-0 z-20 -ml-[5px] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)] lg:left-1/2"
          />

          {milestones.map((milestone, index) => (
            <MilestoneItem
              key={milestone.year}
              milestone={milestone}
              index={index}
              isLast={index === milestones.length - 1}
            />
          ))}
        </ol>
      </Container>
    </section>
  );
}
