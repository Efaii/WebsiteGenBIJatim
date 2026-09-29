import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { NewsGallery } from "@/components/home/NewsGallery";
import { homeContent } from "@/content/home";
import { newsGalleryPreview, newsPreviewEnabled } from "@/content/news.preview";
import {
  newsAssetUrl,
  type PublicNewsSummary,
} from "@/lib/services/news.service";
import type { GalleryItem } from "@/types/news-gallery.types";

/**
 * Bulan dan tahun berita, diformat di server dengan zona waktu tetap supaya
 * hasil render server dan klien tidak pernah berbeda.
 */
const formatMonthYear = (iso: string | null): string | null => {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
};

/**
 * Berita membawa galeri (cover + gambar pendukung). Kartu Beranda memakai
 * bentuk lima gambar (1 utama + maks 4 thumbnail, ADR 0006); sisa gambar tetap
 * tampil di halaman detail berita.
 */
const toGalleryItem = (news: PublicNewsSummary): GalleryItem => {
  const gallery = (news.images ?? [])
    .map((path) => newsAssetUrl(path))
    .filter((src): src is string => Boolean(src));
  const cover = gallery[0] ?? newsAssetUrl(news.coverImage);
  const selected = cover ? [cover, ...gallery.slice(1, 5)] : [];
  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    date: formatMonthYear(news.publishedAt),
    location: null,
    category: news.category,
    excerpt: news.excerpt,
    images: selected.map((src) => ({ src, alt: news.title })),
  };
};

/**
 * Section Berita.
 *
 * Server Component: penyiapan data dan format tanggal terjadi di server, dan
 * hanya galeri interaktifnya yang menjadi client island.
 */
export function News({ initialNews }: { initialNews: PublicNewsSummary[] }) {
  /*
   * Data nyata menang. Fixture hanya dipakai sebagai pratinjau bentuk galeri
   * ketika belum ada berita asli di database (mis. environment baru di dev);
   * di produksi fixture tetap mati. Lihat ADR 0006 dan ADR 0010.
   */
  const items =
    initialNews.length > 0
      ? initialNews.map(toGalleryItem)
      : newsPreviewEnabled
        ? newsGalleryPreview
        : [];
  const { title, emptyState } = homeContent.newsPreview;

  return (
    <section
      data-section="berita"
      className="bg-genbi-soft py-24 md:py-28 lg:py-32"
    >
      <Container>
        {/*
          Judul di tengah untuk mobile (section lain pun begitu), kembali
          kiri-kanan mulai md. Tombol "Lainnya" di baris judul hanya tampil
          mulai md; di mobile tombolnya pindah ke bawah deretan berita meniru
          referensi desain.
        */}
        <div className="flex flex-wrap items-end justify-center gap-4 text-center md:justify-between md:text-left">
          <h2 className="font-heading text-[2rem] font-bold tracking-tight text-slate-900 md:text-[2.5rem] lg:text-[2.75rem]">
            {title}
          </h2>

          {/*
            Tombol "Lainnya" diskalakan supaya setara dengan judul (56px,
            mengikuti proporsi referensi): teks tebal 16px, padding lega.
            Tinggi yang sama juga dipakai versi mobile di bawah galeri supaya
            tombolnya tidak jadi dua ukuran berbeda.
          */}
          <Link
            href="/news"
            className="hidden items-center gap-2.5 rounded-full bg-genbi-blue px-7 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-genbi-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 md:inline-flex"
          >
            Lainnya
            <ArrowRight className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>

        {items.length > 0 ? (
          <NewsGallery items={items} className="mt-10 md:mt-12" />
        ) : (
          <p className="mt-10 rounded-card border border-dashed border-genbi-line bg-white px-6 py-16 text-center text-base font-medium text-slate-500 md:mt-12 md:py-20">
            {emptyState}
          </p>
        )}

        {/*
          Tombol versi mobile: muncul SETELAH ketiga berita, selebar kolom tapi
          dibatasi max-w-md supaya tidak jadi pil raksasa di layar lebar, dan
          hilang mulai md karena di sana tombolnya kembali ke baris judul.
          Latarnya biru solid dengan teks putih mengikuti referensi.
        */}
        <Link
          href="/news"
          className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2.5 rounded-full bg-genbi-blue px-7 py-4 text-base font-bold text-white transition-colors duration-200 hover:bg-genbi-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 md:hidden"
        >
          Lainnya
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      </Container>
    </section>
  );
}
