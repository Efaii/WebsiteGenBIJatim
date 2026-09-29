import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Mitra } from "@/components/home/Mitra";
import { Pilar } from "@/components/home/Pilar";
import { Story } from "@/components/home/Story";
import { Portal } from "@/components/home/Portal";
import { News } from "@/components/home/News";
import { newsPreviewEnabled } from "@/content/news.preview";
import { buildHomeSections } from "@/lib/home-content";
import { getHomeContent } from "@/lib/services/home-content.service";
import { FAQ } from "@/components/home/FAQ";
import { Container } from "@/components/Container";
import { StateMessage } from "@/components/StateMessage";
import { getHomeData, STATIC_COMMISSARIATS } from "@/services/home.service";
import { getFeaturedNews, getRecentNews } from "@/lib/services/news.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GenBI Jatim | Energi Baru untuk Indonesia",
  description:
    "Komunitas penerima Beasiswa Bank Indonesia di Jawa Timur: profil organisasi, sembilan komisariat, program kerja, database awardee, dan berita terbaru.",
};

/**
 * Beranda.
 *
 * Setiap bagian dinamis punya fallback sendiri: kalau API untuk bagian itu
 * gagal, bagian lain tetap tampil dan bagian yang gagal menjelaskan keadaannya
 * (tidak ada area kosong misterius).
 */
function SectionFallback({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="bg-white py-24 md:py-28">
      <Container>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h2>
        <StateMessage
          tone="error"
          title={message}
          description="Bagian lain di halaman ini tetap dapat dibaca."
          className="mt-8"
        />
      </Container>
    </section>
  );
}

export default async function Home() {
  /* --- ASYNCHRONOUS DATA ORCHESTRATION --- */
  // Setiap sumber data gagal secara terpisah; null berarti "gagal dimuat".
  const [homeData, latestNews, featuredNews, homeContentData] =
    await Promise.all([
      getHomeData().catch(() => null),
      getRecentNews(3).catch(() => null),
      getFeaturedNews(3).catch(() => null),
      getHomeContent(),
    ]);
  /*
   * Beranda menampilkan pilihan admin global (`featuredOrder`). Bila admin
   * belum memilih, jatuh ke berita terbaru supaya beranda tidak kosong.
   */
  const homeNews = featuredNews?.length ? featuredNews : latestNews;

  /*
   * Konten empat bagian dirakit dari database (kontrak v1) dan jatuh ke kamus
   * konten statis bila API tidak tersedia supaya Beranda tidak pernah kosong.
   */
  const sections = buildHomeSections(homeContentData);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-genbi-haze selection:text-slate-900">
      {/* --- GLOBAL NAVIGATION INTERFACE --- */}
      <Navbar />

      {/* --- PRIMARY NARRATIVE SECTIONS --- */}
      <main className="flex-1">
        {/* Entrance & Identity */}
        <Hero content={sections.hero} />

        {/* Organizational Context */}
        <About content={sections.about} />

        {/* Institutional Partners */}
        <Mitra
          commissariats={homeData?.commissariats ?? STATIC_COMMISSARIATS}
        />

        {/* Three Strategic Roles */}
        <Pilar content={sections.pilar} />

        {/* Organizational History */}
        <Story content={sections.story} />

        {/* Strategic Program Access */}
        <Portal />

        {/* Dynamic Content & Updates */}
        {/* Saat data contoh aktif (dev), galeri tetap tampil walau API berita
            sedang tidak bisa dihubungi, supaya struktur finalnya bisa ditinjau. */}
        {homeNews || newsPreviewEnabled ? (
          <News initialNews={homeNews ?? []} />
        ) : (
          <SectionFallback
            title="Berita Kegiatan"
            message="Berita belum dapat dimuat."
          />
        )}

        {/* Knowledge Base & Support */}
        {homeData ? (
          <FAQ faqs={homeData.faqs} />
        ) : (
          <SectionFallback
            title="Pertanyaan yang Sering Diajukan"
            message="FAQ belum dapat dimuat."
          />
        )}
      </main>

      {/* --- GLOBAL FOOTER ARCHITECTURE --- */}
      <Footer />
    </div>
  );
}
