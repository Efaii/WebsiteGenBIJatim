import { CmsRole, Prisma, PublicationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";

/*
 * Modul data Dasbor CMS.
 *
 * Satu Interface kecil untuk semua peran — "untuk aktor ini, beri kartu,
 * sebaran status, tren bulanan, dan antrean" — yang menyembunyikan aturan
 * scope per peran, agregasi lintas periode, dan pembentukan bucket bulanan.
 * Controller HTTP tinggal Adapter tipis di atas modul ini; pemanggil dan tes
 * menembak Interface yang sama.
 *
 * Scope data:
 * - admin global: seluruh komisariat, termasuk kanal Berita GenBI Jatim;
 * - sekretaris umum: komisariat akun, SELURUH periode (tanpa pemilih periode);
 * - sekretaris divisi: komisariat + divisi akun, seluruh periode, tanpa Awardee.
 */

export type OverviewAssignment = {
  commissariatId: string | null;
  periodId: string | null;
  divisionId: string | null;
};

export type OverviewActor = {
  role: CmsRole;
  assignment: OverviewAssignment | null;
};

export type OverviewStatusEntry = {
  status: PublicationStatus;
  value: number;
};

export type OverviewPayload = {
  role: CmsRole;
  scope: {
    commissariatId: string;
    periodId: string | null;
    divisionId: string | null;
  } | null;
  cards: {
    awardee: { total: number | null; published: number | null } | null;
    program: { total: number; published: number };
    news: { total: number; published: number };
    pendingTitles: number;
  };
  approvals: {
    news: number;
    program: number;
    awardee: number;
    imports: number;
  } | null;
  awardeeChart: Array<{ label: string; value: number }> | null;
  programByStatus: OverviewStatusEntry[];
  newsByStatus: OverviewStatusEntry[];
  newsMonthly: Array<{ label: string; value: number }>;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const lastSixMonths = (): Array<{ key: string; label: string }> => {
  const now = new Date();
  const months: Array<{ key: string; label: string }> = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: MONTH_LABELS[date.getMonth()],
    });
  }
  return months;
};

const STATUS_ORDER: PublicationStatus[] = [
  PublicationStatus.PUBLISHED,
  PublicationStatus.SUBMITTED,
  PublicationStatus.APPROVED,
  PublicationStatus.DRAFT,
  PublicationStatus.REJECTED,
  PublicationStatus.ARCHIVED,
];

const toStatusChart = (
  groups: Array<{
    publicationStatus: PublicationStatus;
    _count: { _all: number };
  }>,
): OverviewStatusEntry[] =>
  STATUS_ORDER.map((status) => ({
    status,
    value:
      groups.find((group) => group.publicationStatus === status)?._count._all ??
      0,
  })).filter((entry) => entry.value > 0);

/*
 * Baris Divisi bisa ada per periode; kumpulkan semua baris bernama sama di
 * komisariat yang sama supaya scope divisi tetap utuh saat data merentang
 * beberapa periode. Nama divisi ikut dikembalikan karena sebagian data
 * rekonsiliasi hanya menyimpan nama itu di kolom string `divisi` — pola
 * pencocokan yang sama dipakai halaman kanonik Lintas Komisariat.
 */
const resolveDivision = async (
  commissariatId: string,
  divisionId: string | null,
): Promise<{ ids: string[]; name: string | null } | null> => {
  if (!divisionId) return null;
  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { name: true },
  });
  if (!division) return { ids: [divisionId], name: null };
  const rows = await prisma.division.findMany({
    where: { commissariatId, name: division.name },
    select: { id: true },
  });
  return {
    ids: rows.length > 0 ? rows.map((row) => row.id) : [divisionId],
    name: division.name,
  };
};

