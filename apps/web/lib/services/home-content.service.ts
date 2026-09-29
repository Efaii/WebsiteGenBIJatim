import api from "@/lib/api";

export type HomeMediaRef = {
  slot: string;
  src: string;
  alt: string;
  mimeType: string | null;
};

export type HomeHeroContent = {
  heading: { line1: string; line2: string };
  description: string;
  videoEnabled: boolean;
  poster: HomeMediaRef | null;
  video: HomeMediaRef | null;
};

export type HomeAboutContent = {
  paragraphLead: string;
  paragraph: string;
  emphasis: string;
  images: (HomeMediaRef | null)[];
};

export type HomePilarItemContent = {
  position: number;
  title: string;
  description: string;
  points: string[];
  image: HomeMediaRef | null;
};

export type HomeStoryMilestoneContent = {
  position: number;
  title: string;
  description: string;
};

export type HomeContentResponse = {
  hero: HomeHeroContent | null;
  about: HomeAboutContent | null;
  pilar: { items: HomePilarItemContent[] };
  story: { milestones: HomeStoryMilestoneContent[] };
};

/**
 * Konten Beranda dari kontrak kanonik v1 (`GET /api/v1/home`).
 *
 * `null` berarti konten tidak dapat dimuat (API mati / belum di-seed); halaman
 * Beranda jatuh ke kamus konten statis supaya tidak pernah kosong — pola yang
 * sama dengan bagian dinamis lain di Beranda.
 */
export const getHomeContent = async (): Promise<HomeContentResponse | null> => {
  try {
    const response = await api.get<{ data?: HomeContentResponse }>("/v1/home");
    return response.data.data ?? null;
  } catch {
    return null;
  }
};

export type HomeHeroUpdate = {
  heading: { line1: string; line2: string };
  description: string;
  videoEnabled: boolean;
};

export type HomeContentUpdate = {
  hero?: HomeHeroUpdate;
  about?: {
    paragraphLead: string;
    paragraph: string;
    emphasis: string;
  };
  /** Perubahan teks media per slot (mis. alt); unggahan berkas lewat endpoint terpisah. */
  media?: Record<string, { src?: string; alt?: string }>;
  story?: {
    milestones: { position: number; title: string; description: string }[];
  };
};

/**
 * Simpan konten Beranda lewat jalur kanonik (`PATCH /api/v1/home`).
 *
 * Hanya admin global (sesi cookie). Error dibiarkan naik ke pemanggil supaya
 * pesan validasi API dapat ditampilkan di form editor.
 */
export const updateHomeContent = async (
  payload: HomeContentUpdate,
): Promise<HomeContentResponse> => {
  const response = await api.patch<{ data?: HomeContentResponse }>(
    "/v1/home",
    payload,
    {
      withCredentials: true,
    },
  );
  if (!response.data.data)
    throw new Error("Respons simpan tidak berisi konten.");
  return response.data.data;
};

/**
 * Unggah/pengganti berkas media pada satu slot (`POST /api/v1/home/media/:slot`).
 *
 * Gambar dikonversi ke WebP di server; video dibatasi 2 MB. Respons berisi
 * konten penuh sehingga editor dapat menyegarkan draft.
 */
export const uploadHomeMedia = async (
  slot: string,
  file: File,
): Promise<HomeContentResponse> => {
  const form = new FormData();
  form.append("file", file);
  const response = await api.post<{ data?: HomeContentResponse }>(
    `/v1/home/media/${slot}`,
    form,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  if (!response.data.data)
    throw new Error("Respons unggah tidak berisi konten.");
  return response.data.data;
};

/** Kosongkan slot media (kembali ke bawaan statis / menghapus video). */
export const clearHomeMedia = async (
  slot: string,
): Promise<HomeContentResponse> => {
  const response = await api.delete<{ data?: HomeContentResponse }>(
    `/v1/home/media/${slot}`,
    { withCredentials: true },
  );
  if (!response.data.data)
    throw new Error("Respons hapus tidak berisi konten.");
  return response.data.data;
};
