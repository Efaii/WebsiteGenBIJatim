import { Router } from "express";
import { CmsRole } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  requireCmsRole,
  requireCmsSession,
} from "../middlewares/cms-session.middleware";
import {
  createCmsAccount,
  listCmsAccounts,
  resetCmsAccountPassword,
  updateCmsAccountStatus,
} from "../controllers/cms-account.controller";

const router = Router();
router.get(
  "/",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(listCmsAccounts),
);
router.post(
  "/",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(createCmsAccount),
);
router.post(
  "/:id/reset-password",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(resetCmsAccountPassword),
);
router.post(
  "/:id/status",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(updateCmsAccountStatus),
);
export default router;
