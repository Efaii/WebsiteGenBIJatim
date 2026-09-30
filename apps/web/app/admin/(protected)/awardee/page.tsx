import { AdminForbiddenPanel } from "../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type {
  CmsAwardee,
  CmsAwardeeOptions,
} from "@/lib/services/cms-membership.service";
import { AwardeeManager } from "./AwardeeManager";

export const metadata = { title: "Data Awardee" };

/**
 * Pengelolaan Awardee manual untuk sekretaris umum.
 *
 * Daftar dibatasi scope komisariat dan periode akun; perubahan tersimpan
 * sebagai Draft dan diajukan untuk disetujui admin global sebelum tampil di
 * halaman Awardee publik.
 */
export default async function AdminAwardeePage() {
  const session = await getCmsPageSession();
  if (session.role !== "SEKRETARIS_UMUM")
    return <AdminForbiddenPanel session={session} />;

  const [items, options] = await Promise.all([
    cmsApiGet<CmsAwardee[]>("/v1/memberships/cms"),
    cmsApiGet<CmsAwardeeOptions>("/v1/memberships/cms/options"),
  ]);

  const periodLabel = options?.period?.label ?? "periode aktif";
  const commissariatName = options?.commissariat?.name ?? "komisariat Anda";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Data Awardee
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Kelola Awardee {commissariatName} periode {periodLabel}. Perubahan
          disetujui admin global sebelum tampil di halaman publik.
        </p>
      </div>
      <AwardeeManager
        items={items ?? []}
        options={options ?? { period: null, commissariat: null, divisions: [] }}
      />
    </div>
  );
}
