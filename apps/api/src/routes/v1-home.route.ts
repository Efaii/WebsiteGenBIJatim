import { Router } from "express";
import { CmsRole } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  requireCmsRole,
  requireCmsSession,
} from "../middlewares/cms-session.middleware";
import {
  getHomeContent,
  updateHomeContent,
} from "../controllers/v1-home.controller";

/*
 * Konten Beranda v1: baca publik, tulis hanya admin global (ADR 0013/0014).
 */
const router = Router();
router.get("/", asyncHandler(getHomeContent));
router.patch(
  "/",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(updateHomeContent),
);

export default router;
