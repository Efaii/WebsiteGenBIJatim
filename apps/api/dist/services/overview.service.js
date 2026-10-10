"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverviewData = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const api_error_1 = require("../lib/api-error");
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
const lastSixMonths = () => {
    const now = new Date();
    const months = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        months.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            label: MONTH_LABELS[date.getMonth()],
        });
    }
    return months;
};
const STATUS_ORDER = [
    client_1.PublicationStatus.PUBLISHED,
    client_1.PublicationStatus.SUBMITTED,
    client_1.PublicationStatus.APPROVED,
    client_1.PublicationStatus.DRAFT,
    client_1.PublicationStatus.REJECTED,
    client_1.PublicationStatus.ARCHIVED,
];
const toStatusChart = (groups) => STATUS_ORDER.map((status) => ({
    status,
    value: groups.find((group) => group.publicationStatus === status)?._count._all ??
        0,
})).filter((entry) => entry.value > 0);
/*
 * Baris Divisi bisa ada per periode; kumpulkan semua baris bernama sama di
 * komisariat yang sama supaya scope divisi tetap utuh saat data merentang
 * beberapa periode. Nama divisi ikut dikembalikan karena sebagian data
 * rekonsiliasi hanya menyimpan nama itu di kolom string `divisi` — pola
 * pencocokan yang sama dipakai halaman kanonik Lintas Komisariat.
 */
