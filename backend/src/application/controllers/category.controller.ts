import { Request, Response } from "express";
import Category from "../../data/models/Category";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export default class CategoryController {
  // GET /api/categories - Get all active categories (public)
  getAllCategories = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const categories = await Category.find({ isActive: true })
        .sort({ name: 1 })
        .select("name slug description icon");

      return res.json({
        success: true,
        categories: categories.map((cat) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        })),
      });
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/categories - Get all categories (admin only)
  getCategories = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const categories = await Category.find()
        .sort({ name: 1 });

      return res.json({
        success: true,
        categories: categories.map((cat) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          isActive: cat.isActive,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/categories - Create new category
  createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, isActive } = req.body;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Validation
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: "Category name is required and must be a non-empty string" 
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          error: "Category name must be at least 2 characters long" 
        });
      }

      if (name.trim().length > 50) {
        return res.status(400).json({ 
          success: false, 
          error: "Category name must not exceed 50 characters" 
        });
      }

      if (description && typeof description === "string" && description.trim().length > 500) {
        return res.status(400).json({ 
          success: false, 
          error: "Description must not exceed 500 characters" 
        });
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({
        $or: [
          { name: name.trim() },
          { slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
        ]
      });

      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          error: "Category with this name already exists" 
        });
      }

      const category = await Category.create({
        name: name.trim(),
        description: description?.trim() || undefined,
        isActive: isActive !== undefined ? isActive : true,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
        },
      });
    } catch (error) {
      console.error("Create category error:", error);
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ 
          success: false, 
          error: Object.values(error.errors)[0]?.message || "Validation error" 
        });
      }
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/categories/:id - Update category
  updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid category ID" });
      }

      // Validation
      if (name !== undefined) {
        if (typeof name !== "string" || name.trim().length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: "Category name must be a non-empty string" 
          });
        }

        if (name.trim().length < 2) {
          return res.status(400).json({ 
            success: false, 
            error: "Category name must be at least 2 characters long" 
          });
        }

        if (name.trim().length > 50) {
          return res.status(400).json({ 
            success: false, 
            error: "Category name must not exceed 50 characters" 
          });
        }
      }

      if (description !== undefined && description !== null) {
        if (typeof description !== "string") {
          return res.status(400).json({ 
            success: false, 
            error: "Description must be a string" 
          });
        }

        if (description.trim().length > 500) {
          return res.status(400).json({ 
            success: false, 
            error: "Description must not exceed 500 characters" 
          });
        }
      }

      if (isActive !== undefined && typeof isActive !== "boolean") {
        return res.status(400).json({ 
          success: false, 
          error: "isActive must be a boolean value" 
        });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, error: "Category not found" });
      }

      // Check if new name conflicts with existing category
      if (name && name.trim() !== category.name) {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const existingCategory = await Category.findOne({
          _id: { $ne: id },
          $or: [{ name: name.trim() }, { slug }]
        });

        if (existingCategory) {
          return res.status(400).json({ 
            success: false, 
            error: "Category with this name already exists" 
          });
        }

        category.name = name.trim();
        category.slug = slug;
      }

      if (description !== undefined) {
        category.description = description.trim() || undefined;
      }
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      return res.json({
        success: true,
        message: "Category updated successfully",
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
        },
      });
    } catch (error) {
      console.error("Update category error:", error);
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ 
          success: false, 
          error: Object.values(error.errors)[0]?.message || "Validation error" 
        });
      }
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/admin/categories/:id - Delete category
  deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid category ID" });
      }

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ success: false, error: "Category not found" });
      }

      // Check if category is being used by any items
      const Item = (await import("../../data/models/Item")).default;
      const itemCount = await Item.countDocuments({ category: category.name });

      if (itemCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category. It is being used by ${itemCount} item(s). Deactivate it instead.`,
        });
      }

      await Category.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };
}

