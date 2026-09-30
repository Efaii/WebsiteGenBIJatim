import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsAwardeeOptions } from "@/lib/services/cms-membership.service";
import { AwardeeImportManager } from "./AwardeeImportManager";

export const metadata = { title: "Impor Awardee" };

/**
 * Impor batch Awardee dari berkas Excel.
 *
 * Dipakai sekretaris umum untuk komisariatnya dan admin global untuk seluruh
 * scope. Alur: unggah berkas, tinjau pratinjau (termasuk duplikat dan
 * pemetaan divisi), simpan batch, lalu ajukan untuk disetujui admin global
 * di halaman Persetujuan Awardee.
 */
export default async function AdminAwardeeImportPage() {
  const session = await getCmsPageSession();
  if (session.role !== "SEKRETARIS_UMUM" && session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const options = await cmsApiGet<CmsAwardeeOptions>(
    "/v1/memberships/cms/options",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Impor Awardee
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Unggah berkas Excel berisi kolom Komisariat, Nama, Jabatan, Divisi,
          dan Prodi. Baris yang lolos pratinjau tersimpan sebagai Draft, lalu
          diajukan untuk disetujui admin global sebelum tampil di halaman
          Awardee publik.
        </p>
      </div>
      <AwardeeImportManager
        role={session.role}
        options={
          options ?? {
            period: null,
            commissariat: null,
            divisions: [],
            periods: [],
          }
        }
      />
    </div>
  );
}