const resolveDivision = async (commissariatId, divisionId) => {
    if (!divisionId)
        return null;
    const division = await prisma_1.prisma.division.findUnique({
        where: { id: divisionId },
        select: { name: true },
    });
    if (!division)
        return { ids: [divisionId], name: null };
    const rows = await prisma_1.prisma.division.findMany({
        where: { commissariatId, name: division.name },
        select: { id: true },
    });
    return {
        ids: rows.length > 0 ? rows.map((row) => row.id) : [divisionId],
        name: division.name,
    };
};
const getOverviewData = async (actor) => {
    const isAdmin = actor.role === client_1.CmsRole.ADMIN_GLOBAL;
    const assignment = actor.assignment;
    if (!isAdmin && (!assignment?.commissariatId || !assignment.periodId))
        throw new api_error_1.ApiError("FORBIDDEN", "No active CMS assignment.", 403);
    const commissariatId = assignment?.commissariatId ?? null;
    // Berita soft-deleted tidak pernah tampil di daftar kanonik mana pun.
    const newsScope = {
        deletedAt: null,
        ...(isAdmin ? {} : { commissariatId: commissariatId }),
    };
    const membershipScope = isAdmin
        ? {}
        : { commissariatId: commissariatId };
    let programScope = isAdmin
        ? {}
        : { commissariatId: commissariatId };
    if (!isAdmin && actor.role === client_1.CmsRole.SEKRETARIS_DIVISI) {
        const division = await resolveDivision(commissariatId, assignment?.divisionId ?? null);
        if (division) {
            const alternatives = [
                { divisionId: { in: division.ids } },
            ];
            if (division.name)
                alternatives.push({ divisi: { equals: division.name } });
            programScope = { ...programScope, OR: alternatives };
        }
    }
    const awardeeVisible = actor.role !== client_1.CmsRole.SEKRETARIS_DIVISI;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const [awardeeTotal, awardeePublished, awardeeGroups, programGroups, newsGroups, publishedNews, newsPending, programPending, membershipPending, importsPending,] = await Promise.all([
        awardeeVisible
            ? prisma_1.prisma.membership.count({ where: membershipScope })
            : Promise.resolve(null),
        awardeeVisible
            ? prisma_1.prisma.membership.count({
                where: {
                    ...membershipScope,
                    publicationStatus: client_1.PublicationStatus.PUBLISHED,
                },
            })
            : Promise.resolve(null),
        awardeeVisible && isAdmin
            ? prisma_1.prisma.membership.groupBy({
                by: ["commissariatId"],
                where: { publicationStatus: client_1.PublicationStatus.PUBLISHED },
                _count: { _all: true },
            })
            : awardeeVisible && actor.role === client_1.CmsRole.SEKRETARIS_UMUM
                ? prisma_1.prisma.membership.groupBy({
                    by: ["divisionId"],
                    where: {
                        ...membershipScope,
                        publicationStatus: client_1.PublicationStatus.PUBLISHED,
                    },
                    _count: { _all: true },
                })
                : Promise.resolve([]),
        prisma_1.prisma.programKerja.groupBy({
            by: ["publicationStatus"],
            where: programScope,
            _count: { _all: true },
        }),
        prisma_1.prisma.news.groupBy({
            by: ["publicationStatus"],
            where: newsScope,
            _count: { _all: true },
        }),
        prisma_1.prisma.news.findMany({
            where: {
                ...newsScope,
                publicationStatus: client_1.PublicationStatus.PUBLISHED,
                publishedAt: { gte: sixMonthsAgo },
            },
            select: { publishedAt: true },
        }),
        prisma_1.prisma.news.count({
            where: { ...newsScope, publicationStatus: client_1.PublicationStatus.SUBMITTED },
        }),
        prisma_1.prisma.programKerja.count({
            where: {
                ...programScope,
                publicationStatus: client_1.PublicationStatus.SUBMITTED,
            },
        }),
        awardeeVisible
            ? prisma_1.prisma.membership.count({
                where: {
                    ...membershipScope,
                    publicationStatus: client_1.PublicationStatus.SUBMITTED,
                },
            })
            : Promise.resolve(0),
        isAdmin
            ? prisma_1.prisma.membershipImportPreview.count({
                where: { status: "SUBMITTED" },
            })
            : Promise.resolve(0),
    ]);
    // Grafik Awardee: per komisariat (admin) atau per divisi (sekum). Baris
    // divisi digabung per nama supaya rentang lintas periode tetap terbaca.
    let awardeeChart = null;
    if (awardeeVisible && isAdmin) {
        const rows = awardeeGroups;
        const commissariats = await prisma_1.prisma.commissariat.findMany({
            select: { id: true, name: true },
        });
        awardeeChart = rows
            .map((row) => ({
            label: commissariats.find((item) => item.id === row.commissariatId)?.name ??
                "Lainnya",
            value: row._count._all,
        }))
            .sort((left, right) => right.value - left.value);
    }
    else if (awardeeVisible && actor.role === client_1.CmsRole.SEKRETARIS_UMUM) {
        const rows = awardeeGroups;
        const divisions = await prisma_1.prisma.division.findMany({
            where: { commissariatId: commissariatId },
            select: { id: true, name: true },
        });
        const byName = new Map();
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
        value: publishedNews.filter((item) => item.publishedAt &&
            `${item.publishedAt.getFullYear()}-${String(item.publishedAt.getMonth() + 1).padStart(2, "0")}` === month.key).length,
    }));
    const programChart = toStatusChart(programGroups);
    const newsChart = toStatusChart(newsGroups);
    const sum = (entries) => entries.reduce((total, entry) => total + entry.value, 0);
    return {
        role: actor.role,
        scope: isAdmin
            ? null
            : {
                commissariatId: commissariatId,
                periodId: assignment?.periodId ?? null,
                divisionId: assignment?.divisionId ?? null,
            },
        cards: {
            awardee: awardeeVisible
                ? { total: awardeeTotal, published: awardeePublished }
                : null,
            program: {
                total: sum(programChart),
                published: sum(programChart.filter((entry) => entry.status === "PUBLISHED")),
            },
            news: {
                total: sum(newsChart),
                published: sum(newsChart.filter((entry) => entry.status === "PUBLISHED")),
            },
            pendingTitles: newsPending + programPending + membershipPending + importsPending,
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
exports.getOverviewData = getOverviewData;
