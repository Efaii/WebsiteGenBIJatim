import { Download, FileText } from "lucide-react";
import type { Document } from "@repo/types";
import { isMeaningfulText } from "../display";

/**
 * Panel arsip dokumen. Tab ini hanya dirender kalau komisariat punya dokumen
 * (saat ini semua komisariat belum punya), jadi panel selalu terisi saat tampil.
 */
export function ArsipPanel({ documents }: { documents: Document[] }) {
  return (
    <section aria-labelledby="arsip-heading">
      <h2
        id="arsip-heading"
        className="mb-5 font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
      >
        Arsip Dokumen
      </h2>

      <ul className="divide-y divide-genbi-line/60 overflow-hidden rounded-card border border-genbi-line bg-white shadow-sm">
        {documents.map((document) => {
          const url = isMeaningfulText(document.url) ? document.url : null;
          return (
            <li
              key={document.id}
              className="flex flex-wrap items-center gap-4 px-5 py-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-thumb bg-genbi-light text-genbi-blue">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-slate-900">
                  {document.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {document.type} <span aria-hidden="true">·</span>{" "}
                  {document.date} <span aria-hidden="true">·</span>{" "}
                  {document.size}
                </p>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-genbi-line bg-white px-4 py-2 text-sm font-bold text-genbi-ink transition-colors hover:border-genbi-bright hover:text-genbi-blue active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Unduh
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
