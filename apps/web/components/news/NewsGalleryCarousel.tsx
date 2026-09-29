"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Galeri dokumentasi berita: satu gambar tampil penuh (tanpa potongan gambar
 * berikutnya, tanpa scrollbar), dengan tombol panah kiri/kanan di sisi gambar.
 *
 * Semua gambar dirender bertumpuk dan saling berganti lewat opacity supaya
 * perpindahan tidak menggeser layout; hanya tombol dan penghitung yang tampil
 * sebagai kendali.
 */
export function NewsGalleryCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;

  const total = images.length;
  const go = (direction: number) => setIndex((current) => (current + direction + total) % total);

  return (
    <div className="relative mt-8 bg-genbi-light lg:w-[92%]">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {images.map((src, position) => (
          <Image
            key={src}
            src={src}
            alt={`Dokumentasi ${position + 1}: ${title}`}
            fill
            priority={position === 0}
            sizes="(max-width: 1024px) 100vw, 875px"
            className={cn(
              "object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none",
              position === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Gambar sebelumnya"
            className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:left-4 md:h-11 md:w-11"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Gambar berikutnya"
            className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 md:right-4 md:h-11 md:w-11"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
          <p
            aria-live="polite"
            className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold tabular-nums text-white md:right-4 md:bottom-4"
          >
            {index + 1} / {total}
          </p>
        </>
      )}
    </div>
  );
}
