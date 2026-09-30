import { FaqManager } from "./FaqManager";
import { AdminForbiddenPanel } from "../AdminForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";

export const metadata = { title: "FAQ" };

export default async function AdminFaqPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          FAQ
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Kelola pertanyaan yang sering diajukan: tambah, ubah, urutkan,
          aktifkan atau nonaktifkan. Beranda menampilkan hanya FAQ aktif sesuai
          urutan.
        </p>
      </div>
      <FaqManager />
    </div>
  );
}
