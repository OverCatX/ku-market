import express from "express";
import CartController from "../controllers/cart.controller";
import { authenticate } from "../middlewares/authentication";
import { 
  validateAddToCart, 
  validateUpdateQuantity, 
  validateSyncCart 
} from "../middlewares/validators/cart.validation";

const router = express.Router();
const cartController = new CartController();

// Get user's cart
router.get("/", authenticate, cartController.getCart);

// Add item to cart
router.post("/add", authenticate, validateAddToCart, cartController.addToCart);

// Update item quantity
router.put("/update", authenticate, validateUpdateQuantity, cartController.updateQuantity);

// Remove item from cart
router.delete("/remove/:itemId", authenticate, cartController.removeFromCart);

// Clear entire cart
router.delete("/clear", authenticate, cartController.clearCart);

// Sync cart from client
router.post("/sync", authenticate, validateSyncCart, cartController.syncCart);

export default router;

