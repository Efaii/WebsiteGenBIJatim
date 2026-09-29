import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { NewsGallery } from "@/components/home/NewsGallery";
import { homeContent } from "@/content/home";
import { newsGalleryPreview, newsPreviewEnabled } from "@/content/news.preview";
import { newsAssetUrl, type PublicNewsSummary } from "@/lib/services/news.service";
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
 * Berita nyata hari ini hanya membawa satu gambar, jadi ia menjadi galeri
 * satu gambar (gambar utama saja). Bentuk lima gambar menyusul dari API.
 */
const toGalleryItem = (news: PublicNewsSummary): GalleryItem => {
  const cover = newsAssetUrl(news.coverImage);
  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    date: formatMonthYear(news.publishedAt),
    location: null,
    category: news.category,
    excerpt: news.excerpt,
    images: cover ? [{ src: cover, alt: news.title }] : [],
  };
};

/**
 * Section Berita.
 *
 * Server Component: penyiapan data dan format tanggal terjadi di server, dan
 * hanya galeri interaktifnya yang menjadi client island.
 */
export function News({ initialNews }: { initialNews: PublicNewsSummary[] }) {
  const items = newsPreviewEnabled ? newsGalleryPreview : initialNews.map(toGalleryItem);
  const { title, emptyState } = homeContent.newsPreview;

  return (
    <section data-section="berita" className="bg-genbi-soft py-24 md:py-28 lg:py-32">
      <Container>
        {/*
          Judul di tengah untuk mobile (section lain pun begitu), kembali
          kiri-kanan mulai md. Tombol "Lainnya" di baris judul hanya tampil
          mulai md; di mobile tombolnya pindah ke bawah deretan berita meniru
          referensi desain.
        */}
        <div className="flex flex-wrap items-end justify-center gap-4 text-center md:justify-between md:text-left">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-[2.75rem]">
            {title}
          </h2>

          <Link
            href="/news"
            className="hidden items-center gap-2 rounded-full bg-genbi-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1a56e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 md:inline-flex"
          >
            Lainnya
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
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
          className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-genbi-blue px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#1a56e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 md:hidden"
        >
          Lainnya
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </Container>
    </section>
  );
}
