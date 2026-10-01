import { Router } from "express";
import { CmsRole } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  requireCmsRole,
  requireCmsSession,
} from "../middlewares/cms-session.middleware";
import { getOverview } from "../controllers/overview.controller";

const router = Router();
router.get(
  "/",
  requireCmsSession,
  requireCmsRole(
    CmsRole.ADMIN_GLOBAL,
    CmsRole.SEKRETARIS_UMUM,
    CmsRole.SEKRETARIS_DIVISI,
  ),
  asyncHandler(getOverview),
);
export default router;
