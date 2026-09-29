"use client";

import Image from "next/image";
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

  const applyMediaResponse = (updated: HomeContentResponse) => {
    // Unggahan hanya mengganti slot media hero; teks yang sedang diedit di
    // draft tidak boleh tertimpa. `videoEnabled` dari server dipaksa ke draft
    // hanya saat server menonaktifkannya (video dikosongkan).
    setDraft((prev) =>
      prev.hero
        ? {
            ...prev,
            hero: {
              ...prev.hero,
              poster: updated.hero?.poster ?? null,
              video: updated.hero?.video ?? null,
              videoEnabled:
                updated.hero?.videoEnabled === false
                  ? false
                  : prev.hero.videoEnabled,
            },
          }
        : prev,
    );
    setSaved((prev) =>
      prev.hero
        ? {
            ...prev,
            hero: {
              ...prev.hero,
              poster: updated.hero?.poster ?? null,
              video: updated.hero?.video ?? null,
              videoEnabled:
                updated.hero?.videoEnabled ?? prev.hero.videoEnabled,
            },
          }
        : prev,
    );
  };

  const onUploadMedia = async (
    slot: "hero.poster" | "hero.video",
    files: FileList | null,
  ) => {
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
          : 'Video tersimpan. Aktifkan "Tampilkan di hero" lalu Simpan untuk menayangkannya.',
      );
    } catch (error) {
      setMediaMessage(extractErrorMessage(error));
    } finally {
      setMediaBusy(null);
    }
  };

  const onClearMedia = async (slot: "hero.poster" | "hero.video") => {
    setMediaBusy(slot);
    setMediaMessage(null);
    try {
      const updated = await clearHomeMedia(slot);
      applyMediaResponse(updated);
      setMediaMessage(
        slot === "hero.poster"
          ? "Poster dikembalikan ke bawaan (aset statis)."
          : "Video dihapus dan dinonaktifkan.",
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
      const updated = await updateHomeContent({
        hero: {
          heading: hero.heading,
          description: hero.description,
          videoEnabled: hero.videoEnabled,
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
        ...(poster && posterAlt !== savedPosterAlt
          ? { media: { "hero.poster": { alt: posterAlt } } }
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
    <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
      {/* --- PANEL FORMULIR --- */}
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
        <h1 className="font-heading text-lg font-bold text-slate-900">
          Editor Beranda
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Panel ini mengubah teks hero dan milestone Sejarah Perjalanan.
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
            />
            <p
              className={`mt-1 text-xs ${heroWords > HERO_DESCRIPTION_MAX_WORDS ? "font-semibold text-red-600" : "text-slate-500"}`}
            >
              {heroWords}/{HERO_DESCRIPTION_MAX_WORDS} kata
              {heroWords > HERO_DESCRIPTION_MAX_WORDS
                ? " — maksimal 20 kata"
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-slate-700">Media hero</h2>
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
                  className="h-16 w-28 rounded-md border border-slate-200 object-cover"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
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
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
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
                  className={`cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${mediaBusy ? "pointer-events-none opacity-60" : ""}`}
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
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Kosongkan
                </button>
                <label className="ml-1 inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
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
            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
              {mediaMessage}
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold text-slate-700">
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
                  className="rounded-xl border border-slate-200 p-3"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={
              !heroValid || !storyValid || !dirty || status === "saving"
            }
            className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Batalkan perubahan
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {status === "saved" && !dirty
            ? "Tersimpan dan sudah tayang di beranda publik."
            : dirty
              ? "Ada perubahan yang belum disimpan — belum terlihat di situs publik."
              : "Tidak ada perubahan."}
        </p>
      </aside>

      {/* --- PRATINJAU (KOMPONEN ASLI) --- */}
      <section className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Pratinjau Beranda (komponen asli, state draft)
          </h2>
          <span className="text-xs text-slate-400">
            geser horizontal bila perlu
          </span>
        </div>
        {/*
          Komposisi mengikuti urutan Beranda apa adanya. Pembungkus pertama
          memberi contain untuk elemen `fixed` (navbar) lewat transform, supaya
          pratinjau tidak menutupi antarmuka CMS.
        */}
        <div className="max-h-[80vh] overflow-auto rounded-2xl border border-slate-300 bg-white">
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
