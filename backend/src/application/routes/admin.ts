import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import CategoryController from "../controllers/category.controller";
import { authenticate } from "../middlewares/authentication";
import { adminMiddleware } from "../middlewares/admin";

const router = Router();
const adminController = new AdminController();
const categoryController = new CategoryController();

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

// Item management
router.get("/items", authenticate, adminMiddleware, adminController.getItems);
router.patch("/items/:id/approve", authenticate, adminMiddleware, adminController.approveItem);
router.patch("/items/:id/reject", authenticate, adminMiddleware, adminController.rejectItem);
router.patch("/items/:id", authenticate, adminMiddleware, adminController.updateItem);
router.delete("/items/:id", authenticate, adminMiddleware, adminController.deleteItem);

// Category management
router.get("/categories", authenticate, adminMiddleware, categoryController.getCategories);
router.post("/categories", authenticate, adminMiddleware, categoryController.createCategory);
router.patch("/categories/:id", authenticate, adminMiddleware, categoryController.updateCategory);
router.delete("/categories/:id", authenticate, adminMiddleware, categoryController.deleteCategory);

// Review management
router.get("/reviews/item/:itemId", authenticate, adminMiddleware, adminController.getItemReviews);
router.delete("/reviews/:id", authenticate, adminMiddleware, adminController.deleteReview);

// Meetup presets management
router.get("/meetup-presets", authenticate, adminMiddleware, adminController.getMeetupPresets);
router.post("/meetup-presets", authenticate, adminMiddleware, adminController.createMeetupPreset);
router.patch("/meetup-presets/:id", authenticate, adminMiddleware, adminController.updateMeetupPreset);
router.delete("/meetup-presets/:id", authenticate, adminMiddleware, adminController.deleteMeetupPreset);

// Activity logs
router.get("/activity-logs", authenticate, adminMiddleware, adminController.getActivityLogs);
router.get("/activity-logs/stats", authenticate, adminMiddleware, adminController.getActivityLogStats);

export default router;

