import { Request, Response } from "express";
import Verification from "../../data/models/Verification";
import Shop from "../../data/models/Shop";
import User from "../../data/models/User";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

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
      ] = await Promise.all([
        User.countDocuments(),
        Verification.countDocuments(),
        Verification.countDocuments({ status: "pending" }),
        Shop.countDocuments(),
        Shop.countDocuments({ shopStatus: "pending" }),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalVerifications,
          pendingVerifications,
          totalShops,
          pendingShops,
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

      user.role = "admin";
      await user.save();

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
      await User.findByIdAndDelete(userId);

      return res.json({
        success: true,
        message: `User ${user.name} has been deleted`,
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
}

