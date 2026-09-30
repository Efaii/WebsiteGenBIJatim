import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/Container";
import { readCmsSession } from "@/lib/cms-session";
import { ADMIN_ROLE_LABELS, type AdminRole } from "../nav";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSidebarNav } from "./AdminSidebarNav";

/**
 * Kerangka area admin multi-peran.
 *
 * Header menjaga identitas, info akun, Lihat situs, dan Keluar; navigasi
 * utama hidup di sidebar kiri (drawer di layar kecil). Pemeriksaan peran tetap
 * di level halaman (`getCmsPageSession`) karena layout yang mengembalikan pohon
 * tanpa `children` membuat boundary Suspense tidak pernah selesai pada hard
 * load. Sidebar hanya menyaring item menu sesuai peran; penegakan akses yang
 * sebenarnya ada di masing-masing halaman dan API.
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
    <div className="flex min-h-screen flex-col bg-genbi-soft">
      <header className="sticky top-0 z-50 border-b border-genbi-line bg-white/92 backdrop-blur-xl">
        <Container>
          <div className="flex h-16 items-center justify-between gap-3 md:h-[72px]">
            <div className="flex min-w-0 items-center gap-2.5">
              <AdminMobileNav role={role} />
              <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
                <span className="relative h-9 w-9 shrink-0 md:h-10 md:w-10">
                  <Image
                    src="/assets/logos/genbi.svg"
                    alt=""
                    fill
                    sizes="40px"
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

            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 xl:block">
                Masuk sebagai{" "}
                <span className="font-semibold text-slate-700">
                  {session.username ?? "admin"}
                </span>{" "}
                ({ADMIN_ROLE_LABELS[role]})
              </span>
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
        </Container>
      </header>

      <Container className="flex w-full flex-1 items-start gap-8 py-8 md:py-10">
        <aside className="sticky top-[88px] hidden w-60 shrink-0 lg:block">
          <AdminSidebarNav role={role} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </Container>
    </div>
  );
}
