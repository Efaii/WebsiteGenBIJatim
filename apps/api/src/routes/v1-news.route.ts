import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  requireCmsRole,
  requireCmsSession,
} from "../middlewares/cms-session.middleware";
import { CmsRole } from "@prisma/client";
import {
  addNewsGalleryAsset,
  cancelNewsRevision,
  createDraftNews,
  createNewsRevision,
  deleteNewsGalleryAsset,
  getPublishedNews,
  listCmsNews,
  listPublishedNews,
  orderNewsGalleryAssets,
  previewNews,
  transitionNews,
  transitionNewsRevision,
  updateDraftNews,
  updateNewsRevision,
  updateNewsSlug,
} from "../controllers/v1-news.controller";
import { uploadCanonicalNewsCover } from "../middlewares/upload.middleware";

const router = Router();
router.get("/", asyncHandler(listPublishedNews));
router.get(
  "/cms",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(listCmsNews),
);
router.get("/:slug", asyncHandler(getPublishedNews));
router.post(
  "/",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  uploadCanonicalNewsCover.single("cover"),
  asyncHandler(createDraftNews),
);
router.patch(
  "/:id",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  uploadCanonicalNewsCover.single("cover"),
  asyncHandler(updateDraftNews),
);
router.post(
  "/:id/transition",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(transitionNews),
);
router.post(
  "/:id/revisions",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  uploadCanonicalNewsCover.single("cover"),
  asyncHandler(createNewsRevision),
);
router.patch(
  "/:id/revisions/:revisionId",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  uploadCanonicalNewsCover.single("cover"),
  asyncHandler(updateNewsRevision),
);
router.post(
  "/:id/revisions/:revisionId/transition",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(transitionNewsRevision),
);
router.post(
  "/:id/slug",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(updateNewsSlug),
);
router.post(
  "/:id/gallery",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  uploadCanonicalNewsCover.single("file"),
  asyncHandler(addNewsGalleryAsset),
);
router.post(
  "/:id/gallery/order",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(orderNewsGalleryAssets),
);
router.delete(
  "/:id/gallery/:assetId",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(deleteNewsGalleryAsset),
);
router.get(
  "/:id/preview",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(previewNews),
);
router.post(
  "/:id/revisions/:revisionId/cancel",
  requireCmsSession,
  requireCmsRole(CmsRole.ADMIN_GLOBAL),
  asyncHandler(cancelNewsRevision),
);
export default router;
