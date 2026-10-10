import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Tombol filter pill dengan keadaan aktif yang jelas. */
export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50 focus-visible:ring-offset-1",
        active
          ? "border-genbi-blue bg-genbi-blue text-white shadow-sm"
          : "border-genbi-line bg-white text-slate-600 hover:border-genbi-bright hover:text-genbi-blue",
      )}
    >
      {children}
    </button>
  );
}

/** Angka jumlah di dalam chip filter. */
export function FilterChipCount({
  active,
  value,
}: {
  active: boolean;
  value: number;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums",
        active ? "bg-white/25 text-white" : "bg-genbi-light text-genbi-ink",
      )}
    >
      {value}
    </span>
  );
}
