"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { ProgramApprovalButtons } from "./ProgramApprovalButtons";
import {
  PROGRAM_STATUS_BADGE,
  PROGRAM_STATUS_LABEL,
  programStatusClass,
} from "./status";
import { BTN_SMALL, PANEL } from "../../ui";

const KIND_LABEL: Record<string, string> = {
  proposal: "Proposal",
  lpj: "LPJ",
};

const formatDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

/**
 * Kartu antrean persetujuan untuk satu Program Kerja.
 *
 * Menampilkan asal komisariat dan divisi, ringkasan, serta pratinjau isi
 * (tujuan dan berkas) yang dapat dibuka, lalu aksi setujui/terbitkan atau
 * tolak dengan catatan (ProgramApprovalButtons).
 */
export function ProgramApprovalCard({ program }: { program: CmsProgramItem }) {
  const [expanded, setExpanded] = useState(false);
  const status = program.publicationStatus;
  const objectives = program.objectives ?? [];

  return (
    <li className={`${PANEL} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${PROGRAM_STATUS_BADGE} ${programStatusClass(status)}`}
            >
              {PROGRAM_STATUS_LABEL[status] ?? status}
            </span>
            <h2 className="min-w-0 font-heading text-lg font-bold tracking-tight text-slate-900">
              {program.namaProker}
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {program.commissariat?.name ?? "-"} - {program.divisi}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {program.formatPelaksanaan}, mulai {formatDate(program.startDate)},
            diperbarui {new Date(program.updatedAt).toLocaleString("id-ID")}
          </p>
        </div>
        <Link
          href={`/admin/proker/${program.id}`}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
        >
          Kelola
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-slate-600">
        {program.deskripsiProker}
      </p>

      {expanded ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-900">Tujuan</p>
            {objectives.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">Belum ada tujuan.</p>
            ) : (
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Berkas</p>
            {program.artifacts.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">Belum ada berkas.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-slate-700">
                {program.artifacts.map((artifact) => (
                  <li key={artifact.id}>
                    {KIND_LABEL[artifact.kind] ?? artifact.kind}:{" "}
                    {artifact.originalFilename}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Unduhan berkas terbuka setelah disetujui.
            </p>
          </div>
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
        <ProgramApprovalButtons programId={program.id} />
      </div>
    </li>
  );
}
