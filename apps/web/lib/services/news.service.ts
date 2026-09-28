import api from "@/lib/api";

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

const isNotFound = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 404;

/**
 * Service berita publik (`/api/v1/news`).
 *
 * Tidak ada fallback senyap: kegagalan dilempar ke pemanggil supaya halaman
 * bisa menampilkan state gagal yang jujur. Slug yang tidak ada bukan error,
 * jadi mengembalikan `null` tanpa menulis apa pun ke console.
 */
/**
 * Daftar berita terbit untuk halaman `/news`.
 * API membatasi `pageSize` maksimum 100; paginasi daftar berita menyusul di
 * pekerjaan terpisah (lihat spec §4 temuan baru bila diperlukan).
 */
export const getAllNews = async (): Promise<PublicNewsSummary[]> => {
  const response = await api.get<{ data?: PublicNewsSummary[] }>("/v1/news", {
    params: { pageSize: 100 },
  });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

/** Latest published news summaries for the Beranda and related-news sidebar. */
export const getRecentNews = async (pageSize = 4): Promise<PublicNewsSummary[]> => {
  const response = await api.get<{ data?: PublicNewsSummary[] }>("/v1/news", { params: { pageSize } });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getNewsBySlug = async (slug: string): Promise<PublicNewsDetail | null> => {
  try {
    const response = await api.get<{ data?: PublicNewsDetail }>(`/v1/news/${slug}`);
    return response.data.data ?? null;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};
