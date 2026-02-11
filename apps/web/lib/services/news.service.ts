import api from "@/lib/api";
import { NewsItem } from "@/app/types";

export const getAllNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await api.get<NewsItem[]>("/news");
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

export const getNewsBySlug = async (slug: string): Promise<NewsItem | null> => {
  try {
    const response = await api.get<NewsItem>(`/news/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with slug ${slug}:`, error);
    return null;
  }
};
