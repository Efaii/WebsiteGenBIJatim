import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { ProgramActions } from "../ProgramActions";
import { ProgramArtifacts } from "../ProgramArtifacts";
import { ProgramForm } from "../ProgramForm";

export const metadata = { title: "Kelola Program Kerja" };

/**
 * Detail Program Kerja untuk ketiga peran.
 *
 * Sekretaris divisi melihat formulir yang dapat disunting (selama draft atau
 * hasil penolakan) beserta unggahan berkas; peran lain melihat tampilan baca
 * dengan unduhan Proposal/LPJ untuk Program Kerja yang sudah disetujui.
 */
export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCmsPageSession();
  const canManage = session.role === "SEKRETARIS_DIVISI";
  const canApprove = session.role === "ADMIN_GLOBAL";

  const { id } = await params;
  const items =
    (await cmsApiGet<CmsProgramItem[]>("/v1/programs?scope=all")) ?? [];
  const item = items.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={canManage ? "/admin/proker" : "/admin/proker/lintas"}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-genbi-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {canManage
            ? "Riwayat Program Kerja"
            : "Program Kerja Lintas Komisariat"}
        </Link>
        <h1 className="mt-3 break-words font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {item.namaProker}
        </h1>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <ProgramForm program={item} canManage={canManage} />
          <ProgramArtifacts program={item} canManage={canManage} />
        </div>
        <div className="space-y-6 xl:sticky xl:top-24">
          <ProgramActions
            program={item}
            canManage={canManage}
            canApprove={canApprove}
          />
        </div>
      </div>
    </div>
  );
}
