import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { CmsSessionInfo } from "@/lib/cms-session";
import { ADMIN_ROLE_LABELS } from "../nav";
import { BTN_SECONDARY, PANEL } from "../ui";

/**
 * Pesan tolakan untuk halaman yang bukan wewenang peran.
 *
 * Dirender di level halaman (bukan layout) supaya boundary Suspense tetap
 * selesai pada hard load; lihat catatan di `lib/cms-guard.ts`. Peran sekretaris
 * tidak lagi melihat panel ini di Ringkasan; panel hanya muncul ketika halaman
 * khusus admin global dibuka langsung dari alamat.
 */
export function AdminForbiddenPanel({ session }: { session: CmsSessionInfo }) {
  return (
    <section className={`${PANEL} mx-auto max-w-xl p-8 text-center`}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-xl font-bold text-slate-900">
        Halaman ini khusus admin global
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Akun{" "}
        <strong className="font-semibold text-slate-900">
          {session.username ?? session.accountId}
        </strong>{" "}
        masuk sebagai{" "}
        <strong className="font-semibold text-slate-900">
          {ADMIN_ROLE_LABELS[session.role]}
        </strong>
        , jadi halaman pengelolaan ini tidak termasuk wewenangnya.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/admin" className={BTN_SECONDARY}>
          Kembali ke Ringkasan
        </Link>
      </div>
    </section>
  );
}
