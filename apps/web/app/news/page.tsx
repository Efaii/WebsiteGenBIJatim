import type { Metadata } from "next";
import { getAllNews } from "@/lib/services/news.service";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "Berita & Kegiatan | GenBI Jatim",
  description:
    "Kabar terbaru seputar kegiatan, program, dan prestasi GenBI Jawa Timur.",
};

export default async function NewsPage() {
  const news = await getAllNews();
  return <NewsClient initialNews={news} />;
}
