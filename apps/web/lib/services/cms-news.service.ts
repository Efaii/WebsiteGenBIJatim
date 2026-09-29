import api from "@/lib/api";

export const NEWS_CATEGORIES = [
  "KEGIATAN",
  "WEBINAR",
  "SOSIAL",
  "EDUKASI",
  "PELATIHAN",
] as const;
export type NewsCategoryValue = (typeof NEWS_CATEGORIES)[number];

export type PublicationStatusValue =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type CmsNewsAsset = {
  id: string;
  storageKey: string;
  status: string;
  visibility: string;
  role: string;
  sortOrder: number;
  mimeType: string | null;
  byteSize: number;
};

export type CmsNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategoryValue | null;
  publicationStatus: PublicationStatusValue;
  publishedAt: string | null;
  updatedAt: string;
  featuredOrder: number | null;
  coverAssets: CmsNewsAsset[];
};

const pickData = <T>(data: T | undefined, message: string): T => {
  if (data === undefined) throw new Error(message);
  return data;
};

/** Buat draft berita baru (multipart; cover opsional, dikonversi WebP server). */
export const createNews = async (form: FormData): Promise<CmsNewsItem> => {
  const response = await api.post<{ data?: CmsNewsItem }>("/v1/news", form, {
    withCredentials: true,
    /*
     * Wajib: tanpa override ini, header default instance (application/json)
     * membuat axios menyerialkan FormData menjadi JSON (termasuk file),
     * sehingga cover tampak sebagai field tak dikenal dan ditolak API.
     */
    headers: { "Content-Type": "multipart/form-data" },
  });
  return pickData(response.data.data, "Respons buat berita tidak berisi data.");
};

/** Simpan perubahan draft (multipart; sertakan cover untuk menggantinya). */
export const updateNews = async (
  id: string,
  form: FormData,
): Promise<CmsNewsItem> => {
  const response = await api.patch<{ data?: CmsNewsItem }>(
    `/v1/news/${id}`,
    form,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return pickData(
    response.data.data,
    "Respons simpan berita tidak berisi data.",
  );
};

/** Jalankan satu langkah transisi status berita (DRAFT→…→PUBLISHED). */
export const transitionNews = async (
  id: string,
  status: PublicationStatusValue,
): Promise<void> => {
  await api.post(
    `/v1/news/${id}/transition`,
    { status },
    { withCredentials: true },
  );
};
