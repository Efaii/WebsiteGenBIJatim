import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { ProgramActions } from "../ProgramActions";
import { ProgramArtifacts } from "../ProgramArtifacts";
import { ProgramForm } from "../ProgramForm";

export const metadata = { title: "Kelola Program Kerja" };

export default async function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCmsPageSession();
  if (session.role !== "SEKRETARIS_DIVISI")
    return <AdminForbiddenPanel session={session} />;

  const { id } = await params;
  const items = (await cmsApiGet<CmsProgramItem[]>("/v1/programs")) ?? [];
  const item = items.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/proker"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-genbi-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Riwayat Program Kerja
        </Link>
        <h1 className="mt-3 break-words font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {item.namaProker}
        </h1>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <ProgramForm program={item} />
          <ProgramArtifacts program={item} />
        </div>
        <div className="space-y-6 xl:sticky xl:top-24">
          <ProgramActions program={item} />
        </div>
      </div>
    </div>
  );
}
