import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateAddToCart = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { itemId, quantity } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid item ID format" });
  }

  if (quantity !== undefined) {
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ 
        error: "Quantity must be a positive number" 
      });
    }
  }

  next();
};

export const validateUpdateQuantity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { itemId, quantity } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: "Invalid item ID format" });
  }

  if (quantity === undefined) {
    return res.status(400).json({ error: "Quantity is required" });
  }

  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({ 
      error: "Quantity must be a non-negative number" 
    });
  }

  next();
};

export const validateSyncCart = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { items } = req.body;

  if (!items) {
    return res.status(400).json({ error: "Items array is required" });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: "Items must be an array" });
  }

  // Validate each item
  for (const item of items) {
    if (!item.itemId || !mongoose.Types.ObjectId.isValid(item.itemId)) {
      return res.status(400).json({ 
        error: "Each item must have a valid itemId" 
      });
    }

    if (typeof item.quantity !== "number" || item.quantity < 1) {
      return res.status(400).json({ 
        error: "Each item must have a valid quantity (positive number)" 
      });
    }
  }

  next();
};

