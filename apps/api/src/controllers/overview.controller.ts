import { CmsRole, PublicationStatus } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";

/*
 * Angka ringkasan untuk dashboard admin, dipisah per peran:
 * - admin global: lintas komisariat, lengkap dengan antrean persetujuan;
 * - sekretaris umum: scope komisariat dan periode akun, Awardee per divisi;
 * - sekretaris divisi: scope komisariat, periode, dan divisi akun.
 *
 * Semua angka dibaca langsung dari tabel kanonik yang sama dengan halaman
 * lainnya supaya dashboard tidak pernah menyimpang dari daftar aslinya.
 */

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
) =>
  STATUS_ORDER.map((status) => ({
    status,
    value:
      groups.find((group) => group.publicationStatus === status)?._count._all ??
      0,
  })).filter((entry) => entry.value > 0);

export const getOverview = async (req: CmsRequest, res: Response) => {
  const role = req.cmsSession!.cmsAccount.role;
  const assignment = req.cmsSession!.cmsAccount.assignments[0] ?? null;
  const isAdmin = role === CmsRole.ADMIN_GLOBAL;
  if (!isAdmin && (!assignment?.commissariatId || !assignment.periodId))
    throw new ApiError("FORBIDDEN", "No active CMS assignment.", 403);

  const newsScope = isAdmin
    ? {}
    : { commissariatId: assignment!.commissariatId as string };
  const membershipScope = isAdmin
    ? {}
    : {
        commissariatId: assignment!.commissariatId as string,
        periodId: assignment!.periodId as string,
      };
  const programScope = isAdmin
    ? {}
    : {
        commissariatId: assignment!.commissariatId as string,
        periodId: assignment!.periodId as string,
        ...(role === CmsRole.SEKRETARIS_DIVISI && assignment!.divisionId
          ? { divisionId: assignment!.divisionId }
          : {}),
      };
  const awardeeVisible = role !== CmsRole.SEKRETARIS_DIVISI;

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
      : awardeeVisible && role === CmsRole.SEKRETARIS_UMUM
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

  // Label untuk grafik Awardee: per komisariat (admin) atau per divisi (sekum).
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
  } else if (awardeeVisible && role === CmsRole.SEKRETARIS_UMUM) {
    const rows = awardeeGroups as Array<{
      divisionId: string | null;
      _count: { _all: number };
    }>;
    const divisions = await prisma.division.findMany({
      where: {
        commissariatId: assignment!.commissariatId as string,
        periodId: assignment!.periodId as string,
      },
      select: { id: true, name: true },
    });
    awardeeChart = rows.map((row) => ({
      label: row.divisionId
        ? (divisions.find((item) => item.id === row.divisionId)?.name ??
          "Divisi")
        : "Tanpa divisi",
      value: row._count._all,
    }));
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

  return sendSuccess(res, {
    role,
    scope: isAdmin
      ? null
      : {
          commissariatId: assignment!.commissariatId,
          periodId: assignment!.periodId,
          divisionId: assignment!.divisionId,
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
  });
};
