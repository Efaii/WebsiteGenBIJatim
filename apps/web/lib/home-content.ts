import { homeContent } from "@/content/home";
import type { HeroContent } from "@/components/home/Hero";
import type { AboutContent } from "@/components/home/About";
import type { PilarContent } from "@/components/home/Pilar";
import type { StoryContent } from "@/components/home/Story";
import type { HomeContentResponse } from "@/lib/services/home-content.service";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

/**
 * Path media yang dikelola API (`/uploads/home/...`) dijadikan absolut supaya
 * `next/image` dan `<video>` mengambil dari server API. Path aset statis web
 * (`/assets/...`, `/uploads/proker/...`) dibiarkan apa adanya karena dilayani
 * oleh web sendiri.
 */
const mediaSrc = (src: string) =>
  src.startsWith("/uploads/home/") ? `${API_ORIGIN}${src}` : src;

export type HomeSections = {
  hero: HeroContent;
  about: AboutContent;
  pilar: PilarContent;
  story: StoryContent;
};

/**
 * Rakit props empat bagian Beranda dari konten database, dengan jatuh ke kamus
 * konten statis per bagian/bidang bila data tidak ada atau kosong.
 *
 * Yang tetap statis (judul section, eyebrow, metrik hero, chip peran, tahun
 * milestone) selalu diambil dari kamus konten; API tidak pernah menulisnya.
 */
export const buildHomeSections = (
  data: HomeContentResponse | null,
): HomeSections => {
  const fallbackHero: HeroContent = {
    ...homeContent.hero,
    stats: homeContent.stats,
  };
  const fallbackAbout: AboutContent = homeContent.about;
  const fallbackPilar: PilarContent = homeContent.pilar;
  const fallbackStory: StoryContent = homeContent.story;

  if (!data) {
    return {
      hero: fallbackHero,
      about: fallbackAbout,
      pilar: fallbackPilar,
      story: fallbackStory,
    };
  }

  const text = (value: string | null | undefined, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value : fallback;

  const hero: HeroContent = {
    heading: {
      line1: text(data.hero?.heading.line1, fallbackHero.heading.line1),
      line2: text(data.hero?.heading.line2, fallbackHero.heading.line2),
    },
    description: text(data.hero?.description, fallbackHero.description),
    highlights: fallbackHero.highlights,
    poster: {
      src: mediaSrc(data.hero?.poster?.src ?? fallbackHero.poster.src),
      alt: text(data.hero?.poster?.alt, fallbackHero.poster.alt),
    },
    video: {
      enabled: data.hero?.videoEnabled ?? fallbackHero.video.enabled,
      src: mediaSrc(data.hero?.video?.src ?? fallbackHero.video.src),
      type: data.hero?.video?.mimeType ?? fallbackHero.video.type,
      poster: mediaSrc(data.hero?.poster?.src ?? fallbackHero.video.poster),
    },
    stats: fallbackHero.stats,
  };

  const about: AboutContent = {
    eyebrow: fallbackAbout.eyebrow,
    heading: fallbackAbout.heading,
    paragraphLead: text(data.about?.paragraphLead, fallbackAbout.paragraphLead),
    paragraph: text(data.about?.paragraph, fallbackAbout.paragraph),
    emphasis: text(data.about?.emphasis, fallbackAbout.emphasis),
    images: fallbackAbout.images.map((fallbackImage, index) => {
      const image = data.about?.images?.[index];
      return {
        src: mediaSrc(image?.src ?? fallbackImage.src),
        alt: text(image?.alt, fallbackImage.alt),
      };
    }),
  };

  const pilar: PilarContent = {
    heading: fallbackPilar.heading,
    description: fallbackPilar.description,
    items: fallbackPilar.items.map((fallbackItem, index) => {
      const item =
        data.pilar.items.find(
          (candidate) => candidate.position === index + 1,
        ) ?? data.pilar.items[index];
      return {
        title: text(item?.title, fallbackItem.title),
        description: text(item?.description, fallbackItem.description),
        points: item?.points?.length === 3 ? item.points : fallbackItem.points,
        image: mediaSrc(item?.image?.src ?? fallbackItem.image),
        imageAlt: text(item?.image?.alt, fallbackItem.imageAlt),
      };
    }),
  };

  const story: StoryContent = {
    heading: fallbackStory.heading,
    description: fallbackStory.description,
    milestones: fallbackStory.milestones.map((fallbackMilestone, index) => {
      const milestone =
        data.story.milestones.find(
          (candidate) => candidate.position === index + 1,
        ) ?? data.story.milestones[index];
      return {
        year: fallbackMilestone.year,
        title: text(milestone?.title, fallbackMilestone.title),
        description: text(
          milestone?.description,
          fallbackMilestone.description,
        ),
      };
    }),
  };

  return { hero, about, pilar, story };
};
