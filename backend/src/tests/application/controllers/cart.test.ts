import { Request, Response } from "express";
import CartController from "../../../application/controllers/cart.controller";
import Cart from "../../../data/models/Cart";
import Item from "../../../data/models/Item";
import mongoose from "mongoose";

// Mock the models
jest.mock("../../../data/models/Cart");
jest.mock("../../../data/models/Item");

interface AuthenticatedRequest extends Request {
  userId: string;
}

describe("CartController", () => {
  let cartController: CartController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    cartController = new CartController();
    
    responseObject = {
      statusCode: 200,
      data: null,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseObject.data = data;
        return mockResponse;
      }),
    };

    mockRequest = {
      body: {},
      params: {},
    };

    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("should return empty cart when no cart exists", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await cartController.getCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    });

    it("should return cart with items when cart exists", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId();
      const ownerId = new mongoose.Types.ObjectId();

      mockRequest.userId = userId;

      const mockCart = {
        items: [
          {
            itemId: {
              _id: itemId,
              title: "Test Item",
              price: 100,
              photo: ["image.jpg"],
              owner: {
                _id: ownerId,
                name: "Test Seller",
              },
            },
            quantity: 2,
            addedAt: new Date(),
          },
        ],
      };

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCart),
      });

      await cartController.getCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        items: [
          {
            id: itemId.toString(),
            title: "Test Item",
            price: 100,
            image: "image.jpg",
            quantity: 2,
            sellerId: ownerId.toString(),
            sellerName: "Test Seller",
          },
        ],
        totalItems: 2,
        totalPrice: 200,
      });
    });

    it("should handle errors gracefully", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Cart.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await cartController.getCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Server error",
      });
    });
  });

  describe("addToCart", () => {
    it("should create new cart and add item when cart does not exist", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId };

      const mockItem = {
        _id: itemId,
        title: "Test Item",
        status: "available",
      };

      (Item.findById as jest.Mock).mockResolvedValue(mockItem);
      (Cart.findOne as jest.Mock).mockResolvedValue(null);
      (Cart.create as jest.Mock).mockResolvedValue({
        userId,
        items: [{ itemId, quantity: 1, addedAt: new Date() }],
      });

      await cartController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(Item.findById).toHaveBeenCalledWith(itemId);
      expect(Cart.create).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Added to cart",
      });
    });

    it("should increment quantity when item already in cart", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId };

      const mockItem = {
        _id: itemId,
        title: "Test Item",
      };

      const mockCart = {
        items: [
          {
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity: 1,
            addedAt: new Date(),
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Item.findById as jest.Mock).mockResolvedValue(mockItem);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(mockCart.items[0].quantity).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Added to cart",
      });
    });

    it("should add new item when cart exists but item not in cart", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();
      const existingItemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId };

      const mockItem = {
        _id: itemId,
        title: "New Item",
      };

      const mockCart = {
        items: [
          {
            itemId: new mongoose.Types.ObjectId(existingItemId),
            quantity: 1,
            addedAt: new Date(),
          },
        ],
        push: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };

      (Item.findById as jest.Mock).mockResolvedValue(mockItem);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(mockCart.items.length).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Added to cart",
      });
    });

    it("should return error when item not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId };

      (Item.findById as jest.Mock).mockResolvedValue(null);

      await cartController.addToCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Item not found",
      });
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId, quantity: 5 };

      const mockCart = {
        items: [
          {
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity: 2,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartController.updateQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockCart.items[0].quantity).toBe(5);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Updated",
      });
    });

    it("should remove item when quantity is 0", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.body = { itemId, quantity: 0 };

      const mockCart = {
        items: [
          {
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity: 2,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartController.updateQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockCart.items.length).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it("should return error when cart not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.body = { itemId: "123", quantity: 1 };

      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      await cartController.updateQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Cart not found",
      });
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const itemId = new mongoose.Types.ObjectId().toString();

      mockRequest.userId = userId;
      mockRequest.params = { itemId };

      const mockCart = {
        items: [
          {
            itemId: new mongoose.Types.ObjectId(itemId),
            quantity: 1,
          },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      await cartController.removeFromCart(mockRequest as Request, mockResponse as Response);

      expect(mockCart.items.length).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Removed",
      });
    });

    it("should return error when cart not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { itemId: "123" };

      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      await cartController.removeFromCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Cart not found",
      });
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Cart.findOneAndUpdate as jest.Mock).mockResolvedValue({
        userId,
        items: [],
      });

      await cartController.clearCart(mockRequest as Request, mockResponse as Response);

      expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: expect.any(mongoose.Types.ObjectId) },
        { items: [] },
        { upsert: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Cleared",
      });
    });

    it("should handle errors when clearing cart", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Cart.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error("Database error"));

      await cartController.clearCart(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Server error",
      });
    });
  });
});



