import api from "@/lib/api";
import { NewsItem } from "@/app/types";

export const getAllNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await api.get<{ data?: NewsItem[] }>("/v1/news");
    const resData = response.data;
    return Array.isArray(resData.data) ? resData.data : [];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

export const getNewsBySlug = async (slug: string): Promise<NewsItem | null> => {
  try {
    const response = await api.get<{ data?: NewsItem }>(`/v1/news/${slug}`);
    return response.data.data ?? null;
  } catch (error) {
    console.error(`Error fetching news with slug ${slug}:`, error);
    return null;
  }
};
