import { connection } from "next/server";
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
 * dan kegagalan API di sini dirender sebagai keadaan gagal yang sama. `connection()`
 * memastikan data API tidak dicari saat membangun image di laptop.
 */
export default async function CommissariatPage() {
  await connection();
  const [commissariatResult, statsResult, programsResult] =
    await Promise.allSettled([
      getAllCommissariats(),
      getGlobalCommissariatStats(),
      getAllPrograms(),
    ]);
  const failure = [commissariatResult, statsResult, programsResult].find(
    (entry) => entry.status === "rejected",
  );
  if (failure?.status === "rejected") {
    console.error("Gagal memuat data komisariat:", failure.reason);
    return <CommissariatClient data={null} />;
  }
  if (
    commissariatResult.status !== "fulfilled" ||
    statsResult.status !== "fulfilled" ||
    programsResult.status !== "fulfilled"
  ) {
    return <CommissariatClient data={null} />;
  }

  const commissariats = commissariatResult.value;
  const stats = statsResult.value;
  const programs = programsResult.value;
  return (
    <CommissariatClient
      data={{ commissariats, stats, activities: selectRecentActivities(programs) }}
    />
  );
}
