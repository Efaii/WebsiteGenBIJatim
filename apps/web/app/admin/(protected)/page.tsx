import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cmsApiGet } from "@/lib/cms-api";
import { getCmsPageSession } from "@/lib/cms-guard";
import type { CmsOverview } from "@/lib/services/cms-overview.service";
import {
  BarList,
  ChartPanel,
  DonutChart,
  StatCard,
  TrendArea,
} from "./DashboardCharts";
import { NEWS_STATUS_LABEL } from "./berita/status";
import { PROGRAM_STATUS_LABEL } from "./proker/status";
import { PANEL } from "../ui";

export const metadata = { title: "Dashboard" };

const ROLE_DESCRIPTIONS: Record<CmsOverview["role"], string> = {
  ADMIN_GLOBAL:
    "Pantau data Awardee, Program Kerja, dan Berita, lalu tangani permintaan persetujuan dari satu halaman.",
  SEKRETARIS_UMUM:
    "Angka di bawah mencakup komisariat dan periode akun Anda: Awardee, Program Kerja, dan Berita.",
  SEKRETARIS_DIVISI:
    "Angka di bawah mencakup divisi, komisariat, dan periode akun Anda: Program Kerja dan Berita.",
};

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: "#10b981",
  SUBMITTED: "#f59e0b",
  APPROVED: "#1e63ff",
  DRAFT: "#94a3b8",
  REJECTED: "#ef4444",
  ARCHIVED: "#cbd5e1",
};

/**
 * Dashboard area admin: data Awardee, Program Kerja, dan Berita
 * plus antrean persetujuan untuk admin global.
 *
 * Seluruh angka dibaca dari `GET /v1/overview` (API kanonik, role-aware);
 * chart memakai SVG/CSS murni sehingga tetap ringan. Bila API tidak menjawab,
 * halaman menampilkan panel informasi tanpa angka.
 */
export default async function AdminHomePage() {
  await getCmsPageSession();
  const overview = await cmsApiGet<CmsOverview>("/v1/overview");

  if (!overview) {
    return (
      <section
        className={`${PANEL} p-6 text-sm leading-relaxed text-slate-600`}
      >
        Dashboard tidak dapat dimuat dari API. Pastikan server API berjalan,
        lalu muat ulang halaman.
      </section>
    );
  }

  const {
    cards,
    approvals,
    awardeeChart,
    programByStatus,
    newsByStatus,
    newsMonthly,
  } = overview;
  const isAdmin = overview.role === "ADMIN_GLOBAL";

  const programChartItems = programByStatus.map((entry) => ({
    label: PROGRAM_STATUS_LABEL[entry.status] ?? entry.status,
    value: entry.value,
    color: STATUS_COLOR[entry.status] ?? "#1e63ff",
  }));
  const newsChartItems = newsByStatus.map((entry) => ({
    label: NEWS_STATUS_LABEL[entry.status] ?? entry.status,
    value: entry.value,
    color: STATUS_COLOR[entry.status] ?? "#1e63ff",
  }));

  const approvalRows = approvals
    ? [
        {
          label: "Berita menunggu persetujuan",
          count: approvals.news,
          href: "/admin/persetujuan/berita",
        },
        {
          label: "Program Kerja menunggu persetujuan",
          count: approvals.program,
          href: "/admin/persetujuan/program-kerja",
        },
        {
          label: "Awardee menunggu persetujuan",
          count: approvals.awardee,
          href: "/admin/persetujuan/awardee",
        },
        {
          label: "Batch impor Awardee menunggu persetujuan",
          count: approvals.imports,
          href: "/admin/persetujuan/awardee",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          {ROLE_DESCRIPTIONS[overview.role]}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.awardee ? (
          <StatCard
            label="Awardee"
            value={cards.awardee.total}
            hint={`${cards.awardee.published ?? 0} terbit di halaman publik`}
            href={isAdmin ? "/admin/persetujuan/awardee" : "/admin/awardee"}
          />
        ) : null}
        <StatCard
          label="Program Kerja"
          value={cards.program.total}
          hint={`${cards.program.published} terbit`}
          href="/admin/proker/lintas"
        />
        <StatCard
          label="Berita"
          value={cards.news.total}
          hint={`${cards.news.published} terbit`}
          href="/admin/berita"
        />
        <StatCard
          label={isAdmin ? "Menunggu persetujuan" : "Diajukan ke admin"}
          value={cards.pendingTitles}
          hint={
            isAdmin
              ? "Berita, Program Kerja, Awardee, dan batch impor"
              : "Menunggu tinjauan admin global"
          }
          href={isAdmin ? "/admin/persetujuan/berita" : undefined}
        />
      </section>

      <section
        className={`grid gap-4 ${
          awardeeChart ? "xl:grid-cols-3" : "xl:grid-cols-2"
        }`}
      >
        {awardeeChart ? (
          <ChartPanel
            title={
              isAdmin
                ? "Awardee terbit per komisariat"
                : "Awardee terbit per divisi"
            }
            description="Jumlah Awardee berstatus terbit yang tampil di halaman publik."
          >
            <BarList items={awardeeChart} />
          </ChartPanel>
        ) : null}
        <ChartPanel
          title="Program Kerja per status"
          description="Sebaran status publikasi Program Kerja pada scope akun."
        >
          <DonutChart items={programChartItems} centerLabel="Program" />
        </ChartPanel>
        <ChartPanel
          title="Berita per status"
          description="Sebaran status publikasi Berita pada scope akun."
        >
          <DonutChart items={newsChartItems} centerLabel="Berita" />
        </ChartPanel>
      </section>

      <ChartPanel
        title="Berita terbit enam bulan terakhir"
        description="Jumlah Berita yang resmi terbit setiap bulan."
      >
        <TrendArea items={newsMonthly} ariaLabel="Berita terbit per bulan" />
      </ChartPanel>

      {approvals ? (
        <section className={`${PANEL} overflow-hidden`}>
          <h2 className="border-b border-genbi-line px-6 py-4 text-sm font-semibold text-slate-900">
            Permintaan persetujuan
          </h2>
          <ul className="divide-y divide-genbi-line">
            {approvalRows.map((row) => (
              <li key={row.label}>
                <Link
                  href={row.href}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors duration-200 hover:bg-genbi-soft"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-700">
                    {row.label}
                  </span>
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums ${
                      row.count > 0
                        ? "bg-genbi-blue text-white"
                        : "bg-genbi-soft text-slate-500"
                    }`}
                  >
                    {row.count}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-genbi-blue"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
