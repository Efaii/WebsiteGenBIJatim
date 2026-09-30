"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  NEWS_CATEGORIES,
  createNews,
  updateNews,
  type CmsNewsItem,
  type NewsCategoryValue,
} from "@/lib/services/cms-news.service";
import { BTN_PRIMARY, FIELD, FILE_INPUT, LABEL, PANEL } from "../../ui";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan berita. Periksa koneksi ke API lalu coba lagi.";
};

/**
 * Formulir berita (buat draft baru / sunting draft) memakai jalur kanonik.
 * Cover opsional; server mengonversinya ke WebP otomatis.
 */
export function NewsForm({ news }: { news?: CmsNewsItem }) {
  const router = useRouter();
  const [title, setTitle] = useState(news?.title ?? "");
  const [author, setAuthor] = useState(news?.author ?? "");
  const [category, setCategory] = useState<NewsCategoryValue | "">(
    news?.category ?? "",
  );
  const [excerpt, setExcerpt] = useState(news?.excerpt ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const editing = Boolean(news);
  const activeCover =
    news?.coverAssets?.find((asset) => asset.status === "STAGED") ??
    news?.coverAssets?.find((asset) => asset.status === "PUBLIC") ??
    null;
  const editable =
    !news || ["DRAFT", "REJECTED"].includes(news.publicationStatus);
  const valid =
    title.trim().length > 0 &&
    excerpt.trim().length > 0 &&
    content.trim().length > 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("excerpt", excerpt.trim());
      form.append("content", content.trim());
      if (author.trim()) form.append("author", author.trim());
      if (category) form.append("category", category);
      if (cover) form.append("cover", cover);

      if (editing && news) {
        await updateNews(news.id, form);
        setCover(null);
        setMessage("Perubahan tersimpan.");
        router.refresh();
      } else {
        const created = await createNews(form);
        router.push(`/admin/berita/${created.id}`);
      }
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const coverTone =
    activeCover?.status === "PUBLIC"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <form onSubmit={onSubmit} className={`${PANEL} space-y-5 p-6`}>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Isi berita</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Lengkapi judul, nama penerbit, kategori, ringkasan, isi, dan cover.
          Draft bisa disimpan kapan saja.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="news-title">
          Judul
        </label>
        <input
          id="news-title"
          value={title}
          maxLength={160}
          disabled={!editable}
          onChange={(event) => setTitle(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="news-author">
          Nama penerbit
        </label>
        <input
          id="news-author"
          value={author}
          maxLength={120}
          disabled={!editable}
          onChange={(event) => setAuthor(event.target.value)}
          className={`${FIELD} mt-1`}
        />
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Nama orang yang menerbitkan berita ini; tampil di halaman berita
          publik bersama asal komisariat.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="news-category">
          Kategori
        </label>
        <select
          id="news-category"
          value={category}
          disabled={!editable}
          onChange={(event) =>
            setCategory(event.target.value as NewsCategoryValue | "")
          }
          className={`${FIELD} mt-1`}
        >
          <option value="">(pilih kategori)</option>
          {NEWS_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={LABEL} htmlFor="news-excerpt">
          Ringkasan (maks 280)
        </label>
        <textarea
          id="news-excerpt"
          value={excerpt}
          maxLength={280}
          rows={3}
          disabled={!editable}
          onChange={(event) => setExcerpt(event.target.value)}
          className={`${FIELD} mt-1`}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {excerpt.length}/280
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="news-content">
          Isi berita
        </label>
        <textarea
          id="news-content"
          value={content}
          maxLength={50000}
          rows={14}
          disabled={!editable}
          onChange={(event) => setContent(event.target.value)}
          className={`${FIELD} mt-1`}
        />
      </div>

      <div>
        <p className={LABEL}>Cover</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {activeCover ? (
            <>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${coverTone}`}
              >
                {activeCover.status}
              </span>
              <span className="break-all text-xs text-slate-500">
                {activeCover.storageKey}
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500">Belum ada cover.</span>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!editable}
          onChange={(event) => setCover(event.target.files?.[0] ?? null)}
          className={`${FILE_INPUT} mt-3`}
        />
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Otomatis dikonversi ke WebP (maks 1920px) saat diunggah. Wajib ada
          sebelum terbit.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-relaxed text-emerald-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !valid || !editable}
          className={BTN_PRIMARY}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? "Menyimpan..." : editing ? "Simpan perubahan" : "Buat draft"}
        </button>
        {!editable && (
          <p className="text-xs text-slate-500">
            Berita berstatus {news?.publicationStatus} tidak dapat disunting.
            Tarik ke draft dulu lewat kartu status.
          </p>
        )}
      </div>
    </form>
  );
}
