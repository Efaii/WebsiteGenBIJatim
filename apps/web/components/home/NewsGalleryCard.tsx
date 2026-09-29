"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage, GalleryItem } from "@/types/news-gallery.types";

/**
 * Jumlah thumbnail menentukan jumlah kolom, bukan empat slot tetap: dengan
 * begitu dua sampai empat gambar selalu mengisi barisnya penuh tanpa lubang.
 * Tinggi baris dibuat tetap supaya thumbnail tidak pernah memaksa barisnya
 * jadi jauh lebih tinggi daripada gambar utama.
 */
const THUMB_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export function NewsGalleryCard({
  item,
  onOpenImage,
}: {
  item: GalleryItem;
  onOpenImage: (image: GalleryImage) => void;
}) {
  const [main, ...rest] = item.images;
  const thumbs = rest.slice(0, 4);
  const secondary = item.location ?? item.category;

  return (
    /*
     * Kartu berita punya kotaknya sendiri: border tipis, latar putih, dan radius
     * `rounded-feature` (32px) yang sama dengan kartu section Pilar.
     *
     * Padding TIDAK dipasang di elemen article, karena gambar utama harus
     * menempel penuh ke tepi kiri, kanan, dan atas kartu (meniru referensi).
     * Paddingnya pindah ke badan kartu di bawah gambar, jadi 4 gambar kecil,
     * judul, dan deskripsi tetap seperti sebelumnya. `overflow-hidden` di article
     * yang membuat sudut atas gambar mengikuti radius kartu, sementara dua sudut
     * bawah gambar dibiarkan siku.
     */
    <article className="flex h-full flex-col overflow-hidden rounded-feature border border-genbi-line bg-white">
      {main && (
        <Link
          href={`/news/${item.slug}`}
          className="group/img relative block aspect-[2/1] shrink-0 overflow-hidden bg-genbi-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-genbi-blue/60"
        >
          <Image
            src={main.src}
            alt={main.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover/img:scale-[1.02]"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/65 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100 group-focus-visible/img:opacity-100">
            <span className="flex translate-y-1 items-center gap-2 text-sm font-semibold text-white transition-transform duration-300 ease-out group-hover/img:translate-y-0">
              Lihat Detail
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </span>
        </Link>
      )}

      {/*
        Badan kartu: seluruh padding kartu ada di sini. Jarak gambar utama ke
        isi bawahnya datang dari padding atas blok ini, bukan margin tambahan.
      */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {thumbs.length > 0 && (
          <div className={cn("grid gap-3", THUMB_COLUMNS[thumbs.length] ?? "grid-cols-4")}>
            {thumbs.map((image) => (
              <button
                key={image.src + image.alt}
                type="button"
                onClick={() => onOpenImage(image)}
                aria-label={`Perbesar gambar: ${image.alt}`}
                className="group/thumb relative h-20 overflow-hidden rounded-thumb bg-genbi-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 md:h-[88px]"
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 25vw, 12vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover/thumb:scale-[1.04]"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100">
                  <Search className="h-5 w-5 text-white" strokeWidth={2} />
                </span>
              </button>
            ))}
          </div>
        )}

        <h3 className="mt-6 min-h-[2lh] text-lg font-bold leading-snug text-slate-900">
          <Link
            href={`/news/${item.slug}`}
            className="rounded-sm transition-colors duration-200 hover:text-genbi-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60"
          >
            {item.title}
          </Link>
        </h3>

        {(item.date || secondary) && (
          <p className="mt-2 text-[13px] font-medium text-slate-500">
            {item.date}
            {item.date && secondary ? <span aria-hidden="true"> · </span> : null}
            {secondary}
          </p>
        )}

        <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-slate-600">{item.excerpt}</p>
      </div>
    </article>
  );
}
