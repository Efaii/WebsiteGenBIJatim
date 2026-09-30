import { redirect } from "next/navigation";
import { readCmsSession, type CmsSessionInfo } from "@/lib/cms-session";

/**
 * Sesi untuk halaman CMS yang terlindungi.
 *
 * Layout `(protected)` hanya menangani pengunjung tanpa sesi. Pemeriksaan
 * eksplisit di level halaman ada di sini karena **layout yang mengembalikan
 * pohon tanpa `children` membuat boundary Suspense tidak pernah selesai pada
 * hard load** (halaman terjebak di fallback "Memuat halaman"); halaman yang
 * mengembalikan panel tolakan sebagai isi segmen biasa tidak bermasalah.
 *
 * Setiap halaman di bawah `(protected)` wajib memanggil ini sebelum merender.
 */
export const getCmsPageSession = async (): Promise<CmsSessionInfo> => {
  const session = await readCmsSession();
  if (!session) redirect("/admin/login?reason=required");
  return session;
};
