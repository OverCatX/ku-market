import { Router } from "express";
import OrderController from "../controllers/order.controller";
import { authenticate } from "../middlewares/authentication";

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authenticate);

// POST /api/orders/checkout - Create order from cart
router.post("/checkout", orderController.checkout);

// GET /api/orders - Get buyer's orders
router.get("/", orderController.getBuyerOrders);

// GET /api/orders/:id - Get order details
router.get("/:id", orderController.getOrderDetails);

export default router;
