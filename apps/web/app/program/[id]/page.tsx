import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  Image as ImageIcon,
  Newspaper,
  Target,
  Trophy,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackLink } from "@/components/BackLink";
import { ProgramGallery } from "@/components/program/ProgramGallery";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { cn, normalizeAssetUrl } from "@/lib/utils";
import type { GalleryImage } from "@/types/news-gallery.types";

import {
  getProgramById,
  getAllProgramIds,
} from "@/lib/services/program.service";
import {
  isPublicProgramItem,
  programDateLabel,
  programGalleryItems,
} from "@/lib/program-presentation.mjs";
import { divisionLabel } from "@/app/commissariat/[slug]/display";

/*
 * Halaman detail program kerja (redesign).
 *
 * Keputusan penting:
 * - Foto besar di atas DIHAPUS. Sebelumnya gambar pertama galeri dirender dua
 *   kali: sekali sebagai sampul raksasa di header, sekali lagi sebagai item
 *   pertama galeri. Daftar /program sudah membawa peran sampul, jadi header di
 *   sini cukup teks: status, judul, dan metadata.
 * - Field yang tersedia dari API publik tapi belum pernah tampil kini
 *   ditampilkan: divisi dan format. Komisariat sengaja TIDAK ditampilkan atas
 *   permintaan pemilik produk.
 * - Tombol "Proposal Belum Tersedia" dan "Dokumentasi Belum Tersedia" DIHAPUS.
 *   API publik memang tidak pernah mengirim `linkProposalPdf` /
 *   `dokumentasiDrive` (berkas proposal/LPJ ada di tabel ProgramArtifact dan
 *   tidak diproyeksikan ke publik), jadi tombol mati itu hanya derau. Kalau
 *   suatu saat API mengirimkannya, tautan hidup dirender otomatis di bawah.
 * - Galeri memakai lightbox yang sama dengan galeri Berita beranda
 *   (ProgramGallery -> ImageLightbox), bukan gambar statis.
 *
 * Tata letak:
 * - Header adalah BAND lebar penuh berlatar putih dengan garis bawah tipis.
 *   Latar berwarna di band dan di panel kanan DIHAPUS atas permintaan pemilik
 *   produk karena terkesan mengambang; pemisah antar bagian kini memakai
 *   garis tipis dan jarak, bukan blok warna.
 * - Isi TIDAK lagi berupa kartu terpisah yang mengambang: permukaannya putih
 *   lebar penuh, menempel langsung di bawah band, dengan garis pemisah antar
 *   section. Panel KPI/Dampak/Evaluasi menjadi kolom kanan tanpa kartu dan
 *   tanpa latar; jaraknya dari kolom kiri dijaga `lg:gap-x-12` sehingga tidak
 *   menempel ke galeri.
 * - Metadata diberi garis atas, jarak antarbagian, dan nilai tebal navy supaya
 *   terbaca tegas, bukan baris kecil yang tenggelam di band.
 *
 * Detail pass (revisi terakhir):
 * - Judul kini elemen paling atas; chip status "Terlaksana" dipindah ke bawah
 *   judul (permintaan pemilik produk).
 * - Tombol kembali memakai riwayat peramban lewat `BackLink`: kembali
 *   ke halaman sebelumnya, dengan fallback ke daftar program saat halaman
 *   dibuka langsung.
 * - Penghitung foto di header galeri menjadi chip kecil, bukan teks abu yang
 *   mengambang jauh dari judul.
 * - Format dan divisi dirapikan tampilannya lewat `formatLabel` lokal dan
 *   `divisionLabel` yang sama dengan panel komisariat ("offline" -> "Offline",
 *   "kesma" -> "Kesma", "psdm" -> "PSDM").
 * - Penomoran KPI memakai `genbi-blue-hover`, biru yang lebih gelap, supaya
 *   kontras teks 14px di latar terang lolos ambang WCAG AA.
 * - Heading di kolom kanan memakai warna yang sama dengan heading kolom kiri
 *   (near-black) supaya satu warna judul + satu aksen; ikon dan penomoran
 *   tetap biru.
 * - Kolom kanan diberi `lg:pt-4` supaya judul pertamanya sejajar dengan
 *   judul pertama kolom kiri.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) return { title: "Program kerja tidak ditemukan | GenBI Jatim" };

  const description =
    typeof program.description === "string" && program.description.length > 0
      ? program.description.slice(0, 160)
      : `Program kerja GenBI Jatim: ${program.title}.`;

  return {
    title: `${program.title} | Program Kerja GenBI Jatim`,
    description,
  };
}

export async function generateStaticParams() {
  // Build produksi tidak boleh gagal hanya karena API mati (S6): kembalikan
  // daftar kosong dan biarkan route dirender on-demand.
  try {
    return await getAllProgramIds();
  } catch {
    console.warn(
      "[program/[id]] generateStaticParams: API tidak tersedia, route dirender on-demand.",
    );
    return [];
  }
}

function getStatusPresentation(status: string) {
  const value = status.trim().toLowerCase();
  if (value === "done" || value === "completed") {
    return {
      label: "Terlaksana",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }
  if (["on progress", "on-going", "on going", "ongoing"].includes(value)) {
    return {
      label: "Sedang Berjalan",
      className: "border-genbi-haze bg-genbi-light text-genbi-blue",
    };
  }
  return {
    label: "Akan Datang",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  };
}

/*
 * Teks KPI/Dampak/Evaluasi dari DB disimpan sebagai satu string dengan daftar
 * bernomor manual ("1. ... 2. ..."). Di sini item bernomor dirapikan menjadi
 * baris bernomor dan sisanya menjadi paragraf. Tidak ada parser markdown baru;
 * pola pemisahnya sama dengan versi halaman sebelumnya.
 */
