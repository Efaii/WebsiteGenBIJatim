import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Kerangka metadata area admin.
 *
 * Halaman admin tidak boleh masuk indeks mesin pencari: satu deklarasi
 * `robots` di layout menutup seluruh turunannya (login dan halaman terproteksi).
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin GenBI Jatim" },
  description: "Panel pengelolaan konten GenBI Jawa Timur.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
