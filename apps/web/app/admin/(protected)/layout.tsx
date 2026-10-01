import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { readCmsSession } from "@/lib/cms-session";
import type { AdminRole } from "../nav";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSidebarNav } from "./AdminSidebarNav";

/**
 * Kerangka area admin multi-peran.
 *
 * Navigasi hidup di sidebar tetap yang menempel pada tepi kiri layar dengan
 * logo GenBI Jatim di atasnya; konten mengalir di sebelah kanan dengan header
 * ringkas (Lihat situs dan Keluar). Di layar kecil sidebar menjadi drawer.
 * Pemeriksaan peran tetap di level halaman (`getCmsPageSession`) karena layout
 * yang mengembalikan pohon tanpa `children` membuat boundary Suspense tidak
 * pernah selesai pada hard load. Sidebar hanya menyaring item menu sesuai
 * peran; penegakan akses yang sebenarnya ada di masing-masing halaman dan API.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await readCmsSession();
  if (!session) redirect("/admin/login?reason=required");

  const role: AdminRole = session.role;

  return (
    <div className="min-h-screen bg-genbi-soft">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-genbi-line bg-white lg:flex">
        <Link
          href="/admin"
          className="flex h-16 shrink-0 items-center gap-2.5 border-b border-genbi-line px-5 transition-colors duration-200 hover:bg-genbi-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
        >
          <span className="relative h-9 w-9 shrink-0">
            <Image
              src="/assets/logos/genbi.svg"
              alt=""
              fill
              sizes="36px"
              className="object-contain"
            />
          </span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-genbi-ink">GenBI</span>{" "}
            <span className="text-genbi-brand-red">Jatim</span>
          </span>
          <span className="rounded-full border border-genbi-haze bg-genbi-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-genbi-blue">
            Admin
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminSidebarNav role={role} />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-genbi-line bg-white/92 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
              <AdminMobileNav role={role} />
              <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
                <span className="relative h-9 w-9 shrink-0">
                  <Image
                    src="/assets/logos/genbi.svg"
                    alt=""
                    fill
                    sizes="36px"
                    className="object-contain"
                  />
                </span>
                <span className="hidden text-lg font-bold tracking-tight sm:block">
                  <span className="text-genbi-ink">GenBI</span>{" "}
                  <span className="text-genbi-brand-red">Jatim</span>
                </span>
              </Link>
              <span className="rounded-full border border-genbi-haze bg-genbi-light px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-genbi-blue">
                Admin
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Lihat situs</span>
              </a>
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
