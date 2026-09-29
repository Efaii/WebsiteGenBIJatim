"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  NEWS_CATEGORIES,
  createNews,
  updateNews,
  type CmsNewsItem,
  type NewsCategoryValue,
} from "@/lib/services/cms-news.service";

const extractMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const message = (
      error as { response?: { data?: { error?: { message?: string } } } }
    ).response?.data?.error?.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Gagal menyimpan berita. Periksa koneksi ke API lalu coba lagi.";
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-genbi-blue";

/**
 * Formulir berita (buat draft baru / sunting draft) memakai jalur kanonik.
 * Cover opsional; server mengonversinya ke WebP otomatis.
 */
export function NewsForm({ news }: { news?: CmsNewsItem }) {
  const router = useRouter();
  const [title, setTitle] = useState(news?.title ?? "");
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
      if (category) form.append("category", category);
      if (cover) form.append("cover", cover);

      if (editing && news) {
        await updateNews(news.id, form);
        setCover(null);
        setMessage("Perubahan tersimpan.");
        router.refresh();
      } else {
        const created = await createNews(form);
        router.push(`/cms/berita/${created.id}`);
      }
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="news-title"
        >
          Judul
        </label>
        <input
          id="news-title"
          value={title}
          maxLength={160}
          disabled={!editable}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="news-category"
        >
          Kategori
        </label>
        <select
          id="news-category"
          value={category}
          disabled={!editable}
          onChange={(event) =>
            setCategory(event.target.value as NewsCategoryValue | "")
          }
          className={inputClass}
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
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="news-excerpt"
        >
          Ringkasan (maks 280)
        </label>
        <textarea
          id="news-excerpt"
          value={excerpt}
          maxLength={280}
          rows={3}
          disabled={!editable}
          onChange={(event) => setExcerpt(event.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {excerpt.length}/280
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="news-content"
        >
          Isi berita
        </label>
        <textarea
          id="news-content"
          value={content}
          maxLength={50000}
          rows={14}
          disabled={!editable}
          onChange={(event) => setContent(event.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">Cover</p>
        <p className="mt-1 break-all text-xs text-slate-500">
          {activeCover
            ? `${activeCover.storageKey} (${activeCover.status})`
            : "Belum ada cover."}
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={!editable}
          onChange={(event) => setCover(event.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm text-slate-600"
        />
        <p className="mt-1 text-xs text-slate-400">
          Otomatis dikonversi ke WebP (maks 1920px) saat diunggah. Wajib ada
          sebelum terbit.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !valid || !editable}
        className="rounded-lg bg-genbi-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Menyimpan..." : editing ? "Simpan perubahan" : "Buat draft"}
      </button>
      {!editable && (
        <p className="text-xs text-slate-500">
          Berita berstatus {news?.publicationStatus} tidak dapat disunting;
          tarik ke draft dulu lewat tombol di atas formulir.
        </p>
      )}
    </form>
  );
}
