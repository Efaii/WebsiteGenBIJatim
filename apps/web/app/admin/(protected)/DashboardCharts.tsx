import Link from "next/link";

/*
 * Komponen dashboard Ringkasan: kartu angka, bilah horizontal, donat, dan
 * tren bulanan. Semuanya SVG/CSS murni tanpa pustaka chart supaya bundle
 * tetap kecil dan warna mengikuti token admin (`genbi-*` plus warna semantik
 * status). Statis tanpa animasi, sesuai dial MOTION 2.
 */

export type ChartEntry = {
  label: string;
  value: number;
  className?: string;
};

const pct = (value: number, max: number) =>
  max <= 0 ? 0 : Math.round((value / max) * 100);

/** Kartu angka dengan tautan opsional. */
export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | null;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
        {value ?? "-"}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </>
  );
  const className =
    "block rounded-card border border-genbi-line bg-white p-5 shadow-[0_18px_44px_-30px_rgba(16,42,92,0.35)]";
  return href ? (
    <Link
      href={href}
      className={`${className} transition-colors duration-200 hover:border-genbi-haze hover:bg-genbi-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genbi-blue/50`}
    >
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/** Panel chart dengan judul dan catatan kaki opsional. */
export function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-genbi-line bg-white p-5 shadow-[0_18px_44px_-30px_rgba(16,42,92,0.35)]">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Bilah horizontal berlabel (mis. Awardee per komisariat). */
export function BarList({
  items,
  fillClassName = "bg-genbi-blue",
}: {
  items: ChartEntry[];
  fillClassName?: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-slate-500">Belum ada data.</p>;
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-slate-700">
              {item.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">
              {item.value}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-genbi-soft">
            <div
              className={`h-full rounded-full ${item.className ?? fillClassName}`}
              style={{ width: `${pct(item.value, max)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donat status dengan legenda; warna hex dari pemanggil. */
export function DonutChart({
  items,
  centerLabel,
}: {
  items: Array<{ label: string; value: number; color: string }>;
  centerLabel: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0)
    return <p className="text-sm text-slate-500">Belum ada data.</p>;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => {
    const fraction = item.value / total;
    const before =
      items.slice(0, index).reduce((sum, previous) => sum + previous.value, 0) /
      total;
    return {
      ...item,
      dash: `${fraction * circumference} ${circumference}`,
      offset: -(before * circumference),
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg
        viewBox="0 0 120 120"
        className="h-32 w-32 shrink-0"
        role="img"
        aria-label={`${centerLabel}: ${items
          .map((item) => `${item.label} ${item.value}`)
          .join(", ")}`}
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="14"
          className="stroke-genbi-soft"
        />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="14"
            stroke={segment.color}
            strokeDasharray={segment.dash}
            strokeDashoffset={segment.offset}
            transform="rotate(-90 60 60)"
          />
        ))}
        <text
          x="60"
          y="57"
          textAnchor="middle"
          className="fill-slate-900 text-[20px] font-bold"
        >
          {total}
        </text>
        <text
          x="60"
          y="73"
          textAnchor="middle"
          className="fill-slate-500 text-[9px] font-semibold uppercase tracking-wider"
        >
          {centerLabel}
        </text>
      </svg>
      <ul className="min-w-[140px] flex-1 space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="flex-1 truncate text-slate-600">{item.label}</span>
            <span className="font-semibold tabular-nums text-slate-900">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tren batang sederhana per bulan (mis. berita terbit 6 bulan terakhir). */
export function TrendBars({
  items,
  ariaLabel,
}: {
  items: Array<{ label: string; value: number }>;
  ariaLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div>
      <div
        className="flex h-28 items-end gap-2"
        role="img"
        aria-label={`${ariaLabel}: ${items
          .map((item) => `${item.label} ${item.value}`)
          .join(", ")}`}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[11px] font-semibold tabular-nums text-slate-700">
              {item.value > 0 ? item.value : ""}
            </span>
            <div
              className="w-full rounded-t-thumb bg-genbi-blue/85"
              style={{
                height: `${Math.max(pct(item.value, max), item.value > 0 ? 6 : 2)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2 border-t border-genbi-line pt-1.5">
        {items.map((item) => (
          <span
            key={item.label}
            className="flex-1 text-center text-[11px] font-medium text-slate-500"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
