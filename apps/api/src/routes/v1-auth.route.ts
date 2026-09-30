import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireCmsSession } from "../middlewares/cms-session.middleware";
import {
  loginCms,
  logoutCms,
  currentCms,
  changeCmsPassword,
} from "../controllers/cms-auth.controller";

const router = Router();
router.post("/login", asyncHandler(loginCms));
router.post("/logout", requireCmsSession, asyncHandler(logoutCms));
router.get("/me", requireCmsSession, asyncHandler(currentCms));
router.post(
  "/change-password",
  requireCmsSession,
  asyncHandler(changeCmsPassword),
);
export default router;
