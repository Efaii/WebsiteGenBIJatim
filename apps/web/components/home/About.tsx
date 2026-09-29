import Image from "next/image";
import { Container } from "@/components/Container";

export interface AboutContent {
  eyebrow: string;
  heading: { line1: string; line2: string };
  paragraphLead: string;
  paragraph: string;
  emphasis: string;
  images: { src: string; alt: string }[];
}

/**
 * AboutSection
 *
 * Dua kolom: kolase aktivitas di kiri, narasi di kanan. Kolase memakai
 * komposisi asimetris (baris atas lebih tinggi, baris bawah terbagi lebar
 * 5/7) supaya terasa disusun, bukan grid sama rata.
 *
 * Mitra Strategis TIDAK lagi di sini: section itu punya komponen sendiri
 * (components/home/Mitra.tsx) karena punya judul sendiri.
 *
 * Tidak ada animasi masuk di section ini: seluruh konten langsung ter-render.
 */
export function About({ content }: { content: AboutContent }) {
  const { eyebrow, heading, paragraphLead, paragraph, emphasis, images } =
    content;

  return (
    <section
      data-section="about"
      className="relative overflow-hidden bg-white py-24 md:py-28 lg:py-32"
    >
      {/* Aksen dekoratif tipis, tidak mengganggu konten. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-genbi-haze/40 blur-3xl"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* --- KOLASE --- */}
          {/*
            Empat tile dengan komposisi ASIMETRIS: baris atas terbagi rata
            (6/6), baris bawah sengaja dibagi 5/7 sehingga kolom kirinya lebih
            sempit dan kolom kanannya lebih lebar.

            Ketidaksamaan lebar itu DISENGAJA, tujuannya supaya kolase terasa
            disusun, bukan grid sama rata. JANGAN diratakan menjadi 6/6. Itu
            pernah terjadi atas dasar pembacaan yang keliru, dan membuat
            desainnya kehilangan komposisinya.
          */}
          <div className="grid aspect-[4/3] grid-cols-12 grid-rows-[1.28fr_1fr] gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={image.src}
                className={[
                  "group relative overflow-hidden rounded-card bg-genbi-light",
                  // Baris atas: dua tile besar. Baris bawah: satu sempit, satu lebar.
                  index === 0 ? "col-span-6" : "",
                  index === 1 ? "col-span-6" : "",
                  index === 2 ? "col-span-5" : "",
                  index === 3 ? "col-span-7" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>

          {/* --- NARASI --- */}
          <div>
            {/*
              Eyebrow ini sengaja dinormalkan: warna biru dan bobot semibold
              dilepas atas permintaan pemilik produk, jadi kini near-black
              tanpa bold. Huruf besar dan jarak antarhurufnya dipertahankan
              supaya ia tetap terbaca sebagai label kecil di atas judul,
              bukan sebagai paragraf.
            */}
            <p className="text-sm uppercase tracking-[0.2em] text-slate-900">
              {eyebrow}
            </p>

            <h2 className="mt-4 font-heading text-[2rem] font-bold leading-[1.12] tracking-tight text-slate-900 md:mt-5 md:text-[2.75rem] lg:text-[3.25rem]">
              {heading.line1}
              <br />
              <span className="text-genbi-blue">{heading.line2}</span>
            </h2>

            {/*
              Rata kiri (default). Sebelumnya paragraf ini memakai justify,
              tetapi justifikasi tanpa hipenasi otomatis menghasilkan celah
              antarkata yang tidak rata ("sungai" putih). Di mobile kolomnya
              menyempit sehingga masalah itu jauh lebih terlihat.
            */}
            <p className="mt-6 max-w-[38rem] text-base leading-relaxed text-slate-600 md:mt-7 md:text-[17px]">
              <strong className="font-semibold text-slate-900">
                {paragraphLead}
              </strong>{" "}
              {paragraph}
            </p>

            <p className="mt-5 max-w-[38rem] text-base font-semibold leading-relaxed text-slate-900 md:mt-6 md:text-[17px]">
              {emphasis}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
