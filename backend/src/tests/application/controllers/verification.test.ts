import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app";
import User from "../../../data/models/User";
import Verification from "../../../data/models/Verification";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;
let authToken: string;
let userId: string;

// Mock Cloudinary
jest.mock("../../../lib/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue("https://cloudinary.com/mock-image-url")
}));

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const url = mongo.getUri();
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

beforeEach(async () => {
  // Clear all collections
  await User.deleteMany({});
  await Verification.deleteMany({});
  
  // Reset Cloudinary mock
  const cloudinaryModule = await import("../../../lib/cloudinary");
  const uploadToCloudinary = cloudinaryModule.uploadToCloudinary as jest.MockedFunction<typeof cloudinaryModule.uploadToCloudinary>;
  uploadToCloudinary.mockResolvedValue("https://cloudinary.com/mock-image-url");
  
  // Create a test user
  const testUser = new User({
    name: "Test User",
    kuEmail: "test@ku.th",
    password: "password123",
    faculty: "Engineering",
    contact: "0812345678"
  });
  
  await testUser.save();
  userId = (testUser._id as mongoose.Types.ObjectId).toString();
  
  // Generate auth token
  authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
});

describe("Verification Controller", () => {
  describe("POST /api/verification/request", () => {
    it("should successfully submit verification request with student_id", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "student_id")
        .attach("document", Buffer.from("fake image data"), "student_id.jpg");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Verification request submitted successfully");
      expect(response.body.verification.documentType).toBe("student_id");
      expect(response.body.verification.status).toBe("pending");
      expect(response.body.verification.id).toBeDefined();
    });

    it("should successfully submit verification request with citizen_id", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "citizen_id")
        .attach("document", Buffer.from("fake image data"), "citizen_id.jpg");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.verification.documentType).toBe("citizen_id");
      expect(response.body.verification.status).toBe("pending");
    });

    it("should return 400 for invalid document type", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "invalid_type")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Document type must be either student_id or citizen_id");
    });

    it("should return 400 for missing document type", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Document type is required");
    });

    it("should return 400 for missing document file", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "student_id");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No document file uploaded");
    });

    it("should return 400 if user already has pending verification", async () => {
      // Create a pending verification
      const verification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "student_id",
        documentUrl: "https://example.com/doc.jpg",
        status: "pending"
      });
      await verification.save();

      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "citizen_id")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You already have a pending verification request");
      expect(response.body.verificationId).toBeDefined();
      expect(response.body.submittedAt).toBeDefined();
    });

    it("should return 400 if user already has approved verification", async () => {
      // Create an approved verification
      const verification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "student_id",
        documentUrl: "https://example.com/doc.jpg",
        status: "approved",
        reviewedAt: new Date()
      });
      await verification.save();

      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "citizen_id")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You are already verified");
      expect(response.body.verificationId).toBeDefined();
      expect(response.body.approvedAt).toBeDefined();
    });

    it("should return 401 for missing authorization token", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .field("documentType", "student_id")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 401 for invalid authorization token", async () => {
      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", "Bearer invalid_token")
        .field("documentType", "student_id")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should handle Cloudinary upload errors", async () => {
      // Mock Cloudinary to throw an error
      const cloudinaryModule = await import("../../../lib/cloudinary");
      const uploadToCloudinary = cloudinaryModule.uploadToCloudinary as jest.MockedFunction<typeof cloudinaryModule.uploadToCloudinary>;
      uploadToCloudinary.mockRejectedValueOnce(new Error("Upload failed"));

      const response = await request(app)
        .post("/api/verification/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("documentType", "student_id")
        .attach("document", Buffer.from("fake image data"), "document.jpg");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Upload failed");
    });
  });

  describe("GET /api/verification/status", () => {
    it("should return verification status for pending verification", async () => {
      // Create a pending verification
      const verification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "student_id",
        documentUrl: "https://example.com/doc.jpg",
        status: "pending"
      });
      await verification.save();

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verification.documentType).toBe("student_id");
      expect(response.body.verification.status).toBe("pending");
      expect(response.body.verification.submittedAt).toBeDefined();
      expect(response.body.verification.rejectionReason).toBeUndefined();
    });

    it("should return verification status for approved verification", async () => {
      // Create an approved verification
      const verification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "citizen_id",
        documentUrl: "https://example.com/doc.jpg",
        status: "approved",
        reviewedAt: new Date()
      });
      await verification.save();

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verification.documentType).toBe("citizen_id");
      expect(response.body.verification.status).toBe("approved");
      expect(response.body.verification.reviewedAt).toBeDefined();
    });

    it("should return verification status for rejected verification", async () => {
      // Create a rejected verification
      const verification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "student_id",
        documentUrl: "https://example.com/doc.jpg",
        status: "rejected",
        reviewedAt: new Date(),
        rejectionReason: "Document is unclear"
      });
      await verification.save();

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verification.status).toBe("rejected");
      expect(response.body.verification.rejectionReason).toBe("Document is unclear");
      expect(response.body.verification.reviewedAt).toBeDefined();
    });

    it("should return 404 when no verification request exists", async () => {
      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("No verification request found");
      expect(response.body.message).toBe("Please submit a verification request first");
    });

    it("should return 401 for missing authorization token", async () => {
      const response = await request(app)
        .get("/api/verification/status");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 401 for invalid authorization token", async () => {
      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should return the most recent verification when multiple exist", async () => {
      // Create multiple verifications
      const oldVerification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "student_id",
        documentUrl: "https://example.com/old.jpg",
        status: "rejected",
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      });
      await oldVerification.save();

      const newVerification = new Verification({
        userId: new mongoose.Types.ObjectId(userId),
        documentType: "citizen_id",
        documentUrl: "https://example.com/new.jpg",
        status: "pending",
        createdAt: new Date()
      });
      await newVerification.save();

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.verification.documentType).toBe("citizen_id");
      expect(response.body.verification.status).toBe("pending");
    });
  });

  describe("Edge Cases", () => {
    it("should handle database connection errors gracefully", async () => {
      // Close the database connection
      await mongoose.connection.close();

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();

      // Reconnect for cleanup
      await mongoose.connect(mongo.getUri());
    });

    it("should handle malformed ObjectId gracefully", async () => {
      const invalidToken = jwt.sign({ id: "invalid_id" }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

      const response = await request(app)
        .get("/api/verification/status")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
});
