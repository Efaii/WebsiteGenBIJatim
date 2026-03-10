import { Metadata } from "next";
import NewsDetailClient from "./NewsDetailClient";

/**
 * @page NewsDetailPage
 * @description Server component for SEO metadata. Delegates rendering to NewsDetailClient.
 */

export const metadata: Metadata = {
  title: "Berita | GenBI Jawa Timur",
  description: "Detail berita dan kegiatan GenBI Jawa Timur.",
};

export default function NewsDetailPage() {
  return <NewsDetailClient />;
}
