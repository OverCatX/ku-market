import { Router } from "express";
import CategoryController from "../controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

// Public route - Get active categories
// GET /api/categories
router.get("/", categoryController.getAllCategories);

export default router;

