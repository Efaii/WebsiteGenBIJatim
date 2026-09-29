"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/home/ImageLightbox";
import { NewsGalleryCard } from "@/components/home/NewsGalleryCard";
import type { GalleryImage, GalleryItem } from "@/types/news-gallery.types";

/**
 * Grid galeri berita.
 *
 * Jumlah item menentukan bentuk grid supaya tidak pernah ada kartu sendirian
 * di sebelah dua slot kosong: tiga item atau lebih memakai tiga kolom, dua item
 * memakai dua kolom yang lebih lebar, satu item menjadi satu kartu di tengah.
 *
 * Modal gambar hidup di sini, bukan di dalam kartu, supaya hanya ada satu
 * dialog di halaman.
 */
export function NewsGallery({
  items,
  className,
}: {
  items: GalleryItem[];
  className?: string;
}) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  const layout =
    items.length >= 3
      ? "grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      : items.length === 2
        ? "grid gap-10 md:grid-cols-2 lg:mx-auto lg:max-w-[960px] lg:gap-10"
        : "mx-auto max-w-[560px]";

  return (
    <>
      <div className={cn(layout, className)}>
        {items.map((item) => (
          <NewsGalleryCard key={item.id} item={item} onOpenImage={setActiveImage} />
        ))}
      </div>

      <ImageLightbox image={activeImage} onClose={() => setActiveImage(null)} />
    </>
  );
}
