import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsProgramItem } from "@/lib/services/cms-program.service";
import { ProgramLintasList } from "./ProgramLintasList";

export const metadata = { title: "Program Kerja Lintas Komisariat" };

/**
 * Daftar Program Kerja lintas komisariat untuk ketiga peran (keputusan Korkom:
 * sekretaris umum dan sekretaris divisi punya akses yang sama). Unduhan
 * Proposal/LPJ hanya tersedia pada Program Kerja yang sudah disetujui.
 */
export default async function AdminProgramLintasPage() {
  await getCmsPageSession();
  const programs =
    (await cmsApiGet<CmsProgramItem[]>("/v1/programs?scope=all")) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Program Kerja Lintas Komisariat
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Daftar Program Kerja seluruh komisariat. Proposal dan LPJ dapat
          diunduh pada Program Kerja yang sudah disetujui.
        </p>
      </div>
      <ProgramLintasList programs={programs} />
    </div>
  );
}
