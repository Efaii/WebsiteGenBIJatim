import type { Metadata } from "next";

/**
 * Metadata segmen `/commissariat`.
 *
 * Ditulis di layout supaya berlaku untuk semua rute di bawah segmen ini;
 * halaman detail `/commissariat/[slug]` punya `generateMetadata` sendiri yang
 * menang.
 */
export const metadata: Metadata = {
  title: "Komisariat GenBI Jawa Timur",
  description:
    "Ringkasan sembilan komisariat GenBI di Jawa Timur beserta jumlah anggota dan program kerjanya.",
  openGraph: {
    title: "Komisariat GenBI Jawa Timur",
    description:
      "Ringkasan sembilan komisariat GenBI di Jawa Timur beserta jumlah anggota dan program kerjanya.",
  },
};

export default function CommissariatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
