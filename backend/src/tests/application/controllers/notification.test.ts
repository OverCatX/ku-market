import { Request, Response } from "express";
import NotificationController from "../../../application/controllers/notification.controller";
import Notification from "../../../data/models/Notification";
import mongoose from "mongoose";

// Mock the model
jest.mock("../../../data/models/Notification");

interface AuthenticatedRequest extends Request {
  userId: string;
}

interface ResponseObject {
  statusCode: number;
  data: unknown;
}

describe("NotificationController", () => {
  let notificationController: NotificationController;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let responseObject: ResponseObject;

  beforeEach(() => {
    notificationController = new NotificationController();
    
    responseObject = {
      statusCode: 200,
      data: null,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data: unknown) => {
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

  describe("getNotifications", () => {
    it("should return notifications with unread count", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      const mockNotifications = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(userId),
          type: "order" as const,
          title: "Order confirmed",
          message: "Your order has been confirmed",
          timestamp: new Date(),
          read: false,
          link: "/order/123",
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(userId),
          type: "message" as const,
          title: "New message",
          message: "You have a new message",
          timestamp: new Date(),
          read: true,
          link: "/chats",
        },
      ];

      (Notification.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockNotifications),
        }),
      });

      (Notification.countDocuments as jest.Mock).mockResolvedValue(1);

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Notification.find).toHaveBeenCalledWith({
        userId: expect.any(mongoose.Types.ObjectId),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        notifications: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: "order",
            title: "Order confirmed",
            read: false,
          }),
        ]),
        unreadCount: 1,
      });
    });

    it("should handle errors gracefully", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Notification.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Server error",
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark notification as read successfully", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { id: notificationId };

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId),
        read: true,
      };

      (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(mockNotification);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: expect.any(mongoose.Types.ObjectId),
          userId: expect.any(mongoose.Types.ObjectId),
        },
        { read: true },
        { new: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification marked as read",
      });
    });

    it("should return 404 when notification not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { id: notificationId };

      (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Notification not found",
      });
    });

    it("should return 400 for invalid notification ID", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { id: "invalid-id" };

      await notificationController.markAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid notification ID",
      });
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Notification.updateMany as jest.Mock).mockResolvedValue({
        modifiedCount: 5,
      });

      await notificationController.markAllAsRead(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Notification.updateMany).toHaveBeenCalledWith(
        {
          userId: expect.any(mongoose.Types.ObjectId),
          read: false,
        },
        { read: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "All notifications marked as read",
        updatedCount: 5,
      });
    });
  });

  describe("deleteNotification", () => {
    it("should delete notification successfully", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { id: notificationId };

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(userId),
      };

      (Notification.findOneAndDelete as jest.Mock).mockResolvedValue(mockNotification);

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Notification.findOneAndDelete).toHaveBeenCalledWith({
        _id: expect.any(mongoose.Types.ObjectId),
        userId: expect.any(mongoose.Types.ObjectId),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Notification deleted",
      });
    });

    it("should return 404 when notification not found", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const notificationId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;
      mockRequest.params = { id: notificationId };

      (Notification.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await notificationController.deleteNotification(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Notification not found",
      });
    });
  });

  describe("clearAll", () => {
    it("should clear all notifications for user", async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      mockRequest.userId = userId;

      (Notification.deleteMany as jest.Mock).mockResolvedValue({
        deletedCount: 10,
      });

      await notificationController.clearAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Notification.deleteMany).toHaveBeenCalledWith({
        userId: expect.any(mongoose.Types.ObjectId),
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "All notifications cleared",
        deletedCount: 10,
      });
    });
  });
});

