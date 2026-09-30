"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Mitra } from "@/components/home/Mitra";
import { Pilar } from "@/components/home/Pilar";
import { Story } from "@/components/home/Story";
import { Portal } from "@/components/home/Portal";
import { News } from "@/components/home/News";
import { FAQ } from "@/components/home/FAQ";
import { buildHomeSections } from "@/lib/home-content";
import {
  clearHomeMedia,
  updateHomeContent,
  uploadHomeMedia,
  type HomeContentResponse,
} from "@/lib/services/home-content.service";
import type { PublicNewsSummary } from "@/lib/services/news.service";
import type { CommissariatItem, FAQItem } from "@/types/home.types";
import { BTN_PRIMARY, BTN_SECONDARY, FIELD, PANEL } from "../../ui";

const HERO_DESCRIPTION_MAX_WORDS = 20;

const EMPTY_HERO = {
  heading: { line1: "", line2: "" },
  description: "",
  videoEnabled: false,
  poster: null,
  video: null,
} satisfies NonNullable<HomeContentResponse["hero"]>;

const wordCount = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan. Periksa koneksi ke API lalu coba lagi.";
};

type Props = {
  initialContent: HomeContentResponse;
  commissariats: CommissariatItem[];
  news: PublicNewsSummary[];
  faqs: FAQItem[];
};

/**
 * Editor Konten Beranda.
 *
 * State draft hidup di klien; pratinjau memakai komponen Beranda asli
 * (`Hero`/`About`/`Pilar`/`Story` dan komposisi lengkap halaman) sehingga
 * perubahan yang belum disimpan tidak pernah menyentuh database maupun situs
 * publik. Simpan mengirim `PATCH /api/v1/home` (sesi kanonik, ADMIN_GLOBAL).
 */
