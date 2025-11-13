import { Router } from "express";
import SellerController from "../controllers/seller.controller";
import { authenticate } from "../middlewares/authentication";

const router = Router();
const sellerController = new SellerController();

// All seller routes require authentication
router.use(authenticate);

// Dashboard statistics
router.get("/stats", sellerController.getStats);

// Orders management
router.get("/orders", sellerController.getOrders);
router.get("/orders/:orderId", sellerController.getOrderDetail);
router.patch("/orders/:orderId/confirm", sellerController.confirmOrder);
router.patch("/orders/:orderId/reject", sellerController.rejectOrder);

// Items management
router.get("/items", sellerController.getItems);
router.patch("/items/:itemId/status", sellerController.updateItemStatus);

export default router;

