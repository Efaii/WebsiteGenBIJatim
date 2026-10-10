const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_URL =
  (typeof window === "undefined" ? process.env.API_URL : undefined) ||
  PUBLIC_API_URL;
const PUBLIC_REVALIDATE_SECONDS = 60;

const API_ORIGIN = PUBLIC_API_URL.replace(/\/api\/?$/, "");

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
  /** Galeri berita, urut: cover dulu lalu gambar pendukung. Bisa kosong. */
  images: string[];
  publishedAt: string | null;
  author: string;
  publisher: string | null;
  /** Slot beranda 1-3 dari pilihan admin; null berarti tidak tampil di beranda. */
  featuredOrder: number | null;
};

export type PublicNewsDetail = PublicNewsSummary & { content: string };

const isNotFound = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 404;

const publicGet = async <T>(
  path: string,
  params?: Record<string, string | number>,
  options: { fresh?: boolean } = {},
): Promise<T> => {
  const url = new URL(API_URL.replace(/\/$/, "") + "/v1/news" + path);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, String(value));
  }
  const response = await fetch(
    url,
    options.fresh ? { cache: "no-store" } : { next: { revalidate: PUBLIC_REVALIDATE_SECONDS } },
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw Object.assign(new Error("Public news was not found."), { response: { status: 404 } });
    }
    throw new Error(`Public news API error: ${response.status}`);
  }
  const body = await response.json();
  return body.data as T;
};

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
  return publicGet<PublicNewsSummary[]>("", { pageSize: 100 });
};

/** Latest published news summaries for the detail sidebar. */
export const getRecentNews = async (
  pageSize = 4,
  options: { fresh?: boolean } = {},
): Promise<PublicNewsSummary[]> => {
  return publicGet<PublicNewsSummary[]>("", { pageSize }, options);
};

/**
 * Pilihan beranda yang dikurasi admin global (`featuredOrder` 1-3, urut).
 * Kosong berarti admin belum memilih; pemanggil memakai fallback berita
 * terbaru supaya beranda tidak kosong.
 */
export const getFeaturedNews = async (
  pageSize = 3,
  options: { fresh?: boolean } = {},
): Promise<PublicNewsSummary[]> => {
  return publicGet<PublicNewsSummary[]>("", { featured: 1, pageSize }, options);
};

export const getNewsBySlug = async (slug: string): Promise<PublicNewsDetail | null> => {
  try {
    return await publicGet<PublicNewsDetail>(`/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
};
