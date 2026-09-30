import { ListChecks } from "lucide-react";
import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { PANEL } from "../../../ui";
import { ProgramApprovalCard } from "../../proker/ProgramApprovalCard";

export const metadata = { title: "Persetujuan Program Kerja" };

/**
 * Antrean Persetujuan Program Kerja untuk admin global.
 *
 * Menampilkan pengajuan berstatus SUBMITTED dari semua komisariat, lengkap
 * dengan pratinjau isi dan aksi setujui/terbitkan atau tolak dengan catatan.
 * Angka antrean juga muncul sebagai badge di menu sidebar.
 */
export default async function AdminProgramApprovalPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const items =
    (await cmsApiGet<CmsProgramItem[]>(
      "/v1/programs?status=SUBMITTED&scope=all",
    )) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Persetujuan Program Kerja
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Antrean pengajuan Program Kerja dari seluruh komisariat. Setujui untuk
          menerbitkan, atau tolak dengan catatan untuk pengaju.
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <ListChecks className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Tidak ada Program Kerja menunggu persetujuan
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Pengajuan dari sekretaris divisi akan muncul di sini.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <ProgramApprovalCard key={item.id} program={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
