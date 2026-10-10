"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { ImageLightbox } from "@/components/home/ImageLightbox";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/news-gallery.types";

/**
 * Galeri dokumentasi program kerja.
 *
 * Memakai lightbox yang sama dengan galeri Berita beranda (`ImageLightbox`),
 * jadi hanya ada satu dialog di halaman dan perilakunya konsisten: tutup lewat
 * tombol, klik backdrop, atau Escape; scroll dikunci selama terbuka.
 *
 * Grid 2 kolom di mobile dan 3 kolom mulai `md`. Jumlah foto proker berasal
 * dari 6 kolom legacy + tabel `ProgramKerjaPhoto`, jadi panjangnya bebas;
 * grid seragam dipilih supaya tidak pernah ada slot kosong di baris terakhir.
 */
export function ProgramGallery({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4",
          className,
        )}
      >
        {images.map((image) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveImage(image)}
            aria-label={`Perbesar gambar: ${image.alt}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-thumb border border-genbi-line bg-genbi-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 focus-visible:ring-offset-2"
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {/* Lapisan gelap + ikon perbesar: penanda bahwa gambar bisa diklik. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-genbi-ink/45 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Maximize2 className="h-5 w-5 text-white" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>

      <ImageLightbox
        image={activeImage}
        onClose={() => setActiveImage(null)}
      />
    </>
  );
}
