import type { Metadata } from "next";
import {
  getCommissariatBySlug,
  getAllCommissariats,
  getCommissariatAwardees,
  getCommissariatStructure,
} from "@/lib/services/commissariat.service";
import { getPublicPeriods, periodFromSlug } from "@/lib/services/period.service";
import CommissariatDetail from "./CommissariatDetail";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCommissariatBySlug(slug);
  if (!data) return { title: "Komisariat Tidak Ditemukan - GenBI Jatim" };
  return {
    title: `${data.name} - GenBI Jatim`,
    description: data.description,
  };
}

export async function generateStaticParams() {
  const commissariats = await getAllCommissariats();
  return commissariats.map((c) => ({
    slug: c.slug,
  }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ periode?: string }>;
}) {
  const { slug } = await params;
  const { periode } = await searchParams;

  const commissariat = await getCommissariatBySlug(slug);
  if (!commissariat) notFound();

  const { periods, defaultPeriod } = await getPublicPeriods();
  const period = (periode && periodFromSlug(periode, periods)) || periods[0] || defaultPeriod;

  const [structure, awardees] = await Promise.all([
    period ? getCommissariatStructure(slug, period) : Promise.resolve(null),
    period ? getCommissariatAwardees(slug, period) : Promise.resolve([]),
  ]);

  return (
    <CommissariatDetail
      data={commissariat}
      periods={periods}
      period={period}
      structure={structure}
      awardees={awardees}
    />
  );
}
