import { MembershipStatus, PublicationStatus } from "@prisma/client";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/api-error";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { sendSuccess } from "../middlewares/request-context.middleware";
import { assertScopeAccess } from "../services/cms-scope.service";

/*
 * Manajemen Awardee (Membership) untuk sekretaris umum: daftar per scope,
 * tambah/ubah entri manual, dan pengajuan perubahan.
 *
 * Perubahan yang diajukan masuk status SUBMITTED; approval admin global dan
 * tampil publik setelah disetujui dijalankan lewat halaman Persetujuan
 * Awardee. Semantik status mengikuti alur impor batch yang sudah ada: entri
 * yang berubah menjadi DRAFT sampai diajukan, dan baru terbit setelah
 * disetujui.
 */

const scopeOf = (req: CmsRequest) => {
  const assignment = req.cmsSession!.cmsAccount.assignments[0];
  if (!assignment?.commissariatId || !assignment.periodId)
    throw new ApiError("FORBIDDEN", "No active CMS assignment.", 403);
  return {
    commissariatId: assignment.commissariatId,
    periodId: assignment.periodId,
  };
};

const normalizeText = (value: unknown, field: string, max = 191): string => {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > max)
    throw new ApiError("VALIDATION_ERROR", `${field} tidak valid.`, 400);
  return text;
};

const parseMembershipFields = async (
  req: CmsRequest,
  scope: { commissariatId: string; periodId: string },
) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const name = normalizeText(body.name, "name");
  const position = normalizeText(body.position, "position");
  const studyProgram = normalizeText(body.studyProgram, "studyProgram");

  let divisionId: string | null = null;
  if (
    body.divisionId !== undefined &&
    body.divisionId !== null &&
    body.divisionId !== ""
  ) {
    if (typeof body.divisionId !== "string")
      throw new ApiError("VALIDATION_ERROR", "divisionId tidak valid.", 400);
    const division = await prisma.division.findFirst({
      where: {
        id: body.divisionId,
        commissariatId: scope.commissariatId,
        periodId: scope.periodId,
      },
      select: { id: true },
    });
    if (!division)
      throw new ApiError(
        "VALIDATION_ERROR",
        "Divisi tidak termasuk scope akun.",
        400,
      );
    divisionId = division.id;
  }

  const membershipStatus =
    body.membershipStatus === undefined
      ? MembershipStatus.ACTIVE
      : body.membershipStatus;
  if (
    membershipStatus !== MembershipStatus.ACTIVE &&
    membershipStatus !== MembershipStatus.INACTIVE
  )
    throw new ApiError(
      "VALIDATION_ERROR",
      "membershipStatus tidak valid.",
      400,
    );

  return { name, position, studyProgram, divisionId, membershipStatus };
};

export const listCmsMemberships = async (req: CmsRequest, res: Response) => {
  const role = req.cmsSession!.cmsAccount.role;
  const where: {
    commissariatId?: string;
    periodId?: string;
    publicationStatus?: PublicationStatus;
  } = {};

  if (role === "SEKRETARIS_UMUM") {
    const scope = scopeOf(req);
    where.commissariatId = scope.commissariatId;
    where.periodId = scope.periodId;
  } else {
    if (
      typeof req.query.commissariatId === "string" &&
      req.query.commissariatId
    )
      where.commissariatId = req.query.commissariatId;
    if (typeof req.query.periodId === "string" && req.query.periodId)
      where.periodId = req.query.periodId;
    if (
      typeof req.query.status === "string" &&
      Object.values(PublicationStatus).includes(
        req.query.status as PublicationStatus,
      )
    )
      where.publicationStatus = req.query.status as PublicationStatus;
  }

  const items = await prisma.membership.findMany({
    where,
    include: {
      division: { select: { name: true } },
      period: { select: { label: true } },
      commissariat: { select: { name: true } },
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  return sendSuccess(res, items);
};

export const getMembershipCmsOptions = async (
  req: CmsRequest,
  res: Response,
) => {
  const role = req.cmsSession!.cmsAccount.role;

  if (role === "ADMIN_GLOBAL") {
    const commissariatId =
      typeof req.query.commissariatId === "string"
        ? req.query.commissariatId
        : "";
    const periodId =
      typeof req.query.periodId === "string" ? req.query.periodId : "";
    if (commissariatId && periodId) {
      const [commissariat, period] = await Promise.all([
        prisma.commissariat.findUnique({
          where: { id: commissariatId },
          select: { id: true, name: true },
        }),
        prisma.period.findFirst({
          where: { id: periodId, commissariatId },
          select: { id: true, label: true },
        }),
      ]);
      if (!commissariat || !period)
        throw new ApiError("VALIDATION_ERROR", "Scope tidak valid.", 400);
      const divisions = await prisma.division.findMany({
        where: { commissariatId, periodId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
      return sendSuccess(res, {
        period,
        commissariat,
        divisions,
        periods: [],
      });
    }
    const periods = await prisma.period.findMany({
      include: { commissariat: { select: { name: true } } },
      orderBy: [{ label: "desc" }, { commissariatId: "asc" }],
    });
    return sendSuccess(res, {
      period: null,
      commissariat: null,
      divisions: [],
      periods: periods.map((item) => ({
        id: item.id,
        label: item.label,
        commissariatId: item.commissariatId,
        commissariatName: item.commissariat.name,
      })),
    });
  }

  const scope = scopeOf(req);
  const [divisions, period, commissariat] = await Promise.all([
    prisma.division.findMany({
      where: { commissariatId: scope.commissariatId, periodId: scope.periodId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.period.findUnique({
      where: { id: scope.periodId },
      select: { id: true, label: true },
    }),
    prisma.commissariat.findUnique({
      where: { id: scope.commissariatId },
      select: { id: true, name: true },
    }),
  ]);
  return sendSuccess(res, { period, commissariat, divisions, periods: [] });
};

export const createMembership = async (req: CmsRequest, res: Response) => {
  const scope = scopeOf(req);
  assertScopeAccess(
    req.cmsSession!,
    { commissariatId: scope.commissariatId, periodId: scope.periodId },
    "write",
  );
  const fields = await parseMembershipFields(req, scope);
  const created = await prisma.membership.create({
    data: {
      commissariatId: scope.commissariatId,
      periodId: scope.periodId,
      ...fields,
      publicationStatus: PublicationStatus.DRAFT,
    },
  });
  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "CREATE",
      entity: "MEMBERSHIP",
      entityId: created.id,
      newStatus: "DRAFT",
    },
  });
  return sendSuccess(res, created);
};

export const updateMembership = async (req: CmsRequest, res: Response) => {
  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
  });
  if (!membership)
    throw new ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
  assertScopeAccess(
    req.cmsSession!,
    {
      commissariatId: membership.commissariatId,
      periodId: membership.periodId,
    },
    "write",
  );
  const fields = await parseMembershipFields(req, {
    commissariatId: membership.commissariatId,
    periodId: membership.periodId,
  });
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: {
      ...fields,
      publicationStatus: PublicationStatus.DRAFT,
      rejectionReason: null,
    },
  });
  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "EDIT",
      entity: "MEMBERSHIP",
      entityId: membership.id,
      oldStatus: membership.publicationStatus,
      newStatus: "DRAFT",
    },
  });
  return sendSuccess(res, updated);
};

