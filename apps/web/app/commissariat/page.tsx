import { CommissariatClient } from "./CommissariatClient";
import { selectRecentActivities } from "./recent-activities";
import {
  getAllCommissariats,
  getGlobalCommissariatStats,
} from "@/lib/services/commissariat.service";
import { getAllPrograms } from "@/lib/services/program.service";

/**
 * Halaman daftar komisariat.
 *
 * Server component: data diambil saat render sehingga isi halaman sudah ada
 * di HTML pertama (lebih baik untuk SEO dan paint awal), bukan menunggu fetch
 * di browser. Bagian interaktif (tombol "Coba Lagi") ditangani island klien,
 * dan kegagalan API di sini dirender sebagai keadaan gagal yang sama.
 */
export default async function CommissariatPage() {
  try {
    const [commissariats, stats, programs] = await Promise.all([
      getAllCommissariats(),
      getGlobalCommissariatStats(),
      getAllPrograms(),
    ]);

    return (
      <CommissariatClient
        data={{
          commissariats,
          stats,
          activities: selectRecentActivities(programs),
        }}
      />
    );
  } catch (error) {
    console.error("Gagal memuat data komisariat:", error);
    return <CommissariatClient data={null} />;
  }
}
