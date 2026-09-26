import { notFound } from "next/navigation";
import ProfilView from "../ProfilView";
import { getPublicPeriods, periodFromSlug } from "@/lib/services/period.service";

export default async function ProfilPeriodPage({ params }: { params: Promise<{ periode: string }> }) {
  const { periode } = await params;
  const { periods } = await getPublicPeriods();
  const period = periodFromSlug(periode, periods);
  if (!period) notFound();

  return <ProfilView period={period} />;
}
