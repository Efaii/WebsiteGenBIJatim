import { CmsForbiddenPanel } from "./CmsForbiddenPanel";
import { getCmsPageSession } from "@/lib/cms-guard";

export const metadata = { title: "CMS | GenBI Jatim" };

export default async function CmsHomePage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <CmsForbiddenPanel session={session} />;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="font-heading text-xl font-bold text-slate-900">
        CMS GenBI Jatim
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Fondasi CMS kanonik sudah aktif: login memakai sesi cookie dan area ini
        dijaga untuk admin global. Editor konten beranda (mulai dari teks hero)
        ada di menu{" "}
        <strong className="font-semibold text-slate-900">Beranda</strong>;
        editor berita dan FAQ menyusul pada tiket-tiket berikutnya.
      </p>
    </section>
  );
}
