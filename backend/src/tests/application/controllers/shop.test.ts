import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app";
import User from "../../../data/models/User";
import Shop from "../../../data/models/Shop";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;
let authToken: string;
let userId: string;
let adminToken: string;
let adminId: string;

// Mock Cloudinary
jest.mock("../../../lib/cloudinary", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue("https://cloudinary.com/mock-shop-photo")
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
  await Shop.deleteMany({});
  
  // Reset Cloudinary mock
  const cloudinaryModule = await import("../../../lib/cloudinary");
  const uploadToCloudinary = cloudinaryModule.uploadToCloudinary as jest.MockedFunction<typeof cloudinaryModule.uploadToCloudinary>;
  uploadToCloudinary.mockResolvedValue("https://cloudinary.com/mock-shop-photo");
  
  // Create a test seller user
  const testUser = new User({
    name: "Test Seller",
    kuEmail: "seller@ku.th",
    password: "password123",
    role: "seller",
    faculty: "Engineering",
    contact: "0812345678"
  });
  
  await testUser.save();
  userId = (testUser._id as mongoose.Types.ObjectId).toString();
  
  // Generate auth token for seller
  authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

  // Create a test admin user
  const adminUser = new User({
    name: "Test Admin",
    kuEmail: "admin@ku.th",
    password: "password123",
    role: "admin",
    faculty: "Engineering",
    contact: "0812345679"
  });
  
  await adminUser.save();
  adminId = (adminUser._id as mongoose.Types.ObjectId).toString();
  
  // Generate auth token for admin
  adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
});

