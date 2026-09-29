import { Router } from "express";
import { CmsRole } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  requireCmsRole,
  requireCmsSession,
} from "../middlewares/cms-session.middleware";
import {
  createFaq,
  deleteFaq,
  listCmsFaqs,
  listPublicFaqs,
  orderFaqs,
  updateFaq,
} from "../controllers/v1-faq.controller";

/*
 * FAQ v1: baca publik (aktif, urut), tulis hanya admin global.
 */
const router = Router();
router.get("/", asyncHandler(listPublicFaqs));
router.get(
  "/cms",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(listCmsFaqs),
);
router.post(
  "/",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(createFaq),
);
router.post(
  "/order",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(orderFaqs),
);
router.patch(
  "/:id",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(updateFaq),
);
router.delete(
  "/:id",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(deleteFaq),
);

export default router;
