import Link from "next/link";
import { ArrowRight, History, Plus } from "lucide-react";
import { AdminForbiddenPanel } from "../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { BTN_PRIMARY, PANEL } from "../../ui";
import {
  PROGRAM_STATUS_BADGE,
  PROGRAM_STATUS_LABEL,
  programStatusClass,
} from "./status";

export const metadata = { title: "Riwayat Program Kerja" };

const formatDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";

const hasKind = (item: CmsProgramItem, kind: string): boolean =>
  item.artifacts.some((artifact) => artifact.kind === kind);

/**
 * Riwayat Program Kerja divisi sekretaris divisi beserta status pengajuannya.
 *
 * Daftar dibatasi scope akun oleh API; Program Kerja lama hasil rekonsiliasi
 * ikut tampil sebagai riwayat divisi tetapi tanpa aksi ubah (halaman kelola
 * menampilkan formulir terkunci untuk status non-draft).
 */
export default async function AdminProgramHistoryPage() {
  const session = await getCmsPageSession();
  if (session.role !== "SEKRETARIS_DIVISI")
    return <AdminForbiddenPanel session={session} />;

  const items = (await cmsApiGet<CmsProgramItem[]>("/v1/programs")) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Riwayat Program Kerja
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Program Kerja divisi Anda beserta status pengajuannya. Draft dapat
            disunting sampai diajukan.
          </p>
        </div>
        <Link href="/admin/proker/baru" className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" aria-hidden />
          Tambah Program Kerja
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <History className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Belum ada Program Kerja
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Mulai dengan membuat draft pertama untuk divisi Anda.
          </p>
          <Link href="/admin/proker/baru" className={`${BTN_PRIMARY} mt-5`}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah Program Kerja
          </Link>
        </div>
      ) : (
        <div className={`${PANEL} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Judul</th>
                  <th className="px-5 py-3 font-semibold">Divisi</th>
                  <th className="px-5 py-3 font-semibold">Tanggal</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Berkas</th>
                  <th className="px-5 py-3 font-semibold">Diperbarui</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-genbi-line">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200 hover:bg-genbi-soft/70"
                  >
                    <td className="max-w-[300px] px-5 py-4 font-medium text-slate-900">
                      {item.namaProker}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.divisi}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(item.startDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`${PROGRAM_STATUS_BADGE} ${programStatusClass(
                          item.publicationStatus,
                        )}`}
                      >
                        {PROGRAM_STATUS_LABEL[item.publicationStatus] ??
                          item.publicationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap gap-1.5">
                        {hasKind(item, "proposal") && (
                          <span className="inline-flex items-center rounded-full border border-genbi-haze bg-genbi-light px-2.5 py-0.5 text-xs font-semibold text-genbi-blue">
                            Proposal
                          </span>
                        )}
                        {hasKind(item, "lpj") && (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            LPJ
                          </span>
                        )}
                        {!hasKind(item, "proposal") &&
                          !hasKind(item, "lpj") && (
                            <span className="text-slate-300">-</span>
                          )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {new Date(item.updatedAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/proker/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-genbi-blue transition-colors duration-200 hover:bg-genbi-light"
                      >
                        Kelola
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