export function HomeEditor({
  initialContent,
  commissariats,
  news,
  faqs,
}: Props) {
  const [draft, setDraft] = useState<HomeContentResponse>(initialContent);
  const [saved, setSaved] = useState<HomeContentResponse>(initialContent);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [mediaBusy, setMediaBusy] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);

  const hero = draft.hero ?? EMPTY_HERO;
  const poster = hero.poster;
  const heroWords = wordCount(hero.description);
  const heroValid =
    hero.heading.line1.trim().length > 0 &&
    hero.heading.line2.trim().length > 0 &&
    heroWords > 0 &&
    heroWords <= HERO_DESCRIPTION_MAX_WORDS;
  const storyValid =
    draft.story.milestones.length === 4 &&
    draft.story.milestones.every(
      (milestone) =>
        milestone.title.trim().length > 0 &&
        milestone.description.trim().length > 0,
    );
  const aboutValid =
    (draft.about?.paragraphLead.trim().length ?? 0) > 0 &&
    (draft.about?.paragraph.trim().length ?? 0) > 0 &&
    (draft.about?.emphasis.trim().length ?? 0) > 0;
  const pilarValid =
    draft.pilar.items.length === 3 &&
    draft.pilar.items.every(
      (item) =>
        item.title.trim().length > 0 &&
        item.description.trim().length > 0 &&
        item.points.length === 3 &&
        item.points.every((point) => point.trim().length > 0),
    );
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const sections = useMemo(() => buildHomeSections(draft), [draft]);

  const updateHero = (patch: Partial<typeof hero>) => {
    setDraft((prev) => ({
      ...prev,
      hero: { ...(prev.hero ?? EMPTY_HERO), ...patch },
    }));
    setStatus("idle");
    setMessage(null);
  };

  const updateMilestone = (
    position: number,
    patch: Partial<{ title: string; description: string }>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      story: {
        milestones: prev.story.milestones.map((milestone) =>
          milestone.position === position
            ? { ...milestone, ...patch }
            : milestone,
        ),
      },
    }));
    setStatus("idle");
    setMessage(null);
  };

  const updateAbout = (
    patch: Partial<{
      paragraphLead: string;
      paragraph: string;
      emphasis: string;
    }>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      about: {
        paragraphLead: "",
        paragraph: "",
        emphasis: "",
        images: [null, null, null, null],
        ...(prev.about ?? {}),
        ...patch,
      },
    }));
    setStatus("idle");
    setMessage(null);
  };

  const updateAboutImageAlt = (index: number, alt: string) => {
    setDraft((prev) =>
      prev.about
        ? {
            ...prev,
            about: {
              ...prev.about,
              images: prev.about.images.map((image, i) =>
                i === index && image ? { ...image, alt } : image,
              ),
            },
          }
        : prev,
    );
    setStatus("idle");
    setMessage(null);
  };

  const updatePilarCard = (
    position: number,
    patch: Partial<{ title: string; description: string; points: string[] }>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      pilar: {
        items: prev.pilar.items.map((item) =>
          item.position === position ? { ...item, ...patch } : item,
        ),
      },
    }));
    setStatus("idle");
    setMessage(null);
  };

  const updatePilarPoint = (
    position: number,
    pointIndex: number,
    value: string,
  ) => {
    const card = draft.pilar.items.find((item) => item.position === position);
    if (!card) return;
    updatePilarCard(position, {
      points: card.points.map((point, index) =>
        index === pointIndex ? value : point,
      ),
    });
  };

  const updatePilarImageAlt = (position: number, alt: string) => {
    setDraft((prev) => ({
      ...prev,
      pilar: {
        items: prev.pilar.items.map((item) =>
          item.position === position && item.image
            ? { ...item, image: { ...item.image, alt } }
            : item,
        ),
      },
    }));
    setStatus("idle");
    setMessage(null);
  };

  const applyMediaResponse = (updated: HomeContentResponse) => {
    // Unggahan hanya mengganti slot media; teks yang sedang diedit di draft
    // tidak boleh tertimpa. `videoEnabled` dari server dipaksa ke draft hanya
    // saat server menonaktifkannya (video dikosongkan).
    setDraft((prev) => ({
      ...prev,
      hero: prev.hero
        ? {
            ...prev.hero,
            poster: updated.hero?.poster ?? null,
            video: updated.hero?.video ?? null,
            videoEnabled:
              updated.hero?.videoEnabled === false
                ? false
                : prev.hero.videoEnabled,
          }
        : prev.hero,
      about: prev.about
        ? { ...prev.about, images: updated.about?.images ?? prev.about.images }
        : prev.about,
      pilar: prev.pilar
        ? {
            items: prev.pilar.items.map((item) => {
              const match = updated.pilar.items.find(
                (candidate) => candidate.position === item.position,
              );
              return match ? { ...item, image: match.image } : item;
            }),
          }
        : prev.pilar,
    }));
    setSaved((prev) => ({
      ...prev,
      hero: prev.hero
        ? {
            ...prev.hero,
            poster: updated.hero?.poster ?? null,
            video: updated.hero?.video ?? null,
            videoEnabled: updated.hero?.videoEnabled ?? prev.hero.videoEnabled,
          }
        : prev.hero,
      about: prev.about
        ? { ...prev.about, images: updated.about?.images ?? prev.about.images }
        : prev.about,
      pilar: prev.pilar
        ? {
            items: prev.pilar.items.map((item) => {
              const match = updated.pilar.items.find(
                (candidate) => candidate.position === item.position,
              );
              return match ? { ...item, image: match.image } : item;
            }),
          }
        : prev.pilar,
    }));
  };

  const onUploadMedia = async (slot: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setMediaBusy(slot);
    setMediaMessage(null);
    try {
      const updated = await uploadHomeMedia(slot, file);
      applyMediaResponse(updated);
      setMediaMessage(
        slot === "hero.poster"
          ? "Poster tersimpan dan sudah tayang di Beranda."
          : slot === "hero.video"
            ? 'Video tersimpan. Aktifkan "Tampilkan di hero" lalu Simpan untuk menayangkannya.'
            : "Gambar tersimpan dan sudah tayang di Beranda.",
      );
    } catch (error) {
      setMediaMessage(extractErrorMessage(error));
    } finally {
      setMediaBusy(null);
    }
  };

  const onClearMedia = async (slot: string) => {
    setMediaBusy(slot);
    setMediaMessage(null);
    try {
      const updated = await clearHomeMedia(slot);
      applyMediaResponse(updated);
      setMediaMessage(
        slot === "hero.poster"
          ? "Poster dikembalikan ke bawaan (aset statis)."
          : slot === "hero.video"
            ? "Video dihapus dan dinonaktifkan."
            : "Gambar dikembalikan ke bawaan (aset statis).",
      );
    } catch (error) {
      setMediaMessage(extractErrorMessage(error));
    } finally {
      setMediaBusy(null);
    }
  };

  const onSave = async () => {
    setStatus("saving");
    setMessage(null);
    try {
      const posterAlt = poster?.alt ?? "";
      const savedPosterAlt = saved.hero?.poster?.alt ?? "";
      const mediaAltUpdates: Record<string, { alt: string }> = {};
      if (poster && posterAlt !== savedPosterAlt) {
        mediaAltUpdates["hero.poster"] = { alt: posterAlt };
      }
      (draft.about?.images ?? []).forEach((image, index) => {
        if (!image) return;
        const savedAlt = saved.about?.images[index]?.alt ?? "";
        if (image.alt !== savedAlt) {
          mediaAltUpdates[`about.image.${index + 1}`] = { alt: image.alt };
        }
      });
      draft.pilar.items.forEach((item) => {
        const image = item.image;
        if (!image) return;
        const savedAlt =
          saved.pilar.items.find(
            (candidate) => candidate.position === item.position,
          )?.image?.alt ?? "";
        if (image.alt !== savedAlt) {
          mediaAltUpdates[`pilar.image.${item.position}`] = { alt: image.alt };
        }
      });
      const updated = await updateHomeContent({
        hero: {
          heading: hero.heading,
          description: hero.description,
          videoEnabled: hero.videoEnabled,
        },
        about: {
          paragraphLead: draft.about?.paragraphLead ?? "",
          paragraph: draft.about?.paragraph ?? "",
          emphasis: draft.about?.emphasis ?? "",
        },
        pilar: {
          items: draft.pilar.items.map(
            ({ position, title, description, points }) => ({
              position,
              title,
              description,
              points,
            }),
          ),
        },
        story: {
          milestones: draft.story.milestones.map(
            ({ position, title, description }) => ({
              position,
              title,
              description,
            }),
          ),
        },
        ...(Object.keys(mediaAltUpdates).length > 0
          ? { media: mediaAltUpdates }
          : {}),
      });
      setDraft(updated);
      setSaved(updated);
      setStatus("saved");
    } catch (error) {
      setStatus("error");
      setMessage(extractErrorMessage(error));
    }
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* --- PANEL FORMULIR --- */}
      <aside className={`${PANEL} p-6 xl:sticky xl:top-24`}>
        <h1 className="font-heading text-lg font-bold text-slate-900">
          Editor Beranda
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Panel ini mengubah teks konten Beranda (hero, Tentang GenBI, Pilar
          GenBI, dan milestone Sejarah Perjalanan) beserta slot medianya.
          Struktur, judul section, metrik hero, chip peran, dan tahun milestone
          tetap statis dan tidak memiliki kolom di sini.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="hero-line1"
            >
              Judul baris 1
            </label>
            <input
              id="hero-line1"
              value={hero.heading.line1}
              onChange={(event) =>
                updateHero({
                  heading: { ...hero.heading, line1: event.target.value },
                })
              }
              className={`${FIELD} mt-1`}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="hero-line2"
            >
              Judul baris 2
            </label>
            <input
              id="hero-line2"
              value={hero.heading.line2}
              onChange={(event) =>
                updateHero({
                  heading: { ...hero.heading, line2: event.target.value },
                })
              }
              className={`${FIELD} mt-1`}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor="hero-description"
            >
              Subteks hero
            </label>
            <textarea
              id="hero-description"
              value={hero.description}
              onChange={(event) =>
                updateHero({ description: event.target.value })
              }
              rows={4}
              className={`${FIELD} mt-1`}
            />
            <p
              className={`mt-1 text-xs ${heroWords > HERO_DESCRIPTION_MAX_WORDS ? "font-semibold text-red-600" : "text-slate-500"}`}
            >
              {heroWords}/{HERO_DESCRIPTION_MAX_WORDS} kata
              {heroWords > HERO_DESCRIPTION_MAX_WORDS
                ? " (maksimal 20 kata)"
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-genbi-line pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Media hero</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Unggahan menggantikan slot langsung di database (tanpa draft per
            media). Poster langsung tayang; video baru tampil setelah diaktifkan
            lalu Simpan.
          </p>

          <div className="mt-4 space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-700">Poster</p>
              <div className="mt-2 flex items-start gap-3">
                <Image
                  src={sections.hero.poster.src}
                  alt={sections.hero.poster.alt}
                  width={112}
                  height={64}
                  className="h-16 w-28 rounded-thumb border border-genbi-line object-cover"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`${BTN_SECONDARY} cursor-pointer ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {mediaBusy === "hero.poster"
                      ? "Mengunggah..."
                      : "Ganti poster"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={mediaBusy !== null}
                      onChange={(event) => {
                        void onUploadMedia("hero.poster", event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void onClearMedia("hero.poster")}
                    disabled={mediaBusy !== null}
                    className={BTN_SECONDARY}
                  >
                    Kosongkan
                  </button>
                </div>
              </div>
              {poster && (
                <div className="mt-2">
                  <label
                    className="block text-xs font-medium text-slate-600"
                    htmlFor="hero-poster-alt"
                  >
                    Alt poster
                  </label>
                  <input
                    id="hero-poster-alt"
                    value={poster.alt}
                    onChange={(event) => {
                      if (poster)
                        updateHero({
                          poster: { ...poster, alt: event.target.value },
                        });
                    }}
                    className={`${FIELD} mt-1`}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">
                Video (opsional, maks 2 MB)
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {hero.video
                  ? `${hero.video.src} (${hero.video.mimeType ?? "video"})`
                  : "Belum ada video."}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  className={`${BTN_SECONDARY} cursor-pointer ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
                >
                  {mediaBusy === "hero.video"
                    ? "Mengunggah..."
                    : "Unggah video"}
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    disabled={mediaBusy !== null}
                    onChange={(event) => {
                      void onUploadMedia("hero.video", event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void onClearMedia("hero.video")}
                  disabled={mediaBusy !== null || !hero.video}
                  className={BTN_SECONDARY}
                >
                  Kosongkan
                </button>
                <label className="ml-1 inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="accent-genbi-blue"
                    checked={hero.videoEnabled}
                    onChange={(event) =>
                      updateHero({ videoEnabled: event.target.checked })
                    }
                  />
                  Tampilkan di hero (Simpan untuk menerapkan)
                </label>
              </div>
            </div>
          </div>

          {mediaMessage && (
            <p className="mt-3 rounded-2xl border border-genbi-haze bg-genbi-light px-3.5 py-2.5 text-xs leading-relaxed text-genbi-ink">
              {mediaMessage}
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-genbi-line pt-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Tentang GenBI
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Tiga blok paragraf dan empat gambar kolase (posisi tetap). Eyebrow
            dan judul bagian tetap statis.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="about-paragraphLead"
              >
                Paragraf pembuka (lead)
              </label>
              <textarea
                id="about-paragraphLead"
                value={draft.about?.paragraphLead ?? ""}
                maxLength={200}
                rows={2}
                onChange={(event) =>
                  updateAbout({ paragraphLead: event.target.value })
                }
                className={`${FIELD} mt-1`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {draft.about?.paragraphLead?.length ?? 0}/200
              </p>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="about-paragraph"
              >
                Paragraf utama
              </label>
              <textarea
                id="about-paragraph"
                value={draft.about?.paragraph ?? ""}
                maxLength={2000}
                rows={4}
                onChange={(event) =>
                  updateAbout({ paragraph: event.target.value })
                }
                className={`${FIELD} mt-1`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {draft.about?.paragraph?.length ?? 0}/2000
              </p>
            </div>
            <div>
              <label
                className="block text-sm font-medium text-slate-700"
                htmlFor="about-emphasis"
              >
                Paragraf penekanan
              </label>
              <textarea
                id="about-emphasis"
                value={draft.about?.emphasis ?? ""}
                maxLength={2000}
                rows={3}
                onChange={(event) =>
                  updateAbout({ emphasis: event.target.value })
                }
                className={`${FIELD} mt-1`}
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {draft.about?.emphasis?.length ?? 0}/2000
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {[0, 1, 2, 3].map((index) => {
              const image = draft.about?.images[index] ?? null;
              const slot = `about.image.${index + 1}`;
              return (
                <div
                  key={slot}
                  className="rounded-2xl border border-genbi-line bg-genbi-soft/50 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Gambar {index + 1} (posisi tetap)
                  </p>
                  <div className="mt-2 flex items-start gap-3">
                    {image ? (
                      <Image
                        src={sections.about.images[index]?.src ?? image.src}
                        alt={image.alt}
                        width={96}
                        height={64}
                        className="h-16 w-24 rounded-thumb border border-genbi-line object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-thumb border border-dashed border-slate-300 text-xs text-slate-400">
                        bawaan
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`${BTN_SECONDARY} cursor-pointer ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
                      >
                        {mediaBusy === slot ? "Mengunggah..." : "Ganti gambar"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={mediaBusy !== null}
                          onChange={(event) => {
                            void onUploadMedia(slot, event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void onClearMedia(slot)}
                        disabled={mediaBusy !== null}
                        className={BTN_SECONDARY}
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                  {image && (
                    <>
                      <label
                        className="mt-2 block text-xs font-medium text-slate-600"
                        htmlFor={`about-image-alt-${index + 1}`}
                      >
                        Alt gambar
                      </label>
                      <input
                        id={`about-image-alt-${index + 1}`}
                        value={image.alt}
                        onChange={(event) =>
                          updateAboutImageAlt(index, event.target.value)
                        }
                        className={`${FIELD} mt-1`}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-genbi-line pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Pilar GenBI</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Judul, deskripsi, tiga poin, dan gambar tiap kartu. Jumlah kartu,
            judul bagian, dan deskripsi pengantar tetap statis.
          </p>
          <div className="mt-4 space-y-4">
            {draft.pilar.items.map((item) => {
              const slot = `pilar.image.${item.position}`;
              const image = item.image;
              return (
                <div
                  key={item.position}
                  className="rounded-2xl border border-genbi-line bg-genbi-soft/50 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Kartu {item.position}
                  </p>
                  <label
                    className="mt-2 block text-sm font-medium text-slate-700"
                    htmlFor={`pilar-title-${item.position}`}
                  >
                    Judul kartu
                  </label>
                  <input
                    id={`pilar-title-${item.position}`}
                    value={item.title}
                    maxLength={120}
                    onChange={(event) =>
                      updatePilarCard(item.position, {
                        title: event.target.value,
                      })
                    }
                    className={`${FIELD} mt-1`}
                  />
                  <label
                    className="mt-2 block text-sm font-medium text-slate-700"
                    htmlFor={`pilar-description-${item.position}`}
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id={`pilar-description-${item.position}`}
                    value={item.description}
                    maxLength={600}
                    rows={3}
                    onChange={(event) =>
                      updatePilarCard(item.position, {
                        description: event.target.value,
                      })
                    }
                    className={`${FIELD} mt-1`}
                  />
                  <p className="mt-2 text-xs font-medium text-slate-600">
                    Poin (tiga)
                  </p>
                  {[0, 1, 2].map((pointIndex) => (
                    <label
                      key={pointIndex}
                      className="mt-1 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <span className="w-4 shrink-0 text-right text-xs text-slate-400">
                        {pointIndex + 1}.
                      </span>
                      <input
                        id={`pilar-point-${item.position}-${pointIndex + 1}`}
                        value={item.points[pointIndex] ?? ""}
                        maxLength={200}
                        onChange={(event) =>
                          updatePilarPoint(
                            item.position,
                            pointIndex,
                            event.target.value,
                          )
                        }
                        className={FIELD}
                      />
                    </label>
                  ))}
                  <div className="mt-3 flex items-start gap-3">
                    {image ? (
                      <Image
                        src={
                          sections.pilar.items[item.position - 1]?.image ??
                          image.src
                        }
                        alt={image.alt}
                        width={96}
                        height={64}
                        className="h-16 w-24 rounded-thumb border border-genbi-line object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-thumb border border-dashed border-slate-300 text-xs text-slate-400">
                        bawaan
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label
                        className={`${BTN_SECONDARY} cursor-pointer ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
                      >
                        {mediaBusy === slot ? "Mengunggah..." : "Ganti gambar"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={mediaBusy !== null}
                          onChange={(event) => {
                            void onUploadMedia(slot, event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void onClearMedia(slot)}
                        disabled={mediaBusy !== null}
                        className={BTN_SECONDARY}
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>
                  {image && (
                    <>
                      <label
                        className="mt-2 block text-xs font-medium text-slate-600"
                        htmlFor={`pilar-image-alt-${item.position}`}
                      >
                        Alt gambar
                      </label>
                      <input
                        id={`pilar-image-alt-${item.position}`}
                        value={image.alt}
                        onChange={(event) =>
                          updatePilarImageAlt(item.position, event.target.value)
                        }
                        className={`${FIELD} mt-1`}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-genbi-line pt-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Sejarah Perjalanan
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Hanya judul dan deskripsi milestone yang dapat diubah; tahun dan
            judul section tetap statis.
          </p>
          <div className="mt-4 space-y-4">
            {draft.story.milestones.map((milestone, index) => {
              const year = sections.story.milestones[index]?.year ?? "";
              return (
                <div
                  key={milestone.position}
                  className="rounded-2xl border border-genbi-line bg-genbi-soft/50 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tahun {year} (statis)
                  </p>
                  <label
                    className="mt-2 block text-sm font-medium text-slate-700"
                    htmlFor={`story-title-${milestone.position}`}
                  >
                    Judul
                  </label>
                  <input
                    id={`story-title-${milestone.position}`}
                    value={milestone.title}
                    onChange={(event) =>
                      updateMilestone(milestone.position, {
                        title: event.target.value,
                      })
                    }
                    className={`${FIELD} mt-1`}
                  />
                  <label
                    className="mt-2 block text-sm font-medium text-slate-700"
                    htmlFor={`story-description-${milestone.position}`}
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id={`story-description-${milestone.position}`}
                    value={milestone.description}
                    onChange={(event) =>
                      updateMilestone(milestone.position, {
                        description: event.target.value,
                      })
                    }
                    rows={3}
                    className={`${FIELD} mt-1`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
            {message}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={
              !heroValid ||
              !aboutValid ||
              !pilarValid ||
              !storyValid ||
              !dirty ||
              status === "saving"
            }
            className={BTN_PRIMARY}
          >
            {status === "saving" && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {status === "saving" ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setStatus("idle");
              setMessage(null);
            }}
            disabled={!dirty || status === "saving"}
            className={BTN_SECONDARY}
          >
            Batalkan perubahan
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {status === "saved" && !dirty
            ? "Tersimpan dan sudah tayang di beranda publik."
            : dirty
              ? "Ada perubahan yang belum disimpan, belum terlihat di situs publik."
              : "Tidak ada perubahan."}
        </p>
      </aside>

      {/* --- PRATINJAU (KOMPONEN ASLI) --- */}
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Pratinjau Beranda
          </h2>
          <span className="text-xs text-slate-400">
            tampilan draft, geser horizontal bila perlu
          </span>
        </div>
        {/*
          Komposisi mengikuti urutan Beranda apa adanya. Pembungkus pertama
          memberi contain untuk elemen `fixed` (navbar) lewat transform, supaya
          pratinjau tidak menutupi antarmuka CMS.
        */}
        <div className="max-h-[80vh] overflow-auto rounded-2xl border border-genbi-line bg-white">
          <div className="min-w-[1280px]">
            <div className="relative" style={{ transform: "translateZ(0)" }}>
              <div className="min-h-screen bg-white font-sans selection:bg-genbi-haze selection:text-slate-900">
                <Navbar />
                <main className="flex-1">
                  <Hero content={sections.hero} />
                  <About content={sections.about} />
                  <Mitra commissariats={commissariats} />
                  <Pilar content={sections.pilar} />
                  <Story content={sections.story} />
                  <Portal />
                  <News initialNews={news} />
                  <FAQ faqs={faqs} />
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
