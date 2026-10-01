import Link from "next/link";

/*
 * Komponen dashboard: kartu angka, bilah horizontal, donat, dan tren
 * bulanan. Semuanya SVG/CSS murni tanpa pustaka chart supaya bundle tetap
 * kecil dan warna mengikuti token admin (`genbi-*` plus warna semantik
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
        className="h-52 w-52 shrink-0"
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
            <span className="w-10 text-right tabular-nums text-slate-500">
              {Math.round((item.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tren area/garis per bulan (mis. berita terbit 6 bulan terakhir).
 *
 * Bulan bernilai nol tetap tampil di garis dasar lengkap dengan label
 * bulannya, supaya lubang data tidak menyamar jadi ketiadaan kategori.
 */
export function TrendArea({
  items,
  ariaLabel,
}: {
  items: Array<{ label: string; value: number }>;
  ariaLabel: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-slate-500">Belum ada data.</p>;
  const width = 640;
  const height = 190;
  const padX = 26;
  const padTop = 30;
  const padBottom = 36;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padTop - padBottom;
  const max = Math.max(...items.map((item) => item.value), 1);
  const step = items.length > 1 ? innerWidth / (items.length - 1) : 0;
  const baseY = padTop + innerHeight;
  const points = items.map((item, index) => ({
    ...item,
    x: padX + step * index,
    y: baseY - (item.value / max) * innerHeight,
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L${last.x},${baseY} L${first.x},${baseY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${ariaLabel}: ${items
        .map((item) => `${item.label} ${item.value}`)
        .join(", ")}`}
    >
      <defs>
        <linearGradient id="trend-area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e63ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1e63ff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <line
        x1={padX}
        y1={baseY}
        x2={width - padX}
        y2={baseY}
        className="stroke-genbi-line"
        strokeWidth="1"
      />
      <path d={areaPath} fill="url(#trend-area-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="#1e63ff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point) => (
        <g key={point.label}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#1e63ff"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={point.x}
            y={point.y - 11}
            textAnchor="middle"
            className="fill-slate-700 text-[11px] font-semibold"
          >
            {point.value}
          </text>
          <text
            x={point.x}
            y={height - 12}
            textAnchor="middle"
            className="fill-slate-500 text-[11px] font-medium"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
