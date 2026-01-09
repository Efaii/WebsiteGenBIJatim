"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewsDetailPage() {
  const params = useParams();

  // --- Mock Data Dictionary ---
  const newsData: Record<
    string,
    {
      title: string;
      date: string;
      author: string;
      readTime: string;
      heroImage: string;
      content: React.ReactNode;
    }
  > = {
    "genbi-jatim-leadership-camp": {
      title: "GenBI Jatim Leadership Camp 2024: Mencetak Pemimpin Masa Depan",
      date: "20 Desember 2024",
      author: "Divisi Media GenBI Jatim",
      readTime: "7 Menit Baca",
      heroImage: "/assets/images/galeri/1.jpg", // Menggunakan salah satu foto galeri
      content: (
        <>
          <p className="font-medium text-white text-xl">
            Batu, Malang — Sebanyak 300 anggota baru Generasi Baru Indonesia
            (GenBI) Koordinator Komisariat Jawa Timur nampak antusias mengikuti
            pembukaan "GenBI Jatim Leadership Camp 2024" yang digelar di Hotel
            Purnama, Batu.
          </p>
          <p>
            Kegiatan ini dibuka langsung oleh Kepala Perwakilan Bank Indonesia
            Provinsi Jawa Timur. Dalam sambutannya, beliau menekankan bahwa
            GenBI bukan sekadar penerima beasiswa, melainkan *role model* dan
            *agent of change* bagi lingkungan sekitarnya. "Kalian adalah energi
            baru yang akan menggerakkan literasi ekonomi hingga ke pelosok
            desa," tegasnya.
          </p>

          <div className="my-8 rounded-2xl overflow-hidden relative h-[400px]">
            <Image
              src="/assets/images/galeri/2.jpg"
              alt="Suasana Materi Leadership Camp"
              fill
              className="object-cover"
            />
          </div>

          <p>
            Selama tiga hari dua malam, peserta mendapatkan materi padat mulai
            dari *Central Banking*, *Leadership & Team Building*, hingga *Public
            Speaking* yang dibawakan oleh praktisi ternama. Tak hanya duduk di
            ruangan, peserta juga diajak untuk melakukan simulasi sidang
            pemecahan masalah ekonomi regional.
          </p>
          <h3 className="text-2xl font-bold text-white mt-8 mb-4">
            Malam Inagurasi: Puncak Kebersamaan
          </h3>
          <p>
            Puncak acara ditutup dengan Malam Inagurasi yang menampilkan bakat
            seni dari perwakilan setiap komisariat. Suasana haru dan bangga
            menyelimuti ballroom ketika seluruh peserta menyanyikan lagu "Padamu
            Negeri" sambil memegang lilin, simbol komitmen untuk terus menerangi
            negeri dengan prestasi.
          </p>
          <p>
            "Leadership Camp ini benar-benar membuka mata saya. Saya jadi paham
            betapa besarnya tanggung jawab kami sebagai *frontliner* Bank
            Indonesia," ujar Raka, salah satu peserta dari Universitas Jember.
          </p>
        </>
      ),
    },
  };

  const slug = params?.slug;
  const slugStr = Array.isArray(slug) ? slug[0] : slug || "";
  const data = newsData[slugStr] || {
    title: slugStr
      ? decodeURIComponent(slugStr).replace(/-/g, " ")
      : "Berita Tidak Ditemukan",
    date: "20 Oktober 2025",
    author: "Admin GenBI",
    readTime: "5 Menit Baca",
    heroImage: "/assets/images/raker.jpg",
    content: (
      <>
        <p className="font-medium text-white text-xl">
          Surabaya — GenBI Jawa Timur kembali menunjukkan komitmennya dalam
          mendukung kebijakan Bank Indonesia. Kali ini, ratusan anggota GenBI
          diterjunkan langsung ke pasar-pasar tradisional untuk
          mensosialisasikan penggunaan QRIS.
        </p>
        <p>
          Kegiatan ini merupakan bagian dari "Pekan QRIS Nasional" yang
          diselenggarakan serentak. Tidak hanya sekadar membagikan brosur,
          teman-teman GenBI juga mendampingi para pedagang untuk mendaftar dan
          mempraktikkan langsung cara bertransaksi menggunakan QRIS.
        </p>
        <p>
          "Tantangan terbesar adalah mindset," ujar salah satu koordinator
          lapangan. "Banyak pedagang sepuh yang takut teknologi. Tapi dengan
          pendekatan personal, mereka jadi paham bahwa QRIS itu justru
          memudahkan, mencatat transaksi otomatis, dan bebas uang kembalian
          receh."
        </p>

        <div className="my-8 rounded-2xl overflow-hidden relative h-[400px]">
          <Image
            src="/assets/images/bnsp.JPG"
            alt="Kegiatan Lapangan"
            fill
            className="object-cover"
          />
        </div>

        <h3 className="text-2xl font-bold text-white mt-8 mb-4">
          Dampak Langsung ke UMKM
        </h3>
        <p>
          Data menunjukkan peningkatan transaksi non-tunai sebesar 40% di pasar
          target setelah kegiatan ini. Hal ini membuktikan bahwa edukasi
          *face-to-face* oleh generasi muda sangat efektif dalam mengakselerasi
          digitalisasi ekonomi daerah.
        </p>
      </>
    ),
  };

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-cyan-500 selection:text-white bg-[#0f1016]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Article Header */}
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src={data.heroImage}
              alt="News Background"
              fill
              className="object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1016] via-[#0f1016]/50 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 pb-12">
            <div className="max-w-4xl">
              <FadeIn>
                <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-full shadow-sm uppercase tracking-wider mb-4 inline-block">
                  Berita Utama
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight capitalize">
                  {data.title}
                </h1>
                <div className="flex items-center gap-4 text-blue-200/60 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300 font-bold">
                      A
                    </span>
                    {data.author}
                  </span>
                  <span>•</span>
                  <span>{data.date}</span>
                  <span>•</span>
                  <span>{data.readTime}</span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="container mx-auto px-6 relative z-10 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <SlideUp
                delay={0.2}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 space-y-6 text-blue-100/80 text-lg leading-relaxed"
              >
                {data.content}
              </SlideUp>

              <div className="mt-12">
                <Link href="/news">
                  <Button variant="outline" className="gap-2">
                    ← Kembali ke Berita
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-blue-950/20 border border-white/10 rounded-2xl p-6 sticky top-24">
                <h4 className="text-lg font-bold text-white mb-4">
                  Berita Terkait
                </h4>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="group cursor-pointer">
                      <h5 className="text-blue-100 group-hover:text-cyan-400 transition-colors text-sm font-medium mb-1">
                        Roadshow Beasiswa BI di Universitas Madura
                      </h5>
                      <span className="text-xs text-blue-500/60">
                        12 Oktober 2025
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
