"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileImage, Loader2 } from "lucide-react";
import { setNewsFeaturedOrder } from "@/lib/services/cms-news.service";
import { FIELD_BASE, PANEL } from "../../ui";
import {
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  newsStatusClass,
} from "./status";

export type SlotCardNews = {
  id: string;
  title: string;
  coverUrl: string | null;
  status: string;
};

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan slot beranda. Coba lagi.";
};

/**
 * Tiga kartu slot beranda (featuredOrder 1-3): menampilkan berita terpilih
 * beserta thumbnail dan statusnya, plus pemilih untuk mengganti isi slot.
 * Hanya berita terbit yang boleh menempati slot; API melepas slot yang sama
 * dari berita lain secara otomatis.
 */
export function FeatureSlotCards({
  slots,
  options,
}: {
  slots: Array<{ order: number; news: SlotCardNews | null }>;
  options: SlotCardNews[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assign = async (order: number, newsId: string, currentId?: string) => {
    setBusy(order);
    setError(null);
    try {
      if (!newsId && currentId) {
        await setNewsFeaturedOrder(currentId, null);
      } else if (newsId) {
        await setNewsFeaturedOrder(newsId, order);
      }
      router.refresh();
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
          Slot beranda
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Tiga berita yang tampil di bagian Berita pada beranda publik. Hanya
          berita terbit yang dapat dipilih.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {slots.map((slot) => (
          <div
            key={slot.order}
            className={`${PANEL} flex flex-col overflow-hidden`}
          >
            <div className="relative aspect-[16/9] bg-genbi-soft">
              {slot.news?.coverUrl ? (
                <Image
                  src={slot.news.coverUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <FileImage className="h-8 w-8" aria-hidden />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-genbi-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Slot {slot.order}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              {slot.news ? (
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">
                    {slot.news.title}
                  </p>
                  <span
                    className={`${NEWS_STATUS_BADGE} shrink-0 ${newsStatusClass(
                      slot.news.status,
                    )}`}
                  >
                    {NEWS_STATUS_LABEL[slot.news.status] ?? slot.news.status}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Belum ada berita di slot ini.
                </p>
              )}

              <div className="mt-auto pt-3">
                <label
                  className="block text-xs font-medium text-slate-500"
                  htmlFor={`slot-pilih-${slot.order}`}
                >
                  Ganti berita
                </label>
                <select
                  id={`slot-pilih-${slot.order}`}
                  value={slot.news?.id ?? ""}
                  disabled={busy !== null}
                  onChange={(event) =>
                    void assign(slot.order, event.target.value, slot.news?.id)
                  }
                  className={`${FIELD_BASE} mt-1 w-full`}
                >
                  <option value="">Tidak ada</option>
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                </select>
                {busy === slot.order ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Menyimpan slot...
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
