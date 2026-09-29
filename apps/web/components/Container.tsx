import { cn } from "@/lib/utils";

/**
 * Container halaman.
 *
 * Satu-satunya sumber lebar maksimum dan gutter horizontal untuk section
 * landing: maksimum 1440px dengan gutter 24 / 40 / 64px. Dipakai supaya
 * tepi kiri-kanan semua section baru sejajar, termasuk navbar saat mengambang.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16", className)}>
      {children}
    </div>
  );
}
