import type { Metadata } from "next";
import {
  getCommissariatBySlug,
  getAllCommissariats,
} from "@/lib/services/commissariat.service";
import CommissariatClient from "./CommissariatClient";
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commissariat = await getCommissariatBySlug(slug);

  if (!commissariat) {
    notFound();
  }

  return <CommissariatClient initialData={commissariat} />;
}