function renderFormattedText(text: string | null | undefined) {
  if (!text || text.trim().length === 0) {
    return <p className="text-sm italic text-slate-400">Belum ada keterangan.</p>;
  }

  const parts = text
    .split(/(?=\b\d+\.(?!\d))/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        const numbered = part.match(/^(\d+)\.\s*/);
        if (numbered) {
          return (
            <div key={index} className="flex gap-3">
              {/*
                Biru lebih gelap (genbi-blue-hover) dipakai supaya penomoran
                14px di latar terang lolos kontras WCAG AA; biru biasa hanya
                sekitar 4.47:1 di latar berwarna sebelumnya.
              */}
              <span className="mt-0.5 min-w-[1.2rem] text-sm font-bold tabular-nums text-genbi-blue-hover">
                {numbered[1]}.
              </span>
              <span className="text-sm leading-relaxed text-slate-700">
                {part.replace(/^\d+\.\s*/, "")}
              </span>
            </div>
          );
        }
        return (
          <p
            key={index}
            className="whitespace-pre-line text-sm leading-relaxed text-slate-700"
          >
            {unwrapSoftLineBreaks(part)}
          </p>
        );
      })}
    </div>
  );
}

/*
 * Format kegiatan di database tidak seragam kapitalisasinya ("offline",
 * "Online", "hybrid"). Satu kata huruf kecil dirapikan jadi Title Case;
 * nilai yang sudah rapi dibiarkan apa adanya, mengikuti pola `divisionLabel`
 * dari panel komisariat.
 */
function formatLabel(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (text.length === 0) return "";
  return /^[a-z]+$/.test(text)
    ? text.charAt(0).toUpperCase() + text.slice(1)
    : text;
}

/*
 * Deskripsi dan sebagian teks rail di database tersimpan dengan baris keras
 * (hasil tempel dari dokumen), sehingga `whitespace-pre-line` memaksa baris
 * pendek walau kolom masih lebar ("kelihatan setengah"). Baris tunggal
 * digabung kembali menjadi satu paragraf; jarak antarparagraf (baris kosong)
 * tetap dipertahankan.
 */
function unwrapSoftLineBreaks(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (text.length === 0) return "";
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .join("\n\n");
}

