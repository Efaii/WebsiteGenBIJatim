import type { MetadataRoute } from "next";

const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const dynamic = "force-dynamic";

/**
 * Sitemap publik: route statis + route dinamis (komisariat, program, periode,
 * berita) yang diambil dari API. Bila API tidak tersedia, bagian dinamis
 * dikosongkan agar `/sitemap.xml` tetap dapat diakses (degradasi yang
 * disengaja, bukan silent fallback pada halaman).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { getAllCommissariats } = await import("@/lib/services/commissariat.service");
  const { getAllProgramIds } = await import("@/lib/services/program.service");
  const { getPublicPeriods, periodSlug } = await import("@/lib/services/period.service");
  const { getAllNews } = await import("@/lib/services/news.service");

  const staticRoutes = [
    "",
    "/profil",
    "/commissariat",
    "/program",
    "/awardee",
    "/news",
    "/contact",
  ];

  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const [commissariats, programs, periods, news] = await Promise.all([
    getAllCommissariats().catch(() => []),
    getAllProgramIds().catch(() => []),
    getPublicPeriods().catch(() => ({ periods: [] as string[], defaultPeriod: "" })),
    getAllNews().catch(() => []),
  ]);

  for (const commissariat of commissariats) {
    entries.push({
      url: `${SITE_URL}/commissariat/${commissariat.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  for (const program of programs) {
    entries.push({
      url: `${SITE_URL}/program/${program.id}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  for (const period of periods.periods) {
    entries.push({
      url: `${SITE_URL}/profil/${periodSlug(period)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const item of news) {
    entries.push({
      url: `${SITE_URL}/news/${item.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
