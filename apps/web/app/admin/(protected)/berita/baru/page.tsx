import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";
import { NewsForm } from "../NewsForm";

export const metadata = { title: "Berita Baru" };

export default async function AdminNewsNewPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Berita baru
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Disimpan sebagai draft dulu. Terbitkan setelah cover dan isi lengkap
          lewat halaman kelola berita.
        </p>
      </div>
      <NewsForm />
    </div>
  );
}
