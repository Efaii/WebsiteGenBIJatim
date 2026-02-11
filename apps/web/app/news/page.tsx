import { getAllNews } from "@/lib/services/news.service";
import NewsClient from "./NewsClient";

export default async function NewsPage() {
  const news = await getAllNews();
  return <NewsClient initialNews={news} />;
}
