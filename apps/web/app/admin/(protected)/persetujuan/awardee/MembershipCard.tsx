import type { CmsAwardee } from "@/lib/services/cms-membership.service";
import { PANEL } from "../../../ui";
import {
  AWARDEE_STATUS_BADGE,
  AWARDEE_STATUS_LABEL,
  awardeeStatusClass,
} from "../../awardee/status";
import { ApprovalButtons } from "./ApprovalButtons";

/**
 * Kartu antrean untuk satu pengajuan manual Awardee dari sekretaris umum.
 *
 * Menampilkan identitas, jabatan, divisi, program studi, dan asal scope
 * sebelum admin memutuskan setujui (terbit) atau tolak dengan catatan.
 */
export function MembershipCard({ item }: { item: CmsAwardee }) {
  return (
    <li className={`${PANEL} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`${AWARDEE_STATUS_BADGE} ${awardeeStatusClass(
                item.publicationStatus,
              )}`}
            >
              {AWARDEE_STATUS_LABEL[item.publicationStatus] ??
                item.publicationStatus}
            </span>
            <h2 className="min-w-0 font-heading text-lg font-bold tracking-tight text-slate-900">
              {item.name}
            </h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {item.position} - {item.division?.name ?? "tanpa divisi"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {item.studyProgram} - {item.commissariat?.name ?? "-"} -{" "}
            {item.period?.label ?? "-"} - diperbarui{" "}
            {new Date(item.updatedAt).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-genbi-line pt-4">
        <ApprovalButtons kind="MEMBERSHIP" id={item.id} />
      </div>
    </li>
  );
}
