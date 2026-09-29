import { FaqManager } from "./FaqManager";
import { CmsForbiddenPanel } from "../CmsForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";

export const metadata = { title: "FAQ | CMS Genbi Jatim" };

export default async function CmsFaqPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-slate-900">FAQ</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
        Kelola pertanyaan yang sering diajukan: tambah, ubah, urutkan, aktifkan
        atau nonaktifkan. Beranda menampilkan hanya FAQ aktif sesuai urutan.
      </p>
      <FaqManager />
    </section>
  );
}
