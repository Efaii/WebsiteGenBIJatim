import api from "@/lib/api";
import { NewsItem } from "@/app/types";

/**
 * @service NewsService (Frontend)
 * @description Unified news service: public fetching + admin CRUD.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/* --- TYPES --- */
export interface AdminNewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

/* --- PUBLIC (uses fetch for ISR revalidation) --- */
export const getAllNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await api.get<NewsItem[]>("/news");
    return response.data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};

export const getNewsBySlug = async (
  slug: string
): Promise<NewsItem | null> => {
  try {
    const response = await api.get<NewsItem>(`/news/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with slug ${slug}:`, error);
    return null;
  }
};

export const getLatestNews = async (): Promise<AdminNewsItem[]> => {
  try {
    const response = await fetch(`${API_URL}/news/latest`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch Latest News");
    return response.json();
  } catch (error) {
    console.error("Error fetching latest news:", error);
    return [];
  }
};

/* --- ADMIN (uses Axios with auto-token) --- */
export const getAdminNews = async (): Promise<AdminNewsItem[]> => {
  const response = await api.get<AdminNewsItem[]>("/news", {
    headers: { "Cache-Control": "no-store" },
  });
  return response.data;
};

export const createNews = async (
  formData: FormData
): Promise<AdminNewsItem> => {
  const response = await api.post<AdminNewsItem>("/news", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateNews = async (
  id: string,
  formData: FormData
): Promise<AdminNewsItem> => {
  const response = await api.put<AdminNewsItem>(`/news/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`);
};
