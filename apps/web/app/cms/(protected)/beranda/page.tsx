import { HomeEditor } from "./HomeEditor";
import { CmsForbiddenPanel } from "../CmsForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";
import { getHomeContent } from "@/lib/services/home-content.service";
import { getHomeData, STATIC_COMMISSARIATS } from "@/services/home.service";
import { getFeaturedNews, getRecentNews } from "@/lib/services/news.service";

export const metadata = { title: "Editor Beranda | CMS GenBI Jatim" };

/**
 * Editor Konten Beranda (panel + pratinjau dengan komponen asli).
 *
 * Data konteks (komisariat, berita, FAQ) diambil di server supaya pratinjau
 * dapat menampilkan seluruh bagian Beranda, bukan hanya bagian yang diedit.
 */
export default async function CmsBerandaPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  const [homeData, latestNews, featuredNews, content] = await Promise.all([
    getHomeData().catch(() => null),
    getRecentNews(3).catch(() => null),
    getFeaturedNews(3).catch(() => null),
    getHomeContent(),
  ]);

  if (!content) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Konten Beranda tidak dapat dimuat dari API. Pastikan server API berjalan
        dan seed konten beranda sudah dijalankan (
        <code className="font-mono">npm run seed:home</code>).
      </section>
    );
  }

  return (
    <HomeEditor
      initialContent={content}
      commissariats={homeData?.commissariats ?? STATIC_COMMISSARIATS}
      news={featuredNews?.length ? featuredNews : (latestNews ?? [])}
      faqs={homeData?.faqs ?? []}
    />
  );
}
