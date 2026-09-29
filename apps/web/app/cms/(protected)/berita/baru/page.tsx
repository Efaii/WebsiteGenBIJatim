import { CmsForbiddenPanel } from "../../CmsForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";
import { NewsForm } from "../NewsForm";

export const metadata = { title: "Berita Baru | CMS GenBI Jatim" };

export default async function CmsNewsNewPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-slate-900">
        Berita baru
      </h1>
      <NewsForm />
    </section>
  );
}
