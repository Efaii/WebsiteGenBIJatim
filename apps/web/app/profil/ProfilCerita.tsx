import Image from "next/image";
import { Container } from "@/components/Container";
import { profilCerita } from "@/content/profil";

/*
 * Penutup halaman: "Cerita Kami". Teks cerita di kiri, kolase foto di kanan.
 *
 * Kolase memakai dua kolom tumpukan (masonry sederhana): setiap kolom berisi
 * foto dengan rasio berbeda-beda (potret, kotak, lanskap) dan kolom kedua
 * digeser turun supaya tidak terbaca sebagai baris kotak yang seragam,
 * mengikuti referensi desain. Mobile tetap dua kolom.
 */
const LEFT_SHAPES = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[16/10]",
  "aspect-[4/5]",
  "aspect-square",
];
const RIGHT_SHAPES = [
  "aspect-[16/10]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
];

function CollageTile({
  src,
  shape,
  index,
}: {
  src: string;
  shape: string;
  index: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-media bg-genbi-light ${shape}`}
    >
      <Image
        src={src}
        alt={`Dokumentasi kegiatan GenBI Jawa Timur ${index + 1}`}
        fill
        sizes="(max-width: 1024px) 45vw, 22vw"
        className="object-cover"
      />
    </div>
  );
}

export function ProfilCerita() {
  const left = profilCerita.collage.filter((_, index) => index % 2 === 0);
  const right = profilCerita.collage.filter((_, index) => index % 2 === 1);

  return (
    <section className="bg-genbi-soft py-16 md:py-20 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {profilCerita.title}
            </h2>
            {profilCerita.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 max-w-[60ch] text-sm leading-relaxed text-slate-600 md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="flex flex-col gap-3 md:gap-4">
              {left.map((src, index) => (
                <CollageTile
                  key={src}
                  src={src}
                  shape={LEFT_SHAPES[index % LEFT_SHAPES.length]}
                  index={index * 2}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-8 md:gap-4 md:pt-12">
              {right.map((src, index) => (
                <CollageTile
                  key={src}
                  src={src}
                  shape={RIGHT_SHAPES[index % RIGHT_SHAPES.length]}
                  index={index * 2 + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
