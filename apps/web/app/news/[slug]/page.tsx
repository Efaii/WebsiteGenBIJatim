import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/Button";
import { FadeIn, SlideUp } from "@/components/MotionWrapper";
import { getNewsBySlug, getRecentNews, newsAssetUrl } from "@/lib/services/news.service";

const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const related = (await getRecentNews(4)).filter((item) => item.slug !== news.slug).slice(0, 3);
  const cover = newsAssetUrl(news.coverImage);
  const paragraphs = (news.content ?? "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const publishedLabel = formatDate(news.publishedAt);

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-cyan-500 selection:text-white bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob optimize-gpu"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 optimize-gpu"></div>

      <Navbar />

      <main className="flex-1 pt-24 pb-20 relative">
        {/* Article Header */}
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden flex items-end">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-screen optimize-gpu"></div>

          <div className="absolute inset-0 z-0 bg-[#0f1016]">
            {cover && (
              <Image src={cover} alt={news.title} fill unoptimized className="object-cover brightness-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1016] via-[#0f1016]/50 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10 pb-12">
            <div className="max-w-4xl">
              <FadeIn>
                <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-full shadow-sm uppercase tracking-wider mb-4 inline-block">
                  {news.category ?? "Berita"}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {news.title}
                </h1>
                <div className="flex items-center gap-4 text-blue-200/60 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs text-cyan-300 font-bold">
                      A
                    </span>
                    {news.byline || "GenBI Jatim"}
                  </span>
                  {publishedLabel && (
                    <>
                      <span>•</span>
                      <span>{publishedLabel}</span>
                    </>
                  )}
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
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={index} className={index === 0 ? "font-medium text-white text-xl" : undefined}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="italic text-blue-200/60">Belum ada konten.</p>
                )}
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
            {related.length > 0 && (
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-blue-950/20 border border-white/10 rounded-2xl p-6 sticky top-24">
                  <h4 className="text-lg font-bold text-white mb-4">Berita Terkait</h4>
                  <ul className="space-y-4">
                    {related.map((item) => (
                      <li key={item.id} className="group">
                        <Link href={`/news/${item.slug}`} className="block">
                          <h5 className="text-blue-100 group-hover:text-cyan-400 transition-colors text-sm font-medium mb-1">
                            {item.title}
                          </h5>
                          {formatDate(item.publishedAt) && (
                            <span className="text-xs text-blue-500/60">{formatDate(item.publishedAt)}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