export const getOverviewData = async (
  actor: OverviewActor,
): Promise<OverviewPayload> => {
  const isAdmin = actor.role === CmsRole.ADMIN_GLOBAL;
  const assignment = actor.assignment;
  if (!isAdmin && (!assignment?.commissariatId || !assignment.periodId))
    throw new ApiError("FORBIDDEN", "No active CMS assignment.", 403);

  const commissariatId = assignment?.commissariatId ?? null;

  // Berita soft-deleted tidak pernah tampil di daftar kanonik mana pun.
  const newsScope: Prisma.NewsWhereInput = {
    deletedAt: null,
    ...(isAdmin ? {} : { commissariatId: commissariatId as string }),
  };
  const membershipScope: Prisma.MembershipWhereInput = isAdmin
    ? {}
    : { commissariatId: commissariatId as string };
  let programScope: Prisma.ProgramKerjaWhereInput = isAdmin
    ? {}
    : { commissariatId: commissariatId as string };
  if (!isAdmin && actor.role === CmsRole.SEKRETARIS_DIVISI) {
    const division = await resolveDivision(
      commissariatId as string,
      assignment?.divisionId ?? null,
    );
    if (division) {
      const alternatives: Prisma.ProgramKerjaWhereInput[] = [
        { divisionId: { in: division.ids } },
      ];
      if (division.name)
        alternatives.push({ divisi: { equals: division.name } });
      programScope = { ...programScope, OR: alternatives };
    }
  }
  const awardeeVisible = actor.role !== CmsRole.SEKRETARIS_DIVISI;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    awardeeTotal,
    awardeePublished,
    awardeeGroups,
    programGroups,
    newsGroups,
    publishedNews,
    newsPending,
    programPending,
    membershipPending,
    importsPending,
  ] = await Promise.all([
    awardeeVisible
      ? prisma.membership.count({ where: membershipScope })
      : Promise.resolve(null),
    awardeeVisible
      ? prisma.membership.count({
          where: {
            ...membershipScope,
            publicationStatus: PublicationStatus.PUBLISHED,
          },
        })
      : Promise.resolve(null),
    awardeeVisible && isAdmin
      ? prisma.membership.groupBy({
          by: ["commissariatId"],
          where: { publicationStatus: PublicationStatus.PUBLISHED },
          _count: { _all: true },
        })
      : awardeeVisible && actor.role === CmsRole.SEKRETARIS_UMUM
        ? prisma.membership.groupBy({
            by: ["divisionId"],
            where: {
              ...membershipScope,
              publicationStatus: PublicationStatus.PUBLISHED,
            },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    prisma.programKerja.groupBy({
      by: ["publicationStatus"],
      where: programScope,
      _count: { _all: true },
    }),
    prisma.news.groupBy({
      by: ["publicationStatus"],
      where: newsScope,
      _count: { _all: true },
    }),
    prisma.news.findMany({
      where: {
        ...newsScope,
        publicationStatus: PublicationStatus.PUBLISHED,
        publishedAt: { gte: sixMonthsAgo },
      },
      select: { publishedAt: true },
    }),
    prisma.news.count({
      where: { ...newsScope, publicationStatus: PublicationStatus.SUBMITTED },
    }),
    prisma.programKerja.count({
      where: {
        ...programScope,
        publicationStatus: PublicationStatus.SUBMITTED,
      },
    }),
    awardeeVisible
      ? prisma.membership.count({
          where: {
            ...membershipScope,
            publicationStatus: PublicationStatus.SUBMITTED,
          },
        })
      : Promise.resolve(0),
    isAdmin
      ? prisma.membershipImportPreview.count({
          where: { status: "SUBMITTED" },
        })
      : Promise.resolve(0),
  ]);

  // Grafik Awardee: per komisariat (admin) atau per divisi (sekum). Baris
  // divisi digabung per nama supaya rentang lintas periode tetap terbaca.
  let awardeeChart: Array<{ label: string; value: number }> | null = null;
  if (awardeeVisible && isAdmin) {
    const rows = awardeeGroups as Array<{
      commissariatId: string;
      _count: { _all: number };
    }>;
    const commissariats = await prisma.commissariat.findMany({
      select: { id: true, name: true },
    });
    awardeeChart = rows
      .map((row) => ({
        label:
          commissariats.find((item) => item.id === row.commissariatId)?.name ??
          "Lainnya",
        value: row._count._all,
      }))
      .sort((left, right) => right.value - left.value);
  } else if (awardeeVisible && actor.role === CmsRole.SEKRETARIS_UMUM) {
    const rows = awardeeGroups as Array<{
      divisionId: string | null;
      _count: { _all: number };
    }>;
    const divisions = await prisma.division.findMany({
      where: { commissariatId: commissariatId as string },
      select: { id: true, name: true },
    });
    const byName = new Map<string, number>();
    for (const row of rows) {
      const label = row.divisionId
        ? (divisions.find((item) => item.id === row.divisionId)?.name ??
          "Divisi")
        : "Tanpa divisi";
      byName.set(label, (byName.get(label) ?? 0) + row._count._all);
    }
    awardeeChart = [...byName.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value);
  }

  const months = lastSixMonths();
  const newsMonthly = months.map((month) => ({
    label: month.label,
    value: publishedNews.filter(
      (item) =>
        item.publishedAt &&
        `${item.publishedAt.getFullYear()}-${String(
          item.publishedAt.getMonth() + 1,
        ).padStart(2, "0")}` === month.key,
    ).length,
  }));

  const programChart = toStatusChart(programGroups);
  const newsChart = toStatusChart(newsGroups);
  const sum = (entries: Array<{ value: number }>) =>
    entries.reduce((total, entry) => total + entry.value, 0);

  return {
    role: actor.role,
    scope: isAdmin
      ? null
      : {
          commissariatId: commissariatId as string,
          periodId: assignment?.periodId ?? null,
          divisionId: assignment?.divisionId ?? null,
        },
    cards: {
      awardee: awardeeVisible
        ? { total: awardeeTotal, published: awardeePublished }
        : null,
      program: {
        total: sum(programChart),
        published: sum(
          programChart.filter((entry) => entry.status === "PUBLISHED"),
        ),
      },
      news: {
        total: sum(newsChart),
        published: sum(
          newsChart.filter((entry) => entry.status === "PUBLISHED"),
        ),
      },
      pendingTitles:
        newsPending + programPending + membershipPending + importsPending,
    },
    approvals: isAdmin
      ? {
          news: newsPending,
          program: programPending,
          awardee: membershipPending,
          imports: importsPending,
        }
      : null,
    awardeeChart,
    programByStatus: programChart,
    newsByStatus: newsChart,
    newsMonthly,
  };
};
