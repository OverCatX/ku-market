import { Router } from "express";
import ReportController from "../controllers/report.controller";
import { authenticate } from "../middlewares/authentication";
import { adminMiddleware } from "../middlewares/admin";
import { upload } from "../../lib/upload";

const router = Router();
const reportController = new ReportController();

// User routes
router.post(
  "/general",
  authenticate,
  reportController.submitGeneralReport
);

router.post(
  "/item",
  authenticate,
  upload.array("images", 5),
  reportController.submitItemReport
);

router.get("/my", authenticate, reportController.getMyReports);

// Admin routes
router.get(
  "/admin",
  authenticate,
  adminMiddleware,
  reportController.getAdminReports
);

router.patch(
  "/admin/:id",
  authenticate,
  adminMiddleware,
  reportController.updateReportStatus
);

export default router;
