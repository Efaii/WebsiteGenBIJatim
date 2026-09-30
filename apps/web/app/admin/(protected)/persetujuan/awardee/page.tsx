import { Award } from "lucide-react";
import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type {
  CmsAwardee,
  CmsImportBatch,
} from "@/lib/services/cms-membership.service";
import { PANEL } from "../../../ui";
import { ImportBatchCard } from "./ImportBatchCard";
import { MembershipCard } from "./MembershipCard";

export const metadata = { title: "Persetujuan Awardee" };

/**
 * Antrean Persetujuan Awardee untuk admin global.
 *
 * Dua jenis antrean: batch impor Excel yang sudah diajukan dan pengajuan
 * manual dari sekretaris umum. Setujui untuk menayangkan ke halaman Awardee
 * publik, atau tolak dengan catatan untuk pengaju. Angka antrean juga muncul
 * sebagai badge di menu sidebar.
 */
export default async function AdminAwardeeApprovalPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const [memberships, batches] = await Promise.all([
    cmsApiGet<CmsAwardee[]>("/v1/memberships/cms/review"),
    cmsApiGet<CmsImportBatch[]>("/v1/membership-imports?status=SUBMITTED"),
  ]);
  const pendingMemberships = memberships ?? [];
  const pendingBatches = batches ?? [];
  const total = pendingMemberships.length + pendingBatches.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Persetujuan Awardee
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Antrean batch impor dan pengajuan manual dari sekretaris umum. Setujui
          untuk menayangkan ke halaman Awardee publik, atau tolak dengan catatan
          untuk pengaju.
        </p>
      </div>

      {total === 0 ? (
        <div
          className={`${PANEL} flex flex-col items-center px-6 py-14 text-center`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-genbi-light text-genbi-blue">
            <Award className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            Tidak ada Awardee menunggu persetujuan
          </p>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
            Batch impor dan pengajuan manual dari sekretaris umum akan muncul di
            sini.
          </p>
        </div>
      ) : (
        <>
          {pendingBatches.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
                Batch impor menunggu ({pendingBatches.length})
              </h2>
              <ul className="space-y-4">
                {pendingBatches.map((batch) => (
                  <ImportBatchCard key={batch.id} batch={batch} />
                ))}
              </ul>
            </section>
          ) : null}

          {pendingMemberships.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
                Pengajuan manual menunggu ({pendingMemberships.length})
              </h2>
              <ul className="space-y-4">
                {pendingMemberships.map((item) => (
                  <MembershipCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
