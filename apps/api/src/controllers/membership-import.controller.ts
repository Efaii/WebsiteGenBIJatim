import { Request, Response } from "express";
import { CmsRequest } from "../middlewares/cms-session.middleware";
import { ApiError } from "../lib/api-error";
import {
  commitMembershipPreview,
  createMembershipPreview,
  transitionMembershipImport,
} from "../services/membership-import.service";
import { buildMembershipImportTemplate } from "../services/membership-import-template";
import { sendSuccess } from "../middlewares/request-context.middleware";
import { reviewImportAlias } from "../services/membership-import-alias.service";

export const downloadMembershipImportTemplate = async (
  _req: Request,
  res: Response,
) => {
  const buffer = buildMembershipImportTemplate();
  res
    .status(200)
    .set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    .set(
      "Content-Disposition",
      'attachment; filename="template-impor-awardee.xlsx"',
    )
    .send(buffer);
};

export const previewMembershipImport = async (
  req: CmsRequest,
  res: Response,
) => {
  if (!req.file)
    throw new ApiError("VALIDATION_ERROR", "An XLSX file is required.", 400, {
      file: ["INVALID_FILE"],
    });
  const { commissariatId, periodId } = req.body;
  if (typeof commissariatId !== "string" || typeof periodId !== "string")
    throw new ApiError(
      "VALIDATION_ERROR",
      "Target commissariat and period are required.",
      400,
      { scope: ["INVALID_SCOPE"] },
    );
  return sendSuccess(
    res,
    await createMembershipPreview(
      req.cmsSession!,
      req.file.buffer,
      req.file.originalname,
      commissariatId,
      periodId,
    ),
  );
};

export const commitMembershipImport = async (
  req: CmsRequest,
  res: Response,
) => {
  if (typeof req.body.previewId !== "string")
    throw new ApiError("VALIDATION_ERROR", "previewId is required.", 400);
  return sendSuccess(
    res,
    await commitMembershipPreview(req.cmsSession!, req.body.previewId, {
      confirmLargeImport: req.body.confirmLargeImport === true,
      backupEvidenceId: req.body.backupEvidenceId,
    }),
  );
};

export const getMembershipImport = async (req: CmsRequest, res: Response) => {
  const preview = await (
    await import("../lib/prisma")
  ).prisma.membershipImportPreview.findUnique({
    where: { id: req.params.id },
    include: { rows: true },
  });
  if (!preview)
    throw new ApiError("NOT_FOUND", "Import preview not found.", 404);
  if (
    req.cmsSession!.cmsAccount.role !== "ADMIN_GLOBAL" &&
    preview.cmsAccountId !== req.cmsSession!.cmsAccount.id
  )
    throw new ApiError("FORBIDDEN", "Preview belongs to another account.", 403);
  return sendSuccess(res, preview);
};

export const submitMembershipImport = async (
  req: CmsRequest,
  res: Response,
) => {
  return sendSuccess(
    res,
    await transitionMembershipImport(
      req.cmsSession!,
      req.params.id,
      "SUBMITTED",
    ),
  );
};

export const approveMembershipImport = async (req: CmsRequest, res: Response) =>
  sendSuccess(
    res,
    await transitionMembershipImport(
      req.cmsSession!,
      req.params.id,
      "APPROVED",
    ),
  );
export const rejectMembershipImport = async (req: CmsRequest, res: Response) =>
  sendSuccess(
    res,
    await transitionMembershipImport(
      req.cmsSession!,
      req.params.id,
      "REJECTED",
      req.body.reason,
    ),
  );
export const reviewMembershipImportAlias = async (
  req: CmsRequest,
  res: Response,
) => sendSuccess(res, await reviewImportAlias(req.cmsSession!, req.body));

/** Antrean batch impor untuk admin global, default status SUBMITTED. */
export const listMembershipImports = async (req: CmsRequest, res: Response) => {
  const { prisma } = await import("../lib/prisma");
  const requested =
    typeof req.query.status === "string" ? req.query.status : "SUBMITTED";
  const allowed = [
    "PREVIEW_READY",
    "COMMITTED",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "EXPIRED",
    "FAILED",
  ];
  if (!allowed.includes(requested))
    throw new ApiError("VALIDATION_ERROR", "Status filter is invalid.", 400, {
      status: ["INVALID_STATUS"],
    });
  const previews = await prisma.membershipImportPreview.findMany({
    where: { status: requested as never },
    include: {
      cmsAccount: {
        select: { user: { select: { name: true, username: true } } },
      },
      commissariat: { select: { name: true } },
      period: { select: { label: true } },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return sendSuccess(
    res,
    previews.map((preview) => ({
      id: preview.id,
      sourceFilename: preview.sourceFilename,
      status: preview.status,
      totalRows: preview.totalRows,
      newCount: preview.newCount,
      updatedCount: preview.updatedCount,
      unchangedCount: preview.unchangedCount,
      invalidCount: preview.invalidCount,
      ambiguousCount: preview.ambiguousCount,
      duplicateCount: preview.duplicateCount,
      committedAt: preview.committedAt,
      createdAt: preview.createdAt,
      uploaderName:
        preview.cmsAccount.user.name || preview.cmsAccount.user.username,
      commissariatName: preview.commissariat.name,
      periodLabel: preview.period.label,
    })),
  );
};
