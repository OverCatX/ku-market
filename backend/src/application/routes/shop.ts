import express from "express";
import ShopController from "../controllers/shop.controller";
import { authenticate } from "../middlewares/authentication";
import { upload } from "../../lib/upload";
import { 
  validateShopRequest, 
  validateShopUpdate, 
  validateShopRejection,
  validatePagination 
} from "../middlewares/validators/shop.validation";

const router = express.Router();
const shopController = new ShopController();

// User shop management routes
router.post(
  "/request", 
  authenticate, 
  upload.single("photo"), 
  validateShopRequest, 
  shopController.userRequestShop
);

router.put(
  "/update", 
  authenticate, 
  upload.single("photo"), 
  validateShopUpdate, 
  shopController.userUpdateShop
);

router.delete("/delete", authenticate, shopController.userDeleteShop);
router.delete("/cancel", authenticate, shopController.cancelShopRequest);
router.get("/my-shop", authenticate, shopController.userGetShop);

// Public shop browsing
router.get("/", validatePagination, shopController.getAllShops);

// Admin shop management routes (these would need admin authentication)
router.get("/admin/pending", authenticate, validatePagination, shopController.getPendingShops);
router.patch("/admin/:shopId/approve", authenticate, shopController.approveShop);
router.patch("/admin/:shopId/reject", authenticate, validateShopRejection, shopController.rejectShop);

export default router;
