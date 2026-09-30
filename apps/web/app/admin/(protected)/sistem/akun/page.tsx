import { AdminForbiddenPanel } from "../../AdminForbiddenPanel";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsOperatorAccount } from "@/lib/services/cms-account.service";
import type { CmsAwardeeOptions } from "@/lib/services/cms-membership.service";
import { AccountManager } from "./AccountManager";

export const metadata = { title: "Akun Operator" };

/**
 * Pengelolaan akun operator untuk admin global.
 *
 * Akun bersama berbasis scope: buat akun dengan peran dan penugasan
 * (komisariat, periode, divisi), reset password, serta nonaktifkan atau
 * aktifkan kembali. Akun baru wajib mengganti password saat login pertama.
 */
export default async function AdminAccountsPage() {
  const session = await getCmsPageSession();
  if (session.role !== "ADMIN_GLOBAL")
    return <AdminForbiddenPanel session={session} />;

  const [accounts, options] = await Promise.all([
    cmsApiGet<CmsOperatorAccount[]>("/v1/cms-accounts"),
    cmsApiGet<CmsAwardeeOptions>("/v1/memberships/cms/options"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Akun Operator
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Kelola akun bersama per peran dan scope: buat akun, reset password,
          serta nonaktifkan atau aktifkan kembali. Akun baru wajib mengganti
          password saat login pertama.
        </p>
      </div>
      <AccountManager
        accounts={accounts ?? []}
        periods={options?.periods ?? []}
      />
    </div>
  );
}
