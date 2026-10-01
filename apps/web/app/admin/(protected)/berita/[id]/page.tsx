import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsNewsItem } from "@/lib/services/cms-news.service";
import { NewsActions } from "../NewsActions";
import { NewsFeatureSlot } from "../NewsFeatureSlot";
import { NewsForm } from "../NewsForm";
import { NewsGallery } from "../NewsGallery";
import { newsAuthorFallback } from "@/lib/news-byline";

export const metadata = { title: "Kelola Berita" };

export default async function AdminNewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCmsPageSession();
  const isGlobal = session.role === "ADMIN_GLOBAL";

  const { id } = await params;
  const items = (await cmsApiGet<CmsNewsItem[]>("/v1/news/cms")) ?? [];
  const item = items.find((candidate) => candidate.id === id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/berita"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-genbi-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Berita
        </Link>
        <h1 className="mt-3 break-words font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {item.title}
        </h1>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <NewsForm
            news={item}
            commissariatName={session.commissariatName}
            authorFallback={newsAuthorFallback(
              session.role,
              session.displayName,
            )}
          />
          {isGlobal && <NewsGallery news={item} />}
        </div>
        <div className="space-y-6 xl:sticky xl:top-24">
          <NewsActions news={item} role={session.role} />
          {isGlobal && <NewsFeatureSlot news={item} />}
        </div>
      </div>
    </div>
  );
}
