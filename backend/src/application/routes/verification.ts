import express from "express";
import VerificationController from "../controllers/verification.controller";
import { authenticate } from "../middlewares/authentication";
import { upload } from "../../lib/upload";
import { validateVerificationRequest } from "../middlewares/validators/verification.validation";

const router = express.Router();
const verificationController = new VerificationController();

// Submit verification request with document upload
router.post(
  "/request", 
  authenticate, 
  upload.single("document"), 
  validateVerificationRequest, 
  verificationController.userRequestVerification
);

// Get user's verification status
router.get("/status", authenticate, verificationController.getUserVerificationStatus);

export default router;
