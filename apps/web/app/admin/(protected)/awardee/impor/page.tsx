import { Download } from "lucide-react";
import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import {
  cmsAwardeeImportTemplateUrl,
  type CmsAwardeeOptions,
} from "@/lib/services/cms-membership.service";
import { BTN_SECONDARY, PANEL } from "../../../ui";
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

  const exampleKomisariat = options?.commissariat?.name ?? "UPN Veteran Jatim";
  const templateColumns = [
    "Komisariat",
    "Nama Lengkap",
    "Jabatan",
    "Divisi",
    "Prodi",
  ];
  const exampleRows = [
    [
      exampleKomisariat,
      "Andi Pratama",
      "Anggota",
      "Pendidikan",
      "Teknik Informatika",
    ],
    [
      exampleKomisariat,
      "Sari Dewi",
      "Sekretaris Divisi",
      "Ekonomi Kreatif",
      "Manajemen",
    ],
    [
      exampleKomisariat,
      "Bima Saputra",
      "Kepala Divisi",
      "Media Komunikasi",
      "Ilmu Komunikasi",
    ],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Impor Awardee
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Baris yang lolos pratinjau tersimpan sebagai Draft, lalu diajukan
          untuk disetujui admin global sebelum tampil di halaman Awardee publik.
        </p>
      </div>

      <section className={`${PANEL} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Berkas Excel yang diterima
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
              Satu sheet dengan kolom persis seperti contoh berikut. Nilai
              Komisariat hanya divalidasi terhadap komisariat yang dipilih di
              langkah unggah; periode juga dipilih di langkah unggah, bukan
              lewat kolom.
            </p>
          </div>
          <a
            href={cmsAwardeeImportTemplateUrl()}
            download
            className={BTN_SECONDARY}
          >
            <Download className="h-4 w-4" aria-hidden />
            Unduh template
          </a>
        </div>

        <div className="mt-4 overflow-x-auto rounded-thumb border border-genbi-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-genbi-soft text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                {templateColumns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-4 py-2.5 font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-genbi-line">
              {exampleRows.map((row) => (
                <tr key={row[1]}>
                  {row.map((cell, index) => (
                    <td
                      key={`${row[1]}-${index}`}
                      className="px-4 py-2.5 text-slate-600"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Nilai di atas hanya contoh. Template berisi baris header + 50 baris
          kosong; kolom tambahan seperti &quot;No.&quot; atau
          &quot;Periode&quot; akan ditolak.
        </p>
      </section>

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
