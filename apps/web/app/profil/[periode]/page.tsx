import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfilView from "../ProfilView";
import { getPublicPeriods, periodFromSlug } from "@/lib/services/period.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ periode: string }>;
}): Promise<Metadata> {
  const { periode } = await params;
  const label = periode.replace("-", "/");
  return {
    title: `Profil GenBI Jatim ${label}`,
    description: `Profil, visi, misi, nilai, dan pilar GenBI Jawa Timur pada periode kepengurusan ${label}.`,
    openGraph: {
      title: `Profil GenBI Jatim ${label}`,
      description: `Profil, visi, misi, nilai, dan pilar GenBI Jawa Timur pada periode kepengurusan ${label}.`,
    },
  };
}

export default async function ProfilPeriodPage({ params }: { params: Promise<{ periode: string }> }) {
  const { periode } = await params;
  const { periods } = await getPublicPeriods();
  const period = periodFromSlug(periode, periods);
  if (!period) notFound();

  return <ProfilView period={period} />;
}
