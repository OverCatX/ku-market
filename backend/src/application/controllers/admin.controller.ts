import { Request, Response } from "express";
import Verification from "../../data/models/Verification";
import Shop from "../../data/models/Shop";
import User from "../../data/models/User";
import Item from "../../data/models/Item";
import Review, { IReview } from "../../data/models/Review";
import MeetupPreset from "../../data/models/MeetupPreset";
import ActivityLog from "../../data/models/ActivityLog";
import mongoose from "mongoose";
import { createNotification } from "../../lib/notifications";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { logActivity } from "../../lib/activityLogger";

export default class AdminController {
  // GET /api/admin/verifications - Get all verification requests
  getVerifications = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { status } = req.query;
      const filter: { status?: string } = {};
      
      if (status && ["pending", "approved", "rejected"].includes(status as string)) {
        filter.status = status as string;
      }

      const verifications = await Verification.find(filter)
        .populate("userId", "name kuEmail faculty contact")
        .sort({ createdAt: -1 });

      interface PopulatedUser {
        _id: mongoose.Types.ObjectId;
        name: string;
        kuEmail: string;
        faculty: string;
        contact: string;
      }

      return res.json({
        success: true,
        verifications: verifications
          .filter((v) => v.userId !== null) // Filter out verifications with deleted users
          .map((v) => {
            const user = v.userId as unknown as PopulatedUser;
            return {
              id: v._id,
              user: {
                id: user._id,
                name: user.name,
                email: user.kuEmail,
                faculty: user.faculty,
                contact: user.contact,
              },
              documentType: v.documentType,
              documentUrl: v.documentUrl,
              status: v.status,
              createdAt: v.createdAt,
              reviewedAt: v.reviewedAt,
              rejectionReason: v.rejectionReason,
            };
          }),
      });
    } catch (error) {
      console.error("Get verifications error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/verifications/:id/approve
  approveVerification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const adminId = (req as AuthenticatedRequest).user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "User not authenticated" });
      }

      const verification = await Verification.findById(id);
      if (!verification) {
        return res.status(404).json({ success: false, error: "Verification not found" });
      }

      if (verification.status !== "pending") {
        return res.status(400).json({ 
          success: false, 
          error: `Verification already ${verification.status}` 
        });
      }

      verification.status = "approved";
      verification.reviewedAt = new Date();
      verification.reviewedBy = new mongoose.Types.ObjectId(adminId);
      await verification.save();

      // Update user's isVerified status
      await User.findByIdAndUpdate(verification.userId, {
        isVerified: true,
        verificationDate: new Date(),
      });

      // Notify user that verification is approved
      await createNotification(
        verification.userId,
        "system",
        "Identity Verified",
        "Your identity verification has been approved! You can now use all features.",
        "/profile"
      );

      // Log admin action
      const user = await User.findById(verification.userId).select("kuEmail name").lean();
      await logActivity({
        req,
        activityType: "admin_verification_approved",
        entityType: "verification",
        entityId: id,
        description: `Admin approved verification for user: ${user?.kuEmail || verification.userId}`,
        metadata: {
          verificationId: id,
          userId: String(verification.userId),
          userEmail: user?.kuEmail,
          userName: user?.name,
        },
      });

      return res.json({
        success: true,
        message: "Verification approved successfully",
        verification,
      });
    } catch (error) {
      console.error("Approve verification error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/verifications/:id/reject
  rejectVerification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = (req as AuthenticatedRequest).user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "User not authenticated" });
      }

      if (!reason) {
        return res.status(400).json({ success: false, error: "Rejection reason is required" });
      }

      const verification = await Verification.findById(id);
      if (!verification) {
        return res.status(404).json({ success: false, error: "Verification not found" });
      }

      if (verification.status !== "pending") {
        return res.status(400).json({ 
          success: false, 
          error: `Verification already ${verification.status}` 
        });
      }

      verification.status = "rejected";
      verification.rejectionReason = reason;
      verification.reviewedAt = new Date();
      verification.reviewedBy = new mongoose.Types.ObjectId(adminId);
      await verification.save();

      // Notify user that verification is rejected
      await createNotification(
        verification.userId,
        "system",
        "Verification Rejected",
        `Your identity verification was rejected. Reason: ${reason}`,
        "/verify-identity"
      );

      // Log admin action
      const user = await User.findById(verification.userId).select("kuEmail name").lean();
      await logActivity({
        req,
        activityType: "admin_verification_rejected",
        entityType: "verification",
        entityId: id,
        description: `Admin rejected verification for user: ${user?.kuEmail || verification.userId} - Reason: ${reason}`,
        metadata: {
          verificationId: id,
          userId: String(verification.userId),
          userEmail: user?.kuEmail,
          userName: user?.name,
          rejectionReason: reason,
        },
      });

      return res.json({
        success: true,
        message: "Verification rejected",
        verification,
      });
    } catch (error) {
      console.error("Reject verification error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/shops - Get all shop requests
  getShops = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { status } = req.query;
      const filter: { shopStatus?: string } = {};
      
      if (status && ["pending", "approved", "rejected"].includes(status as string)) {
        filter.shopStatus = status as string;
      }

      const shops = await Shop.find(filter)
        .populate("owner", "name kuEmail faculty contact")
        .sort({ shopRequestDate: -1 });

      interface PopulatedOwner {
        _id: mongoose.Types.ObjectId;
        name: string;
        kuEmail: string;
        faculty: string;
        contact: string;
      }

      return res.json({
        success: true,
        shops: shops
          .filter((s) => s.owner !== null) // Filter out shops with deleted owners
          .map((s) => {
            const owner = s.owner as unknown as PopulatedOwner;
            return {
              id: s._id,
              shopName: s.shopName,
              shopType: s.shopType,
              productCategory: s.productCategory,
              description: s.shopdescription,
              photo: s.shopPhoto,
              status: s.shopStatus,
              requestDate: s.shopRequestDate,
              approvalDate: s.shopApprovalDate,
              rejectionReason: s.shopRejectionReason,
              owner: {
                id: owner._id,
                name: owner.name,
                email: owner.kuEmail,
                faculty: owner.faculty,
                contact: owner.contact,
              },
            };
          }),
      });
    } catch (error) {
      console.error("Get shops error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/shops/:id/approve
  approveShop = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const shop = await Shop.findById(id);
      if (!shop) {
        return res.status(404).json({ success: false, error: "Shop not found" });
      }

      if (shop.shopStatus !== "pending") {
        return res.status(400).json({ 
          success: false, 
          error: `Shop already ${shop.shopStatus}` 
        });
      }

      shop.shopStatus = "approved";
      shop.shopApprovalDate = new Date();
      await shop.save();

      // Update user role to seller
      await User.findByIdAndUpdate(shop.owner, {
        role: "seller",
      });

      // Notify seller that shop is approved
      await createNotification(
        shop.owner,
        "system",
        "Shop Approved",
        "Your shop has been approved! You can now start selling items.",
        "/seller/dashboard"
      );

      // Log admin action
      const owner = await User.findById(shop.owner).select("kuEmail name").lean();
      await logActivity({
        req,
        activityType: "admin_shop_approved",
        entityType: "shop",
        entityId: id,
        description: `Admin approved shop: "${shop.shopName}" for user: ${owner?.kuEmail || shop.owner}`,
        metadata: {
          shopId: id,
          shopName: shop.shopName,
          ownerId: String(shop.owner),
          ownerEmail: owner?.kuEmail,
          ownerName: owner?.name,
        },
      });

      return res.json({
        success: true,
        message: "Shop approved successfully",
        shop,
      });
    } catch (error) {
      console.error("Approve shop error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/shops/:id/reject
  rejectShop = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ success: false, error: "Rejection reason is required" });
      }

      const shop = await Shop.findById(id);
      if (!shop) {
        return res.status(404).json({ success: false, error: "Shop not found" });
      }

      if (shop.shopStatus !== "pending") {
        return res.status(400).json({ 
          success: false, 
          error: `Shop already ${shop.shopStatus}` 
        });
      }

      shop.shopStatus = "rejected";
      shop.shopRejectionReason = reason;
      await shop.save();

      // Notify seller that shop is rejected
      await createNotification(
        shop.owner,
        "system",
        "Shop Rejected",
        `Your shop request was rejected. Reason: ${reason}`,
        "/seller/dashboard"
      );

      // Log admin action
      const owner = await User.findById(shop.owner).select("kuEmail name").lean();
      await logActivity({
        req,
        activityType: "admin_shop_rejected",
        entityType: "shop",
        entityId: id,
        description: `Admin rejected shop: "${shop.shopName}" for user: ${owner?.kuEmail || shop.owner} - Reason: ${reason}`,
        metadata: {
          shopId: id,
          shopName: shop.shopName,
          ownerId: String(shop.owner),
          ownerEmail: owner?.kuEmail,
          ownerName: owner?.name,
          rejectionReason: reason,
        },
      });

      return res.json({
        success: true,
        message: "Shop rejected",
        shop,
      });
    } catch (error) {
      console.error("Reject shop error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/stats - Get dashboard stats
  getStats = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const [
        totalUsers,
        totalVerifications,
        pendingVerifications,
        totalShops,
        pendingShops,
        pendingItems,
      ] = await Promise.all([
        User.countDocuments(),
        Verification.countDocuments(),
        Verification.countDocuments({ status: "pending" }),
        Shop.countDocuments(),
        Shop.countDocuments({ shopStatus: "pending" }),
        Item.countDocuments({ approvalStatus: "pending" }),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalVerifications,
          pendingVerifications,
          totalShops,
          pendingShops,
          pendingItems,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/users/:userId/promote - Promote user to admin
  promoteToAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(400).json({ success: false, error: "User is already an admin" });
      }

      // Check if user email is @ku.ac.th (required for admin)
      if (!/.+@ku\.ac\.th$/.test(user.kuEmail)) {
        return res.status(400).json({
          success: false,
          error: "Cannot promote user. Admin must use @ku.ac.th email address. Current email: " + user.kuEmail,
        });
      }

      user.role = "admin";
      await user.save();

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_user_promoted",
        entityType: "user",
        entityId: userId,
        description: `Admin promoted user to admin: ${user.kuEmail} (${user.name})`,
        metadata: {
          promotedUserId: userId,
          promotedUserName: user.name,
          promotedUserEmail: user.kuEmail,
          previousRole: "user",
          newRole: "admin",
        },
      });

      return res.json({
        success: true,
        message: `User ${user.name} promoted to admin`,
        user: {
          id: user._id,
          name: user.name,
          email: user.kuEmail,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Promote user error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/users/:userId/demote - Demote admin to user
  demoteAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      if (user.role !== "admin") {
        return res.status(400).json({ success: false, error: "User is not an admin" });
      }

      user.role = "user";
      await user.save();

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_user_demoted",
        entityType: "user",
        entityId: userId,
        description: `Admin demoted admin to user: ${user.kuEmail} (${user.name})`,
        metadata: {
          demotedUserId: userId,
          demotedUserName: user.name,
          demotedUserEmail: user.kuEmail,
          previousRole: "admin",
          newRole: "user",
        },
      });

      return res.json({
        success: true,
        message: `Admin ${user.name} demoted to user`,
        user: {
          id: user._id,
          name: user.name,
          email: user.kuEmail,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Demote admin error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/users - Get all users
  getUsers = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const users = await User.find({})
        .select("name kuEmail faculty contact role isVerified")
        .sort({ _id: -1 });

      return res.json({
        success: true,
        users: users.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.kuEmail,
          faculty: u.faculty,
          contact: u.contact,
          role: u.role || "user",
          isVerified: u.isVerified || false,
        })),
      });
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/bootstrap - Create first admin (only works if no admin exists)
  bootstrapAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password, faculty, contact } = req.body;

      // Check if any admin exists
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(403).json({
          success: false,
          error: "Admin already exists. Use promote endpoint instead.",
        });
      }

      // Validate required fields
      if (!name || !email || !password || !faculty || !contact) {
        return res.status(400).json({
          success: false,
          error: "All fields are required (name, email, password, faculty, contact)",
        });
      }

      // Validate admin email must be @ku.ac.th
      if (!/.+@ku\.ac\.th$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Admin email must be @ku.ac.th",
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ kuEmail: email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
        });
      }

      // Create admin user (password will be hashed by pre-save hook)
      const admin = new User({
        name,
        kuEmail: email,
        password, // Don't hash here - let pre-save hook do it
        faculty,
        contact,
        role: "admin",
        isVerified: true, // Auto-verify admin
      });

      await admin.save();

      return res.status(201).json({
        success: true,
        message: "Admin user created successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.kuEmail,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Bootstrap admin error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/admin/users/:userId - Delete any user
  deleteAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId } = req.params;
      const currentUserId = (req as AuthenticatedRequest).user?.id;
      if (!currentUserId) {
        return res.status(401).json({ success: false, error: "User not authenticated" });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, error: "Invalid user ID" });
      }

      // Prevent deleting yourself
      if (userId === currentUserId) {
        return res.status(403).json({
          success: false,
          error: "Cannot delete your own account",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Delete user
      const userName = user.name;
      const userEmail = user.kuEmail;
      const userRole = user.role;
      await User.findByIdAndDelete(userId);

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_user_deleted",
        entityType: "user",
        entityId: userId,
        description: `Admin deleted user: ${userEmail} (${userName}) - Role: ${userRole}`,
        metadata: {
          deletedUserId: userId,
          deletedUserName: userName,
          deletedUserEmail: userEmail,
          deletedUserRole: userRole,
        },
      });

      return res.json({
        success: true,
        message: `User ${userName} has been deleted`,
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/clear - Clear all admins (DEV ONLY - disabled in production)
  clearAllAdmins = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Disable in production
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({
          success: false,
          error: "This endpoint is disabled in production",
        });
      }

      const { confirmKey } = req.body;

      // Safety check - require special key
      if (confirmKey !== "CLEAR_ALL_ADMINS_CONFIRM") {
        return res.status(403).json({
          success: false,
          error: "Invalid confirmation key",
        });
      }

      const result = await User.updateMany(
        { role: "admin" },
        { $set: { role: "user" } }
      );

      return res.json({
        success: true,
        message: `Cleared ${result.modifiedCount} admin(s) [DEV ONLY]`,
        count: result.modifiedCount,
      });
    } catch (error) {
      console.error("Clear admins error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/items - Get all items for management
  getItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { approvalStatus, status } = req.query;
      const filter: { approvalStatus?: string; status?: string } = {};

      if (approvalStatus && typeof approvalStatus === "string" && ["pending", "approved", "rejected"].includes(approvalStatus)) {
        filter.approvalStatus = approvalStatus;
      }
      // No default filter - show all items if not specified

      if (status && typeof status === "string" && ["available", "reserved", "sold"].includes(status)) {
        filter.status = status;
      }

      interface PopulatedOwner {
        _id: mongoose.Types.ObjectId;
        name: string;
        kuEmail: string;
      }

      const items = await Item.find(filter)
        .populate("owner", "name kuEmail")
        .sort({ createAt: -1 });

      return res.json({
        success: true,
        items: items.map((item) => {
          const owner = item.owner as unknown as PopulatedOwner | null;
          return {
            id: item._id,
            title: item.title,
            description: item.description,
            category: item.category,
            price: item.price,
            status: item.status,
            approvalStatus: item.approvalStatus,
            photo: item.photo || [],
            owner: owner
              ? {
                  id: owner._id,
                  name: owner.name || "Unknown",
                  email: owner.kuEmail || "Unknown",
                }
              : {
                  id: item.owner as mongoose.Types.ObjectId,
                  name: "Deleted User",
                  email: "N/A",
                },
            rejectionReason: item.rejectionReason,
            createdAt: (item as unknown as { createdAt?: Date }).createdAt || item.createAt || new Date(),
            updatedAt: (item as unknown as { updatedAt?: Date }).updatedAt || item.updateAt || new Date(),
          };
        }),
      });
    } catch (error) {
      console.error("Get items error:", error);
      const errorMessage = error instanceof Error ? error.message : "Server error";
      return res.status(500).json({ success: false, error: errorMessage });
    }
  };

  // PATCH /api/admin/items/:id/approve - Approve an item
  approveItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      if (item.approvalStatus === "approved") {
        return res.status(400).json({
          success: false,
          error: "Item is already approved",
        });
      }

      item.approvalStatus = "approved";
      await item.save();

      // Notify seller that item is approved
      await createNotification(
        item.owner,
        "item",
        "Item Approved",
        `Your item "${item.title}" has been approved and is now visible in the marketplace!`,
        `/marketplace/${item._id}`
      );

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_item_approved",
        entityType: "item",
        entityId: id,
        description: `Admin approved item: "${item.title}" - Price: ${item.price} THB`,
        metadata: {
          itemId: id,
          itemTitle: item.title,
          itemPrice: item.price,
          itemCategory: item.category,
          ownerId: String(item.owner),
        },
      });

      return res.json({
        success: true,
        message: "Item approved successfully",
        item: {
          id: item._id,
          title: item.title,
          approvalStatus: item.approvalStatus,
        },
      });
    } catch (error) {
      console.error("Approve item error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/items/:id/reject - Reject an item
  rejectItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      if (item.approvalStatus === "rejected") {
        return res.status(400).json({
          success: false,
          error: "Item is already rejected",
        });
      }

      item.approvalStatus = "rejected";
      if (reason) {
        item.rejectionReason = reason;
      }
      await item.save();

      // Notify seller that item is rejected
      await createNotification(
        item.owner,
        "item",
        "Item Rejected",
        reason
          ? `Your item "${item.title}" was rejected. Reason: ${reason}`
          : `Your item "${item.title}" was rejected by an admin.`,
        "/seller/items"
      );

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_item_rejected",
        entityType: "item",
        entityId: id,
        description: `Admin rejected item: "${item.title}" - Reason: ${reason || "No reason provided"}`,
        metadata: {
          itemId: id,
          itemTitle: item.title,
          itemPrice: item.price,
          ownerId: String(item.owner),
          rejectionReason: reason || "No reason provided",
        },
      });

      return res.json({
        success: true,
        message: "Item rejected successfully",
        item: {
          id: item._id,
          title: item.title,
          approvalStatus: item.approvalStatus,
          rejectionReason: item.rejectionReason,
        },
      });
    } catch (error) {
      console.error("Reject item error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // PATCH /api/admin/items/:id - Update an item
  updateItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { title, description, price, status, category } = req.body;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      // Update fields if provided
      if (title !== undefined && typeof title === "string" && title.trim().length > 0) {
        item.title = title.trim();
      }
      if (description !== undefined && typeof description === "string") {
        item.description = description;
      }
      if (price !== undefined && typeof price === "number" && price >= 0) {
        item.price = price;
      }
      const previousStatus = item.status;
      if (status !== undefined && typeof status === "string" && ["available", "reserved", "sold"].includes(status)) {
        item.status = status as "available" | "reserved" | "sold";
      }
      if (category !== undefined && typeof category === "string" && category.trim().length > 0) {
        item.category = category.trim();
      }

      await item.save();

      // Notify seller if item status changed to sold
      if (item.status === "sold" && previousStatus !== "sold") {
        await createNotification(
          item.owner,
          "item",
          "Item Sold",
          `Congratulations! Your item "${item.title}" has been marked as sold!`,
          `/marketplace/${item._id}`
        );
      }

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_item_updated",
        entityType: "item",
        entityId: id,
        description: `Admin updated item: "${item.title}"`,
        metadata: {
          itemId: id,
          itemTitle: item.title,
          updatedFields: {
            title: title !== undefined,
            description: description !== undefined,
            price: price !== undefined,
            status: status !== undefined,
            category: category !== undefined,
          },
          previousStatus: previousStatus,
          newStatus: item.status,
        },
      });

      return res.json({
        success: true,
        message: "Item updated successfully",
        item: {
          id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          status: item.status,
          category: item.category,
          approvalStatus: item.approvalStatus,
        },
      });
    } catch (error) {
      console.error("Update item error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/admin/items/:id - Delete an item
  deleteItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const adminId = (req as AuthenticatedRequest).user?.id;

      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }

      const itemTitle = item.title;
      const itemPrice = item.price;
      const ownerId = String(item.owner);
      await Item.findByIdAndDelete(id);

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_item_deleted",
        entityType: "item",
        entityId: id,
        description: `Admin deleted item: "${itemTitle}" - Price: ${itemPrice} THB`,
        metadata: {
          itemId: id,
          itemTitle: itemTitle,
          itemPrice: itemPrice,
          ownerId: ownerId,
        },
      });

      return res.json({
        success: true,
        message: `Item "${itemTitle}" deleted successfully`,
      });
    } catch (error) {
      console.error("Delete item error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // DELETE /api/admin/reviews/:id - Delete a review (admin only)
  deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const adminId = (req as AuthenticatedRequest).user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid review ID" });
      }

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, error: "Review not found" });
      }

      // Get review info before deletion
      const reviewItem = await Item.findById(review.item).select("title").lean();
      await Review.findByIdAndDelete(id);

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_review_deleted",
        entityType: "review",
        entityId: id,
        description: `Admin deleted review for item: "${reviewItem?.title || "Unknown"}" - Rating: ${review.rating}`,
        metadata: {
          reviewId: id,
          itemId: String(review.item),
          itemTitle: reviewItem?.title || "Unknown",
          rating: review.rating,
          userId: String(review.user),
        },
      });

      return res.json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Delete review error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/reviews/item/:itemId - Get all reviews for an item (admin)
  getItemReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const adminId = (req as AuthenticatedRequest).user?.id;
      if (!adminId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { itemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ success: false, error: "Invalid item ID" });
      }

      const reviews = await Review.find({ item: itemId })
        .populate("user", "name kuEmail")
        .populate("item", "title")
        .sort({ createAt: -1 });

      interface PopulatedUser {
        _id: mongoose.Types.ObjectId;
        name?: string;
        kuEmail?: string;
      }

      interface PopulatedItem {
        _id: mongoose.Types.ObjectId;
        title?: string;
      }

      return res.json({
        success: true,
        reviews: reviews.map((review: IReview & { user: PopulatedUser | null; item: PopulatedItem | null }) => {
          const populatedUser = review.user as unknown as PopulatedUser | null;
          const populatedItem = review.item as unknown as PopulatedItem | null;
          return {
            id: review._id,
            itemId: review.item,
            itemTitle: populatedItem?.title || "Unknown Item",
            userId: review.user,
            userName: populatedUser?.name || "Deleted User",
            userEmail: populatedUser?.kuEmail || "N/A",
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            helpful: review.helpful,
            verified: review.verified,
            createdAt: (review as unknown as { createdAt?: Date }).createdAt || review.createAt,
            updatedAt: (review as unknown as { updatedAt?: Date }).updatedAt || review.updateAt,
          };
        }),
      });
    } catch (error) {
      console.error("Get item reviews error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // GET /api/admin/meetup-presets - Get all meetup presets
  getMeetupPresets = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const presets = await MeetupPreset.find()
        .sort({ order: 1, createdAt: -1 });

      return res.json({
        success: true,
        presets: presets.map((preset) => ({
          id: preset._id,
          label: preset.label,
          locationName: preset.locationName,
          address: preset.address,
          lat: preset.lat,
          lng: preset.lng,
          isActive: preset.isActive,
          order: preset.order,
          createdAt: preset.createdAt,
          updatedAt: preset.updatedAt,
        })),
      });
    } catch (error) {
      console.error("Get meetup presets error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  // POST /api/admin/meetup-presets - Create new meetup preset
  createMeetupPreset = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { label, locationName, address, lat, lng, order } = req.body;

      // Validate required fields
      if (!label || !locationName || lat === undefined || lng === undefined) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: label, locationName, lat, lng",
        });
      }

      // Validate coordinates
      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({
          success: false,
          error: "lat and lng must be numbers",
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          error: "Invalid coordinates. lat must be between -90 and 90, lng must be between -180 and 180",
        });
      }

      // Get max order if not provided
      let presetOrder = order;
      if (presetOrder === undefined) {
        const maxOrderPreset = await MeetupPreset.findOne().sort({ order: -1 });
        presetOrder = maxOrderPreset ? maxOrderPreset.order + 1 : 0;
      }

      const preset = new MeetupPreset({
        label: label.trim(),
        locationName: locationName.trim(),
        address: address ? address.trim() : undefined,
        lat,
        lng,
        order: presetOrder,
        isActive: true,
      });

      await preset.save();

      return res.status(201).json({
        success: true,
        message: "Meetup preset created successfully",
        preset: {
          id: preset._id,
          label: preset.label,
          locationName: preset.locationName,
          address: preset.address,
          lat: preset.lat,
          lng: preset.lng,
          isActive: preset.isActive,
          order: preset.order,
          createdAt: preset.createdAt,
          updatedAt: preset.updatedAt,
        },
      });
    } catch (error) {
      console.error("Create meetup preset error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

  // PATCH /api/admin/meetup-presets/:id - Update meetup preset
  updateMeetupPreset = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { label, locationName, address, lat, lng, isActive, order } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid preset ID" });
      }

      const preset = await MeetupPreset.findById(id);
      if (!preset) {
        return res.status(404).json({ success: false, error: "Meetup preset not found" });
      }

      // Update fields if provided
      if (label !== undefined) preset.label = label.trim();
      if (locationName !== undefined) preset.locationName = locationName.trim();
      if (address !== undefined) preset.address = address ? address.trim() : undefined;
      if (isActive !== undefined) preset.isActive = isActive;
      if (order !== undefined) preset.order = order;

      // Validate and update coordinates
      if (lat !== undefined || lng !== undefined) {
        const newLat = lat !== undefined ? lat : preset.lat;
        const newLng = lng !== undefined ? lng : preset.lng;

        if (typeof newLat !== "number" || typeof newLng !== "number") {
          return res.status(400).json({
            success: false,
            error: "lat and lng must be numbers",
          });
        }

        if (newLat < -90 || newLat > 90 || newLng < -180 || newLng > 180) {
          return res.status(400).json({
            success: false,
            error: "Invalid coordinates. lat must be between -90 and 90, lng must be between -180 and 180",
          });
        }

        preset.lat = newLat;
        preset.lng = newLng;
      }

      await preset.save();

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_meetup_preset_updated",
        entityType: "system",
        entityId: id,
        description: `Admin updated meetup preset: "${preset.label}" at ${preset.locationName}`,
        metadata: {
          presetId: id,
          presetLabel: preset.label,
          locationName: preset.locationName,
          address: preset.address,
          lat: preset.lat,
          lng: preset.lng,
          isActive: preset.isActive,
        },
      });

      return res.json({
        success: true,
        message: "Meetup preset updated successfully",
        preset: {
          id: preset._id,
          label: preset.label,
          locationName: preset.locationName,
          address: preset.address,
          lat: preset.lat,
          lng: preset.lng,
          isActive: preset.isActive,
          order: preset.order,
          createdAt: preset.createdAt,
          updatedAt: preset.updatedAt,
        },
      });
    } catch (error) {
      console.error("Update meetup preset error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

  // DELETE /api/admin/meetup-presets/:id - Delete meetup preset
  deleteMeetupPreset = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: "Invalid preset ID" });
      }

      const preset = await MeetupPreset.findByIdAndDelete(id);
      if (!preset) {
        return res.status(404).json({ success: false, error: "Meetup preset not found" });
      }

      // Log admin action
      await logActivity({
        req,
        activityType: "admin_meetup_preset_deleted",
        entityType: "system",
        entityId: id,
        description: `Admin deleted meetup preset: "${preset.label}" at ${preset.locationName}`,
        metadata: {
          presetId: id,
          presetLabel: preset.label,
          locationName: preset.locationName,
        },
      });

      return res.json({
        success: true,
        message: "Meetup preset deleted successfully",
      });
    } catch (error) {
      console.error("Delete meetup preset error:", error);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  };

  /**
   * GET /api/admin/activity-logs - Get activity logs with pagination and filtering
   */
  getActivityLogs = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      // Filter options
      const userId = req.query.userId as string;
      const userRole = req.query.userRole as string;
      const activityType = req.query.activityType as string;
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const search = req.query.search as string; // Search in description, userName, userEmail

      // Build filter
      const filter: Record<string, unknown> = {};

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        filter.userId = new mongoose.Types.ObjectId(userId);
      }

      if (userRole && ["buyer", "seller", "admin"].includes(userRole)) {
        filter.userRole = userRole;
      }

      if (activityType) {
        filter.activityType = activityType;
      }

      if (entityType) {
        filter.entityType = entityType;
      }

      if (entityId && mongoose.Types.ObjectId.isValid(entityId)) {
        filter.entityId = new mongoose.Types.ObjectId(entityId);
      }

      if (startDate || endDate) {
        filter.createdAt = {} as { $gte?: Date; $lte?: Date };
        if (startDate) {
          (filter.createdAt as { $gte: Date }).$gte = new Date(startDate);
        }
        if (endDate) {
          (filter.createdAt as { $lte: Date }).$lte = new Date(endDate);
        }
      }

      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: "i" } },
          { userName: { $regex: search, $options: "i" } },
          { userEmail: { $regex: search, $options: "i" } },
        ];
      }

      // Get total count for pagination
      const total = await ActivityLog.countDocuments(filter);

      // Get logs with pagination
      const logs = await ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return res.json({
        success: true,
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Get activity logs error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };

  /**
   * GET /api/admin/activity-logs/stats - Get activity log statistics
   */
  getActivityLogStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const dateFilter: Record<string, unknown> = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {} as { $gte?: Date; $lte?: Date };
        if (startDate) {
          (dateFilter.createdAt as { $gte: Date }).$gte = new Date(startDate);
        }
        if (endDate) {
          (dateFilter.createdAt as { $lte: Date }).$lte = new Date(endDate);
        }
      }

      // Get statistics
      const [
        totalLogs,
        logsByType,
        logsByRole,
        recentActivity,
      ] = await Promise.all([
        ActivityLog.countDocuments(dateFilter),
        ActivityLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$activityType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        ActivityLog.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$userRole", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        ActivityLog.find(dateFilter)
          .sort({ createdAt: -1 })
          .limit(10)
          .select("activityType userName userEmail createdAt")
          .lean(),
      ]);

      return res.json({
        success: true,
        stats: {
          totalLogs,
          logsByType: logsByType.reduce(
            (acc, item) => {
              acc[item._id] = item.count;
              return acc;
            },
            {} as Record<string, number>
          ),
          logsByRole: logsByRole.reduce(
            (acc, item) => {
              acc[item._id] = item.count;
              return acc;
            },
            {} as Record<string, number>
          ),
          recentActivity,
        },
      });
    } catch (error) {
      console.error("Get activity log stats error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  };
}

