import { notFound } from "next/navigation";
import { CmsForbiddenPanel } from "../../CmsForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { NewsActions } from "../NewsActions";
import { NewsForm } from "../NewsForm";
import { NewsGallery } from "../NewsGallery";

export const metadata = { title: "Kelola Berita | CMS GenBI Jatim" };

export default async function CmsNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  const { id } = await params;
  const items = (await cmsApiGet<CmsNewsItem[]>("/v1/news/cms")) ?? [];
  const item = items.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-heading text-xl font-bold text-slate-900">
          {item.title}
        </h1>
        <NewsActions news={item} />
      </div>
      <NewsForm news={item} />
      <NewsGallery news={item} />
    </section>
  );
}