export const submitMembershipChanges = async (
  req: CmsRequest,
  res: Response,
) => {
  const scope = scopeOf(req);
  assertScopeAccess(
    req.cmsSession!,
    { commissariatId: scope.commissariatId, periodId: scope.periodId },
    "write",
  );
  const pending = await prisma.membership.findMany({
    where: {
      commissariatId: scope.commissariatId,
      periodId: scope.periodId,
      publicationStatus: {
        in: [PublicationStatus.DRAFT, PublicationStatus.REJECTED],
      },
    },
    select: { id: true, publicationStatus: true },
  });
  if (!pending.length)
    throw new ApiError("CONFLICT", "Tidak ada perubahan untuk diajukan.", 409);

  await prisma.$transaction(async (tx) => {
    await tx.membership.updateMany({
      where: { id: { in: pending.map((item) => item.id) } },
      data: {
        publicationStatus: PublicationStatus.SUBMITTED,
        rejectionReason: null,
      },
    });
    await tx.auditEvent.createMany({
      data: pending.map((item) => ({
        cmsAccountId: req.cmsSession!.cmsAccountId,
        action: "SUBMITTED",
        entity: "MEMBERSHIP",
        entityId: item.id,
        oldStatus: item.publicationStatus,
        newStatus: "SUBMITTED",
      })),
    });
  });

  return sendSuccess(res, { submitted: pending.length });
};

/*
 * Antrean Persetujuan Awardee (khusus admin global).
 *
 * Pengajuan manual dari sekretaris umum masuk status SUBMITTED. Admin global
 * menyetujui sekaligus menerbitkan (PUBLISHED) atau menolak dengan catatan
 * wajib yang dibaca pengaju di halaman Data Awardee. Batch impor diantre dan
 * diputuskan lewat endpoint /v1/membership-imports.
 */

export const listMembershipReviewQueue = async (
  _req: CmsRequest,
  res: Response,
) => {
  const items = await prisma.membership.findMany({
    where: { publicationStatus: PublicationStatus.SUBMITTED },
    include: {
      commissariat: { select: { name: true } },
      period: { select: { label: true } },
      division: { select: { name: true } },
    },
    orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
  });
  return sendSuccess(res, items);
};

export const approveMembership = async (req: CmsRequest, res: Response) => {
  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
  });
  if (!membership)
    throw new ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
  if (membership.publicationStatus !== PublicationStatus.SUBMITTED)
    throw new ApiError(
      "CONFLICT",
      "Hanya pengajuan berstatus menunggu yang dapat disetujui.",
      409,
    );
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: {
      publicationStatus: PublicationStatus.PUBLISHED,
      rejectionReason: null,
    },
  });
  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "APPROVED",
      entity: "MEMBERSHIP",
      entityId: membership.id,
      oldStatus: membership.publicationStatus,
      newStatus: "PUBLISHED",
    },
  });
  return sendSuccess(res, updated);
};

export const rejectMembership = async (req: CmsRequest, res: Response) => {
  const reason =
    typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (!reason)
    throw new ApiError(
      "VALIDATION_ERROR",
      "Catatan penolakan wajib diisi.",
      400,
      {
        reason: ["REQUIRED"],
      },
    );
  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
  });
  if (!membership)
    throw new ApiError("NOT_FOUND", "Awardee tidak ditemukan.", 404);
  if (membership.publicationStatus !== PublicationStatus.SUBMITTED)
    throw new ApiError(
      "CONFLICT",
      "Hanya pengajuan berstatus menunggu yang dapat ditolak.",
      409,
    );
  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: {
      publicationStatus: PublicationStatus.REJECTED,
      rejectionReason: reason.slice(0, 2000),
    },
  });
  await prisma.auditEvent.create({
    data: {
      cmsAccountId: req.cmsSession!.cmsAccountId,
      action: "REJECTED",
      entity: "MEMBERSHIP",
      entityId: membership.id,
      oldStatus: membership.publicationStatus,
      newStatus: "REJECTED",
    },
  });
  return sendSuccess(res, updated);
};
