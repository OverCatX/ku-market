import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { authenticate } from "../middlewares/authentication";
import { adminMiddleware } from "../middlewares/admin";

const router = Router();
const adminController = new AdminController();

// Bootstrap admin (no auth required, only works if no admin exists)
router.post("/bootstrap", adminController.bootstrapAdmin);

// Clear all admins (DEV ONLY - no auth, but requires special key)
router.post("/clear", adminController.clearAllAdmins);

// Dashboard stats
router.get("/stats", authenticate, adminMiddleware, adminController.getStats);

// Verification management
router.get("/verifications", authenticate, adminMiddleware, adminController.getVerifications);
router.patch("/verifications/:id/approve", authenticate, adminMiddleware, adminController.approveVerification);
router.patch("/verifications/:id/reject", authenticate, adminMiddleware, adminController.rejectVerification);

// Shop management
router.get("/shops", authenticate, adminMiddleware, adminController.getShops);
router.patch("/shops/:id/approve", authenticate, adminMiddleware, adminController.approveShop);
router.patch("/shops/:id/reject", authenticate, adminMiddleware, adminController.rejectShop);

// User management
router.get("/users", authenticate, adminMiddleware, adminController.getUsers);
router.post("/users/:userId/promote", authenticate, adminMiddleware, adminController.promoteToAdmin);
router.post("/users/:userId/demote", authenticate, adminMiddleware, adminController.demoteAdmin);
router.delete("/users/:userId", authenticate, adminMiddleware, adminController.deleteAdmin);

export default router;