const META_LABEL =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-600";
const META_VALUE = "mt-1 text-[15px] font-bold text-genbi-ink md:text-base";

const LINK_BUTTON_BASE =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60 focus-visible:ring-offset-2";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const data = await getProgramById(id);

  if (!data || !isPublicProgramItem(data)) {
    notFound();
  }

  const status = getStatusPresentation(data.status);
  const dateLabel = programDateLabel(data);

  /*
   * Alt tiap foto diberi nomor urut supaya pembaca layar tahu posisinya di
   * galeri. Foto proker tidak punya alt tersendiri di DB.
   */
  const gallery: GalleryImage[] = programGalleryItems(data).map(
    (src, index, all) => ({
      src: normalizeAssetUrl(src),
      alt: `Dokumentasi ${data.title}, foto ${index + 1} dari ${all.length}`,
    }),
  );

  const detailSections = [
    { key: "kpi", label: "KPI / Target", icon: Target, content: data.kpiTukTarget },
    { key: "dampak", label: "Dampak", icon: Trophy, content: data.dampak },
    { key: "evaluasi", label: "Evaluasi", icon: ClipboardList, content: data.evaluasi },
  ].filter((section) => section.content && section.content.trim().length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-genbi-soft text-slate-900 selection:bg-genbi-haze selection:text-genbi-ink">
      <Navbar />

      <main className="relative z-10 flex-1">
        {/* BAND HEADER: latar putih polos, garis bawah tipis, metadata tegas. */}
        <header className="border-b border-genbi-line/80 bg-white pb-8 pt-28 md:pb-10">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <BackLink label="Kembali ke Program" fallbackHref="/program" />

            <FadeIn delay={0.05} className="mt-6">
              <div className="max-w-4xl">
                <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
                  {data.title}
                </h1>

                {/*
                  Keterangan status sengaja di BAWAH judul supaya judul
                  menjadi elemen paling atas (permintaan pemilik produk);
                  sebelumnya chip ini duduk di atas judul.
                */}
                <span
                  className={cn(
                    "mt-5 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                    status.className,
                  )}
                >
                  {status.label}
                </span>

                {/*
                  Metadata: garis atas + pemisah vertikal antarbagian di layar
                  lebar, nilai tebal navy. Tujuannya supaya informasi tidak
                  tenggelam di band. Komisariat tidak ditampilkan.
                */}
                <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-genbi-line/70 pt-6 sm:flex sm:flex-nowrap sm:gap-0 sm:divide-x sm:divide-genbi-line/80">
                  <div className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                    <dt className={META_LABEL}>Tanggal</dt>
                    <dd className={META_VALUE}>{dateLabel}</dd>
                  </div>

                  {data.format && (
                    <div className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                      <dt className={META_LABEL}>Format</dt>
                      <dd className={META_VALUE}>{formatLabel(data.format)}</dd>
                    </div>
                  )}

                  {data.divisi && (
                    <div className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                      <dt className={META_LABEL}>Divisi</dt>
                      <dd className={META_VALUE}>{divisionLabel(data.divisi)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </FadeIn>
          </div>
        </header>

        {/*
          PERMUKAAN ISI: putih lebar penuh, menempel langsung di bawah band
          (tanpa celah, tanpa radius, tanpa bayangan). Pemisah antarbagian
          memakai garis `divide`. Kolom kanan tampil polos tanpa kartu dan
          tanpa latar; jarak `lg:gap-x-12` menjaga galeri tidak menempel ke
          panel KPI/Dampak/Evaluasi.
        */}
        <div className="border-b border-genbi-line bg-white">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-12">
              <div className="divide-y divide-genbi-line">
                <section
                  aria-labelledby="deskripsi-kegiatan"
                  className="py-8 md:py-10"
                >
                  <SlideUp>
                    <h2
                      id="deskripsi-kegiatan"
                      className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
                    >
                      Deskripsi Kegiatan
                    </h2>
                    {/*
                      Penyebab "kelihatan setengah" bukan lebar kolom, tapi
                      teks deskripsi di database yang tersimpan dengan baris
                      keras hasil tempel dari dokumen, sehingga
                      `whitespace-pre-line` memaksa baris pendek.
                      `unwrapSoftLineBreaks` menggabung baris tunggal (jarak
                      antarparagraf tetap dipertahankan). Batas 76ch (dari
                      68ch) disimpan sebagai margin kanan yang disengaja,
                      bukan menempel ke panel KPI.
                    */}
                    <p className="mt-4 max-w-[76ch] whitespace-pre-line text-[15px] leading-relaxed text-slate-700 md:text-base">
                      {unwrapSoftLineBreaks(data.description) ||
                        "Belum ada deskripsi."}
                    </p>
                  </SlideUp>
                </section>

                <section
                  aria-labelledby="galeri-kegiatan"
                  className="py-8 md:py-10"
                >
                  <SlideUp>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2
                        id="galeri-kegiatan"
                        className="font-heading text-xl font-bold tracking-tight text-slate-900 md:text-2xl"
                      >
                        Galeri Kegiatan
                      </h2>
                      {/*
                        Penghitung foto dibentuk sebagai chip kecil supaya
                        terbaca sebagai metadata yang disengaja, bukan teks abu
                        yang mengambang jauh dari judul di layar lebar.
                      */}
                      {gallery.length > 0 && (
                        <p className="inline-flex items-center rounded-full border border-genbi-line bg-genbi-soft px-3 py-1 text-xs font-semibold text-slate-700">
                          {gallery.length} foto
                        </p>
                      )}
                    </div>

                    {gallery.length > 0 ? (
                      <ProgramGallery images={gallery} className="mt-5" />
                    ) : (
                      <div className="mt-5 flex flex-col items-center justify-center rounded-thumb border border-dashed border-genbi-line bg-genbi-soft px-6 py-12 text-center">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                        <p className="mt-3 text-sm font-medium text-slate-500">
                          Belum ada foto dokumentasi untuk program ini.
                        </p>
                      </div>
                    )}
                  </SlideUp>
                </section>
              </div>

              {/*
                lg:pt-4 menggeser isi rail turun 16px supaya judul pertamanya
                sejajar optis dengan judul pertama kolom kiri (padding atas
                kolom kiri 40px = p-6 rail 24px + 16px).
              */}
              {detailSections.length > 0 && (
                <aside className="flex flex-col border-t border-genbi-line lg:border-t-0 lg:pt-4">
                  <div className="flex-1 divide-y divide-genbi-line/80">
                    {detailSections.map(({ key, label, icon: Icon, content }) => (
                      <section key={key} className="p-6">
                        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Icon className="h-4 w-4 text-genbi-blue" strokeWidth={2} />
                          {label}
                        </h2>
                        <div className="mt-3">{renderFormattedText(content)}</div>
                      </section>
                    ))}
                  </div>

                  {/*
                    Tautan berkas hanya dirender saat datanya benar-benar ada.
                    API publik belum memproyeksikan proposal/LPJ/dokumentasi
                    (lihat komentar kepala berkas), jadi saat ini blok ini tidak
                    tampil dan tidak ada tombol mati.
                  */}
                  {(data.linkProposalPdf || data.dokumentasiDrive) && (
                    <div className="space-y-3 border-t border-genbi-line p-6">
                      {data.linkProposalPdf && (
                        <a
                          href={data.linkProposalPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            LINK_BUTTON_BASE,
                            "border border-genbi-line bg-white text-genbi-ink hover:border-genbi-bright hover:text-genbi-blue",
                          )}
                        >
                          <Newspaper className="h-4 w-4 text-genbi-blue" />
                          Lihat Proposal (PDF)
                        </a>
                      )}
                      {data.dokumentasiDrive && (
                        <a
                          href={data.dokumentasiDrive}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            LINK_BUTTON_BASE,
                            "bg-genbi-blue text-white hover:bg-genbi-blue-hover",
                          )}
                        >
                          Dokumentasi GDrive
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
