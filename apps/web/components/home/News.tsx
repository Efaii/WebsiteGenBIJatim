"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn, StaggerContainer } from "@/components/MotionWrapper";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { AdminNewsItem } from "@/services/news.service";

export function News({ initialNews }: { initialNews: AdminNewsItem[] }) {
  const newsItems = (initialNews || []).slice(0, 3);

  const getImageUrl = (url: string) =>
    url.startsWith("/uploads") ? `http://localhost:5000${url}` : url;

  const formatMonth = (item: AdminNewsItem) =>
    new Date(item.createdAt).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

  const getExcerpt = (item: AdminNewsItem) =>
    item.content.length > 155 ? `${item.content.slice(0, 155)}...` : item.content;

  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-329">
        <FadeIn className="mb-12 flex items-center justify-between gap-6" amount={0.2}>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-blue-700 md:text-[34px]">
            Berita Kegiatan
          </h2>
          <Link
            href="/news"
            className="group flex shrink-0 items-center gap-3 rounded-full bg-blue-700 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(30,64,175,0.18)] transition-all hover:bg-blue-800 hover:shadow-[0_10px_24px_rgba(30,64,175,0.26)]"
          >
            Lainnya
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </FadeIn>

        {newsItems.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 gap-6 lg:grid-cols-3" staggerDelay={0.12} amount={0.15}>
            {newsItems.map((news) => {
              const galleryImages: Array<string | null> = [news.image, null, null, null];

              return (
                <FadeIn key={news.id} className="min-w-0" delay={0.1} amount={0.15}>
                  <Link
                    href={`/news/${news.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.1)]"
                  >
                    <div className="relative aspect-[1.95/1] overflow-hidden">
                      <Image
                        src={getImageUrl(news.image)}
                        alt={news.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3 px-5 pt-5">
                      {galleryImages.map((image, index) => (
                        <div key={`${news.id}-${index}`} className="relative aspect-square min-w-0 overflow-hidden rounded-lg bg-slate-100">
                          {image && (
                            <Image
                              src={getImageUrl(image)}
                              alt=""
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="px-5 pb-6 pt-7">
                      <h3 className="line-clamp-1 text-xl font-extrabold leading-tight text-slate-950 transition-colors group-hover:text-blue-700">
                        {news.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          {formatMonth(news)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-600" />
                          {news.author || "GenBI Jawa Timur"}
                        </span>
                      </div>
                      <p className="mt-5 line-clamp-3 text-[15px] leading-7 text-slate-800">
                        {getExcerpt(news)}
                      </p>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </StaggerContainer>
        ) : (
          <FadeIn amount={0.2}>
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
              <p className="text-lg font-semibold text-slate-600 md:text-xl">
                Nantikan Berita menarik dari Kami
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}