import { getCmsPageSession } from "@/lib/cms-guard";
import { NewsForm } from "../NewsForm";
import { newsAuthorFallback } from "@/lib/news-byline";

export const metadata = { title: "Berita Baru" };

export default async function AdminNewsNewPage() {
  const session = await getCmsPageSession();
  const isGlobal = session.role === "ADMIN_GLOBAL";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Berita baru
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {isGlobal
            ? "Disimpan sebagai draft dulu. Terbitkan setelah cover dan isi lengkap lewat halaman kelola berita."
            : "Disimpan sebagai draft dulu. Lengkapi cover dan isi, lalu ajukan lewat halaman kelola berita."}
        </p>
      </div>
      <NewsForm
        commissariatName={session.commissariatName}
        authorFallback={newsAuthorFallback(session.role, session.displayName)}
      />
    </div>
  );
}
