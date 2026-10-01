"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { NewsApprovalButtons } from "../../berita/NewsApprovalButtons";
import {
  NEWS_STATUS_BADGE,
  NEWS_STATUS_LABEL,
  newsStatusClass,
} from "../../berita/status";
import { BTN_SMALL, PANEL } from "../../../ui";
import { newsBylineParts, newsBylineText } from "@/lib/news-byline";

/**
 * Kartu antrean persetujuan untuk satu Berita.
 *
 * Menampilkan atribusi, ringkasan, dan pratinjau isi yang dapat dibuka, lalu
 * aksi setujui/terbitkan atau tolak dengan catatan (NewsApprovalButtons).
 */
export function NewsApprovalCard({ news }: { news: CmsNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const status = news.publicationStatus;

  return (
    <li className={`${PANEL} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${NEWS_STATUS_BADGE} ${newsStatusClass(status)}`}>
              {NEWS_STATUS_LABEL[status] ?? status}
            </span>
            <h2 className="min-w-0 font-heading text-lg font-bold tracking-tight text-slate-900">
              {news.title}
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {newsBylineText(
              newsBylineParts({
                author: news.author,
                publisher: news.publisher,
              }),
            )}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {news.category ?? "Tanpa kategori"}, diperbarui{" "}
            {new Date(news.updatedAt).toLocaleString("id-ID")}
          </p>
        </div>
        <Link
          href={`/admin/berita/${news.id}`}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
        >
          Kelola
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-slate-600">
        {news.excerpt}
      </p>

      {expanded ? (
        <div className="mt-3 max-w-[68ch] whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {news.content}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className={`${BTN_SMALL} mt-3`}
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        )}
        {expanded ? "Tutup pratinjau" : "Pratinjau isi"}
      </button>

      <div className="mt-4 border-t border-genbi-line pt-4">
        <NewsApprovalButtons newsId={news.id} />
      </div>
    </li>
  );
}