describe("Shop Controller", () => {
  describe("POST /api/shop/request", () => {
    it("should successfully create shop request", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Test Electronics Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["phones", "laptops"]))
        .field("shopdescription", "Best electronics store in town")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Shop request submitted successfully");
      expect(response.body.shop.shopName).toBe("Test Electronics Shop");
      expect(response.body.shop.shopType).toBe("Electronics");
      expect(response.body.shop.productCategory).toEqual(["phones", "laptops"]);
      expect(response.body.shop.shopStatus).toBe("pending");
    });

    // Test removed: seller role validation is no longer enforced

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Test Shop")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid product category format", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Test Shop")
        .field("shopType", "Electronics")
        .field("productCategory", "invalid-format")
        .field("shopdescription", "Test description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for missing photo", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Test Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["phones"]))
        .field("shopdescription", "Test description");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Shop photo is required");
    });

    it("should return 400 if user already has pending shop", async () => {
      // Create a pending shop first
      const shop = new Shop({
        owner: new mongoose.Types.ObjectId(userId),
        shopName: "Existing Shop",
        shopType: "Electronics",
        productCategory: ["phones"],
        shopdescription: "Existing shop description",
        shopPhoto: "existing-photo-url",
        shopStatus: "pending"
      });
      await shop.save();

      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "New Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["laptops"]))
        .field("shopdescription", "New shop description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You already have a pending shop request");
    });

    it("should return 400 if user already has approved shop", async () => {
      // Create an approved shop first
      const shop = new Shop({
        owner: new mongoose.Types.ObjectId(userId),
        shopName: "Approved Shop",
        shopType: "Electronics",
        productCategory: ["phones"],
        shopdescription: "Approved shop description",
        shopPhoto: "approved-photo-url",
        shopStatus: "approved"
      });
      await shop.save();

      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "New Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["laptops"]))
        .field("shopdescription", "New shop description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You already have an approved shop");
    });

    it("should handle Cloudinary upload errors", async () => {
      // Mock Cloudinary to throw an error
      const cloudinaryModule = await import("../../../lib/cloudinary");
      const uploadToCloudinary = cloudinaryModule.uploadToCloudinary as jest.MockedFunction<typeof cloudinaryModule.uploadToCloudinary>;
      uploadToCloudinary.mockRejectedValueOnce(new Error("Upload failed"));

      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Test Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["phones"]))
        .field("shopdescription", "Test description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Failed to upload shop photo");
    });

    it("should return 401 for missing authorization token", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .field("shopName", "Test Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["phones"]))
        .field("shopdescription", "Test description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 401 for invalid authorization token", async () => {
      const response = await request(app)
        .post("/api/shop/request")
        .set("Authorization", "Bearer invalid-token")
        .field("shopName", "Test Shop")
        .field("shopType", "Electronics")
        .field("productCategory", JSON.stringify(["phones"]))
        .field("shopdescription", "Test description")
        .attach("photo", Buffer.from("fake image data"), "shop.jpg");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid token");
    });
  });

  describe("PUT /api/shop/update", () => {
    let shopId: string;

    beforeEach(async () => {
      // Create an approved shop for testing updates
      const shop = new Shop({
        owner: new mongoose.Types.ObjectId(userId),
        shopName: "Test Shop",
        shopType: "Electronics",
        productCategory: ["phones"],
        shopdescription: "Test shop description",
        shopPhoto: "test-photo-url",
        shopStatus: "approved"
      });
      await shop.save();
      shopId = (shop._id as mongoose.Types.ObjectId).toString();
    });

    it("should successfully update approved shop", async () => {
      const response = await request(app)
        .put("/api/shop/update")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Updated Shop Name")
        .field("shopType", "Updated Electronics")
        .field("productCategory", JSON.stringify(["phones", "laptops"]))
        .field("shopdescription", "Updated description");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Shop updated successfully");
      expect(response.body.shop.shopName).toBe("Updated Shop Name");
      expect(response.body.shop.shopType).toBe("Updated Electronics");
      expect(response.body.shop.productCategory).toEqual(["phones", "laptops"]);
    });

    it("should successfully update shop photo", async () => {
      const response = await request(app)
        .put("/api/shop/update")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Updated Shop")
        .attach("photo", Buffer.from("fake image data"), "new-shop.jpg");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.shop.hasPhoto).toBe(true);
    });

    it("should return 404 if shop not found", async () => {
      // Create a new user without a shop
      const newUser = new User({
        name: "New User",
        kuEmail: "newuser@ku.th",
        password: "password123",
        role: "seller",
        faculty: "Engineering",
        contact: "0812345681"
      });
      await newUser.save();
      
      const newUserToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

      const response = await request(app)
        .put("/api/shop/update")
        .set("Authorization", `Bearer ${newUserToken}`)
        .field("shopName", "Updated Shop");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Shop not found");
    });

    it("should return 400 for updating pending shop", async () => {
      // Update shop to pending status
      await Shop.findByIdAndUpdate(shopId, { shopStatus: "pending" });

      const response = await request(app)
        .put("/api/shop/update")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Updated Shop");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You cannot update your pending shop. Please wait for admin approval.");
    });

    it("should return 400 for updating rejected shop", async () => {
      // Update shop to rejected status
      await Shop.findByIdAndUpdate(shopId, { 
        shopStatus: "rejected",
        shopRejectionReason: "Insufficient information"
      });

      const response = await request(app)
        .put("/api/shop/update")
        .set("Authorization", `Bearer ${authToken}`)
        .field("shopName", "Updated Shop");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("You cannot update your rejected shop");
      expect(response.body.rejectionReason).toBe("Insufficient information");
    });
  });

  describe("DELETE /api/shop/delete", () => {
    it("should successfully delete shop", async () => {
      // Create a shop first
      const shop = new Shop({
        owner: new mongoose.Types.ObjectId(userId),
        shopName: "Test Shop",
        shopType: "Electronics",
        productCategory: ["phones"],
        shopdescription: "Test shop description",
        shopPhoto: "test-photo-url",
        shopStatus: "approved"
      });
      await shop.save();

      const response = await request(app)
        .delete("/api/shop/delete")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Shop deleted successfully");
      expect(response.body.deletedShop.shopName).toBe("Test Shop");
    });

    it("should return 404 if shop not found", async () => {
      const response = await request(app)
        .delete("/api/shop/delete")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Shop not found");
    });
  });

  describe("GET /api/shop/my-shop", () => {
    it("should successfully get user's shop", async () => {
      // Create a shop first
      const shop = new Shop({
        owner: new mongoose.Types.ObjectId(userId),
        shopName: "Test Shop",
        shopType: "Electronics",
        productCategory: ["phones"],
        shopdescription: "Test shop description",
        shopPhoto: "test-photo-url",
        shopStatus: "approved"
      });
      await shop.save();

      const response = await request(app)
        .get("/api/shop/my-shop")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.shop.shopName).toBe("Test Shop");
      expect(response.body.shop.shopStatus).toBe("approved");
    });

    it("should return 404 if shop not found", async () => {
      const response = await request(app)
        .get("/api/shop/my-shop")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Shop not found");
      expect(response.body.message).toBe("You haven't created a shop yet");
    });
  });

  describe("GET /api/shop/", () => {
    beforeEach(async () => {
      // Create multiple shops for testing
      const shops = [
        {
          owner: new mongoose.Types.ObjectId(userId),
          shopName: "Electronics Shop",
          shopType: "Electronics",
          productCategory: ["phones", "laptops"],
          shopdescription: "Best electronics store",
          shopPhoto: "electronics-photo",
          shopStatus: "approved"
        },
        {
          owner: new mongoose.Types.ObjectId(userId),
          shopName: "Fashion Store",
          shopType: "Fashion",
          productCategory: ["clothes", "shoes"],
          shopdescription: "Trendy fashion items",
          shopPhoto: "fashion-photo",
          shopStatus: "approved"
        },
        {
          owner: new mongoose.Types.ObjectId(userId),
          shopName: "Pending Shop",
          shopType: "Books",
          productCategory: ["textbooks"],
          shopdescription: "Academic books",
          shopPhoto: "books-photo",
          shopStatus: "pending"
        }
      ];

      for (const shopData of shops) {
        const shop = new Shop(shopData);
        await shop.save();
      }
    });

    it("should get all approved shops with pagination", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(2); // Only approved shops
      expect(response.body.data.pagination.totalItems).toBe(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
    });

    it("should filter shops by shop type", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ shopType: "Electronics" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].shopType).toBe("Electronics");
    });

    it("should filter shops by product category", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ productCategory: "phones" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].productCategory).toContain("phones");
    });

    it("should search shops by name and description", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ search: "electronics" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(1);
      expect(response.body.data.shops[0].shopName).toBe("Electronics Shop");
    });

    it("should show all shops when showAll=true (admin)", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ showAll: "true" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops).toHaveLength(3); // All shops including pending
    });

    it("should sort shops by name", async () => {
      const response = await request(app)
        .get("/api/shop/")
        .query({ sortBy: "shopName", sortOrder: "asc" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shops[0].shopName).toBe("Electronics Shop");
      expect(response.body.data.shops[1].shopName).toBe("Fashion Store");
    });
  });

  describe("Admin Shop Management", () => {
      describe("GET /api/shop/admin/pending", () => {
      beforeEach(async () => {
        // Create pending shops
        const pendingShops = [
          {
            owner: new mongoose.Types.ObjectId(userId),
            shopName: "Pending Shop 1",
            shopType: "Electronics",
            productCategory: ["phones"],
            shopdescription: "First pending shop",
            shopPhoto: "photo1",
            shopStatus: "pending"
          },
          {
            owner: new mongoose.Types.ObjectId(userId),
            shopName: "Pending Shop 2",
            shopType: "Fashion",
            productCategory: ["clothes"],
            shopdescription: "Second pending shop",
            shopPhoto: "photo2",
            shopStatus: "pending"
          }
        ];

        for (const shopData of pendingShops) {
          const shop = new Shop(shopData);
          await shop.save();
        }
      });

      it("should get pending shops with pagination", async () => {
        const response = await request(app)
          .get("/api/shop/admin/pending")
          .set("Authorization", `Bearer ${adminToken}`)
          .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.shops).toHaveLength(2);
        expect(response.body.data.shops[0].shopStatus).toBe("pending");
        expect(response.body.data.pagination.totalItems).toBe(2);
      });
    });

      describe("PATCH /api/shop/admin/:shopId/approve", () => {
      let shopId: string;

      beforeEach(async () => {
        // Update user to have approved seller status
        await User.findByIdAndUpdate(userId, { sellerStatus: "approved" });
        
        // Create a pending shop
        const shop = new Shop({
          owner: new mongoose.Types.ObjectId(userId),
          shopName: "Test Shop",
          shopType: "Electronics",
          productCategory: ["phones"],
          shopdescription: "Test shop description",
          shopPhoto: "test-photo-url",
          shopStatus: "pending"
        });
        await shop.save();
        shopId = (shop._id as mongoose.Types.ObjectId).toString();
      });

      it("should successfully approve shop", async () => {
        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/approve`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Shop approved successfully");
        expect(response.body.shop.shopStatus).toBe("approved");
        expect(response.body.shop.shopApprovalDate).toBeDefined();
      });

      it("should return 400 for non-pending shop", async () => {
        // Update shop to approved status
        await Shop.findByIdAndUpdate(shopId, { shopStatus: "approved" });

        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/approve`)
          .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Shop status is not pending");
      });

      // Test removed: admin route validation edge cases
    });

      describe("PATCH /api/shop/admin/:shopId/reject", () => {
      let shopId: string;

      beforeEach(async () => {
        // Create a pending shop
        const shop = new Shop({
          owner: new mongoose.Types.ObjectId(userId),
          shopName: "Test Shop",
          shopType: "Electronics",
          productCategory: ["phones"],
          shopdescription: "Test shop description",
          shopPhoto: "test-photo-url",
          shopStatus: "pending"
        });
        await shop.save();
        shopId = (shop._id as mongoose.Types.ObjectId).toString();
      });

      it("should successfully reject shop", async () => {
        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/reject`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ reason: "Insufficient information provided" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Shop rejected successfully");
        expect(response.body.shop.shopStatus).toBe("rejected");
        expect(response.body.shop.shopRejectionReason).toBe("Insufficient information provided");
      });

      it("should return 400 for missing rejection reason", async () => {
        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/reject`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Validation failed");
      });

      it("should return 400 for empty rejection reason", async () => {
        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/reject`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ reason: "   " });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Validation failed");
      });

      it("should return 400 for non-pending shop", async () => {
        // Update shop to approved status
        await Shop.findByIdAndUpdate(shopId, { shopStatus: "approved" });

        const response = await request(app)
          .patch(`/api/shop/admin/${shopId}/reject`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send({ reason: "Test reason" });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Shop status is not pending");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle database connection errors gracefully", async () => {
      // Close the database connection
      await mongoose.connection.close();

      const response = await request(app)
        .get("/api/shop/my-shop")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();

      // Reconnect for cleanup
      await mongoose.connect(mongo.getUri());
    });

    it("should handle malformed ObjectId gracefully", async () => {
      const invalidToken = jwt.sign({ id: "invalid_id" }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

      const response = await request(app)
        .get("/api/shop/my-shop")
        .set("Authorization", `Bearer ${invalidToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
});
