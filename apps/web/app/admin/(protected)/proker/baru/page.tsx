import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";
import { ProgramForm } from "../ProgramForm";

export const metadata = { title: "Program Kerja Baru" };

export default async function AdminProgramNewPage() {
  const session = await getCmsPageSession();
  if (session.role !== "SEKRETARIS_DIVISI")
    return <AdminForbiddenPanel session={session} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Program Kerja Baru
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Disimpan sebagai draft dulu. Unggah Proposal sebelum mengajukan ke
          admin global.
        </p>
      </div>
      <ProgramForm />
    </div>
  );
}
