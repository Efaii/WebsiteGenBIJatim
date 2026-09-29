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
