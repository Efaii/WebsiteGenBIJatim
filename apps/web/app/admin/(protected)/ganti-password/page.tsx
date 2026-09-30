import { redirect } from "next/navigation";
import { readCmsSession } from "@/lib/cms-session";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata = { title: "Ganti Password" };

/**
 * Halaman wajib ganti password untuk akun operator.
 *
 * Dipakai saat login pertama akun baru: guard halaman admin mengalihkan ke
 * sini selama `mustChangePassword` bernilai true sampai password diganti.
 * Setelah selesai pengguna kembali ke ringkasan admin.
 */
export default async function ChangePasswordPage() {
  const session = await readCmsSession();
  if (!session) redirect("/admin/login?reason=required");
  if (!session.mustChangePassword) redirect("/admin");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        Ganti password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Untuk keamanan, akun baru wajib mengganti password sebelum memakai area
        admin. Setelah tersimpan, Anda langsung masuk dengan password baru.
      </p>
      <ChangePasswordForm username={session.username ?? "operator"} />
    </div>
  );
}
