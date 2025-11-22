import { CheckoutController } from "../controllers/checkout.controller";
import { authenticate } from "../middlewares/authentication";
import { Router } from "express";

const router = Router();
const checkoutController = new CheckoutController();

router.post("/create-session", authenticate, checkoutController.createCheckoutSession);
router.post("/create-payment-intent", authenticate, checkoutController.createPaymentIntent);
router.post("/confirm-payment", authenticate, checkoutController.confirmPayment);

export default router;
