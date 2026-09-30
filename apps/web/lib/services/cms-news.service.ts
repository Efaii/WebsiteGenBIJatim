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
  author: string;
  publisher: string | null;
  rejectionReason: string | null;
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

/**
 * Jalankan satu langkah transisi status berita (DRAFT menuju PUBLISHED).
 * `rejectionReason` wajib saat menolak; API menyimpannya sebagai catatan yang
 * terlihat oleh pengaju.
 */
export const transitionNews = async (
  id: string,
  status: PublicationStatusValue,
  rejectionReason?: string,
): Promise<void> => {
  await api.post(
    `/v1/news/${id}/transition`,
    { status, ...(rejectionReason ? { rejectionReason } : {}) },
    { withCredentials: true },
  );
};

/** Tambah satu gambar pendukung galeri (WebP otomatis di server). */
export const addNewsGalleryAsset = async (
  newsId: string,
  file: File,
): Promise<CmsNewsAsset> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post<{ data?: CmsNewsAsset }>(
    `/v1/news/${newsId}/gallery`,
    form,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return pickData(
    response.data.data,
    "Respons unggah galeri tidak berisi data.",
  );
};

/** Tetapkan ulang urutan gambar galeri (index array = urutan tampil). */
export const orderNewsGalleryAssets = async (
  newsId: string,
  assetIds: string[],
): Promise<CmsNewsAsset[]> => {
  const response = await api.post<{ data?: CmsNewsAsset[] }>(
    `/v1/news/${newsId}/gallery/order`,
    { assetIds },
    { withCredentials: true },
  );
  return Array.isArray(response.data.data) ? response.data.data : [];
};

/**
 * Setel slot beranda berita (`featuredOrder` 1-3, `null` = tidak tampil).
 * Slot yang sama dilepas otomatis dari berita lain oleh API.
 */
export const setNewsFeaturedOrder = async (
  newsId: string,
  featuredOrder: number | null,
): Promise<void> => {
  await api.post(
    `/v1/news/${newsId}/featured`,
    { featuredOrder },
    { withCredentials: true },
  );
};

/** Hapus satu gambar pendukung (berkasnya ikut dihapus dari storage). */
export const deleteNewsGalleryAsset = async (
  newsId: string,
  assetId: string,
): Promise<void> => {
  await api.delete(`/v1/news/${newsId}/gallery/${assetId}`, {
    withCredentials: true,
  });
};
