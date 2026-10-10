import type { Metadata } from "next";
import { connection } from "next/server";
import { getAllNews } from "@/lib/services/news.service";
import NewsClient, { type NewsListItem } from "./NewsClient";

export const metadata: Metadata = {
  title: "Berita & Kegiatan | GenBI Jatim",
  description:
    "Kabar terbaru seputar kegiatan, program, dan prestasi GenBI Jawa Timur.",
};

/**
 * Tanggal diformat di server dengan zona waktu tetap supaya label yang
 * dirender server dan klien tidak pernah berbeda (pola yang sama dengan
 * section berita di beranda).
 */
const formatDate = (value: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(parsed);
};

export default async function NewsPage() {
  await connection();
  const news = await getAllNews();
  const items: NewsListItem[] = news.map((item) => ({
    ...item,
    dateLabel: formatDate(item.publishedAt),
  }));
  return <NewsClient initialNews={items} />;
}
