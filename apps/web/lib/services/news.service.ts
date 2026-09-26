import api from "@/lib/api";
import { NewsItem } from "@/app/types";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

/** Rewrites an API-relative upload path to an absolute URL for next/image. */
export const newsAssetUrl = (path: string | null | undefined): string | null =>
  !path ? null : path.startsWith("/uploads") ? `${API_ORIGIN}${path}` : path;

export type PublicNewsSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  byline: string;
};

export type PublicNewsDetail = PublicNewsSummary & { content: string };

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

/** Latest published news summaries for the related-news sidebar. */
export const getRecentNews = async (pageSize = 4): Promise<PublicNewsSummary[]> => {
  try {
    const response = await api.get<{ data?: PublicNewsSummary[] }>("/v1/news", { params: { pageSize } });
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Error fetching recent news:", error);
    return [];
  }
};

export const getNewsBySlug = async (slug: string): Promise<PublicNewsDetail | null> => {
  try {
    const response = await api.get<{ data?: PublicNewsDetail }>(`/v1/news/${slug}`);
    return response.data.data ?? null;
  } catch (error) {
    console.error(`Error fetching news with slug ${slug}:`, error);
    return null;
  }
};
