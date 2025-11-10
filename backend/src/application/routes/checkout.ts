import { CheckoutController } from "../controllers/checkout.controller";
import { authenticate } from "../middlewares/authentication";
import { Router } from "express";

const router = Router();
const checkoutController = new CheckoutController();

router.post("/create-session", authenticate, checkoutController.createCheckoutSession);

export default router;
