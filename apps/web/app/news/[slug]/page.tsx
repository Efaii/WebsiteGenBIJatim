import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/Container";
import { NewsGalleryCarousel } from "@/components/news/NewsGalleryCarousel";
import {
  getNewsBySlug,
  getRecentNews,
  newsAssetUrl,
  type PublicNewsSummary,
} from "@/lib/services/news.service";
import { newsBylineParts } from "@/lib/news-byline";

/**
 * Awalan dateline pada paragraf pertama ("Surabaya — ...", "Gresik — ...").
 * Kota ditebalkan seperti kebiasaan media, tanpa mengubah teks sumbernya.
 */
const DATELINE = /^([A-Z][A-Za-z.'-]*)(\s*(?:—|–|-)\s*)([\s\S]*)$/;

const imageUrl = (news: PublicNewsSummary) =>
  newsAssetUrl(news.images?.[0] ?? news.coverImage);

/**
 * Kalimat penting ditandai `**...**` di dalam data berita (bukan di kode), lalu
 * penanda itu dirender sebagai bold supaya pesan utama tiap berita menonjol.
 * Teks di luar penanda dibiarkan apa adanya.
 */
const renderInline = (text: string) =>
  text.split(/\*\*(.+?)\*\*/).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    ),
  );

/**
 * Konten kaya (hasil editor admin) dirender sebagai HTML; hanya bentuk yang
 * dikenali dan bebas elemen berbahaya yang memakai jalur HTML. Konten baru
 * sudah disaring di API; saringan di sini adalah sabuk pengaman untuk baris
 * lama yang dibuat sebelum editor teks kaya ada.
 */
const RICH_CONTENT =
  /<(p|br|strong|b|em|i|u|s|ul|ol|li|h2|h3|blockquote|a)[\s>/]/i;
const DANGEROUS_CONTENT = /<(script|iframe|style|object|embed|link|meta)\b/i;
const isSafeRichContent = (value: string) =>
  RICH_CONTENT.test(value) &&
  !DANGEROUS_CONTENT.test(value) &&
  !/\son\w+\s*=/i.test(value);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "Berita tidak ditemukan | GenBI Jatim" };

  const cover = imageUrl(news);
  return {
    title: `${news.title} | GenBI Jatim`,
    description: news.excerpt,
    // openGraph diisi hanya bila ada cover: mendefinisikannya tanpa images akan
    // menggantikan objek OG dari root dan menghilangkan og:image default.
    ...(cover
      ? {
          openGraph: {
            title: news.title,
            description: news.excerpt,
            images: [cover],
          },
        }
      : {}),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const others = (await getRecentNews(5))
    .filter((item) => item.slug !== news.slug)
    .slice(0, 4);
  const gallery = (news.images ?? [])
    .map((path) => newsAssetUrl(path))
    .filter((src): src is string => Boolean(src));
  const paragraphs = (news.content ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const byline = newsBylineParts({
    author: news.author,
    publisher: news.publisher,
    publishedAt: news.publishedAt,
  });

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 pt-24 pb-24 md:pt-28">
        <Container>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12 lg:gap-x-12">
            {/*
              Baris pertama: judul, penulis, dan dokumentasi. Blok ini memakai
              lebar kolom berita (8/12) supaya gambar dokumentasi mentok penuh
              selebar kolom, dan "Berita Lainnya" di kanan baru mulai sejajar
              dengan isi berita pada baris kedua.
            */}
            <header className="lg:col-span-8 lg:row-start-1">
              <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight text-slate-900 md:text-[2.25rem] lg:text-[2.5rem]">
                {news.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {byline.author}
                </span>
                {byline.publisher ? (
                  <span>
                    <span aria-hidden="true">- </span>
                    <span className="font-medium text-genbi-blue">
                      {byline.publisher}
                    </span>
                  </span>
                ) : null}
                {byline.dateLabel ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{byline.dateLabel}</span>
                  </>
                ) : null}
              </div>

              <NewsGalleryCarousel images={gallery} title={news.title} />
            </header>

            {/* Baris kedua: isi berita, sejajar dengan "Berita Lainnya". */}
            <div className="lg:col-span-8 lg:row-start-2">
              {/* Tanpa animasi masuk: isi berita langsung tampil utuh. */}
              <div className="max-w-[68ch] space-y-6 text-[1.0625rem] leading-[1.8] text-slate-700">
                {isSafeRichContent(news.content ?? "") ? (
                  <div
                    className="[&_a]:text-genbi-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-genbi-haze [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />
                ) : paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => {
                    const dateline =
                      index === 0 ? paragraph.match(DATELINE) : null;
                    if (dateline) {
                      return (
                        <p key={paragraph.slice(0, 40)}>
                          <strong className="font-semibold text-slate-900">
                            {dateline[1]}
                          </strong>
                          {dateline[2]}
                          {renderInline(dateline[3])}
                        </p>
                      );
                    }
                    return (
                      <p key={paragraph.slice(0, 40)}>
                        {renderInline(paragraph)}
                      </p>
                    );
                  })
                ) : (
                  <p className="italic text-slate-500">Belum ada konten.</p>
                )}
              </div>
            </div>

            {/* Sidebar: berita lainnya, gambar + penerbit + judul. */}
            {others.length > 0 && (
              <aside className="lg:col-span-4 lg:row-start-2">
                <div className="lg:sticky lg:top-28">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Berita Lainnya
                  </h2>
                  <div className="mt-2 divide-y divide-genbi-line">
                    {others.map((item) => {
                      const cover = imageUrl(item);
                      return (
                        <Link
                          key={item.id}
                          href={`/news/${item.slug}`}
                          className="group block py-6"
                        >
                          {cover && (
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-media bg-genbi-light">
                              <Image
                                src={cover}
                                alt={item.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 380px"
                                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                              />
                            </div>
                          )}
                          <div className="mt-3">
                            {item.publisher ? (
                              <p className="text-xs font-semibold text-genbi-blue">
                                {item.publisher}
                              </p>
                            ) : null}
                            <h3 className="mt-1 text-base font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-genbi-blue">
                              {item.title}
                            </h3>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href="/news"
                    className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-genbi-blue px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-genbi-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/60"
                  >
                    Lihat Semua Berita
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
