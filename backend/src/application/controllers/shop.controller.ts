import { Request, Response } from "express";
import Shop from "../../data/models/Shop";
import User from "../../data/models/User";
import { uploadToCloudinary } from "../../lib/cloudinary";
import mongoose, { FilterQuery, PipelineStage } from "mongoose";

interface AuthenticatedRequest extends Request {
    userId: string;
}

export default class ShopController {
    userRequestShop = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).userId;
            // Check if user exists and has seller role
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (user.role !== "seller") {
                return res.status(403).json({ error: "You are not authorized to request a shop" });
            }
            
            const { shopName, shopType, productCategory, shopdescription } = req.body;

            // Validate required fields
            if (!shopName || !shopType || !productCategory || !shopdescription) {
                return res.status(400).json({ error: "All fields are required" });
            }

            // Validate productCategory is an array
            let categories: string[];
            try {
                categories = Array.isArray(productCategory) ? productCategory : JSON.parse(productCategory);
            } catch {
                return res.status(400).json({ error: "Product category must be a valid array" });
            }
            // Check for existing pending shop
            const existingShop = await Shop.findOne({ 
                owner: new mongoose.Types.ObjectId(userId), 
                shopStatus: "pending" 
            });
            if (existingShop) {
                return res.status(400).json({ 
                    error: "You already have a pending shop request",
                    shopId: existingShop._id,
                    submittedAt: existingShop.shopRequestDate
                });
            }

            // Check for existing approved shop
            const approvedShop = await Shop.findOne({ 
                owner: new mongoose.Types.ObjectId(userId), 
                shopStatus: "approved" 
            });
            if (approvedShop) {
                return res.status(400).json({ 
                    error: "You already have an approved shop",
                    shopId: approvedShop._id,
                    approvedAt: approvedShop.shopApprovalDate
                });
            }

            // Handle file upload
            let shopPhoto: string = "";
            if (req.file) {
                try {
                    shopPhoto = await uploadToCloudinary(req.file.buffer, "shop-photos");
                } catch (uploadError) {
                    console.error("Failed to upload shop photo:", uploadError);
                    return res.status(500).json({ 
                        error: "Failed to upload shop photo",
                        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                    });
                }
            } else {
                return res.status(400).json({ error: "Shop photo is required" });
            }

            // Create shop
            const shop = new Shop({
                owner: new mongoose.Types.ObjectId(userId),
                shopName: shopName.trim(),
                shopType: shopType.trim(),
                productCategory: categories,
                shopdescription: shopdescription.trim(),
                shopPhoto: shopPhoto,
                shopStatus: "pending",
                shopRequestDate: new Date()
            });

            await shop.save();

            return res.status(201).json({
                success: true,
                message: "Shop request submitted successfully",
                shop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopType: shop.shopType,
                    productCategory: shop.productCategory,
                    shopStatus: shop.shopStatus,
                    shopRequestDate: shop.shopRequestDate,
                    shopPhoto: shop.shopPhoto
                }
            });

        } catch (err: unknown) {
            console.error("Shop request error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    userUpdateShop = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).userId;
            const { shopName, shopType, productCategory, shopdescription } = req.body;

            const shop = await Shop.findOne({ owner: new mongoose.Types.ObjectId(userId) });
            if (!shop) {
                return res.status(404).json({ error: "Shop not found" });
            }

            if (shop.shopStatus === "rejected") {
                return res.status(400).json({ 
                    error: "You cannot update your rejected shop",
                    rejectionReason: shop.shopRejectionReason
                });
            }

            if (shop.shopStatus === "pending") {
                return res.status(400).json({ 
                    error: "You cannot update your pending shop. Please wait for admin approval.",
                    submittedAt: shop.shopRequestDate
                });
            }

            // Only allow updates for approved shops
            if (shop.shopStatus !== "approved") {
                return res.status(400).json({ error: "Only approved shops can be updated" });
            }

            // Update fields if provided
            if (shopName) shop.shopName = shopName.trim();
            if (shopType) shop.shopType = shopType.trim();
            if (shopdescription) shop.shopdescription = shopdescription.trim();
            
            if (productCategory) {
                try {
                    const categories = Array.isArray(productCategory) ? productCategory : JSON.parse(productCategory);
                    shop.productCategory = categories;
                } catch {
                    return res.status(400).json({ error: "Product category must be a valid array" });
                }
            }

            // Handle photo updates
            if (req.file) {
                try {
                    const newPhoto = await uploadToCloudinary(req.file.buffer, "shop-photos");
                    shop.shopPhoto = newPhoto;
                } catch (uploadError) {
                    console.error("Failed to upload shop photo:", uploadError);
                    return res.status(500).json({ 
                        error: "Failed to upload shop photo",
                        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                    });
                }
            }

            await shop.save();

            return res.status(200).json({
                success: true,
                message: "Shop updated successfully",
                shop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopType: shop.shopType,
                    productCategory: shop.productCategory,
                    shopStatus: shop.shopStatus,
                    hasPhoto: !!shop.shopPhoto
                }
            });

        } catch (err: unknown) {
            console.error("Shop update error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    userDeleteShop = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).userId;
            const shop = await Shop.findOne({ owner: new mongoose.Types.ObjectId(userId) });
            
            if (!shop) {
                return res.status(404).json({ error: "Shop not found" });
            }

            await Shop.findByIdAndDelete(shop._id);
            
            return res.status(200).json({
                success: true,
                message: "Shop deleted successfully",
                deletedShop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopStatus: shop.shopStatus
                }
            });
        } catch (err: unknown) {
            console.error("Shop delete error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    userGetShop = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).userId;
            const shop = await Shop.findOne({ owner: new mongoose.Types.ObjectId(userId) })
                .populate('owner', 'name kuEmail');
            
            if (!shop) {
                return res.status(404).json({ 
                    error: "Shop not found",
                    message: "You haven't created a shop yet"
                });
            }

            return res.status(200).json({
                success: true,
                shop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopType: shop.shopType,
                    productCategory: shop.productCategory,
                    shopdescription: shop.shopdescription,
                    shopPhoto: shop.shopPhoto,
                    shopStatus: shop.shopStatus,
                    shopRequestDate: shop.shopRequestDate,
                    shopApprovalDate: shop.shopApprovalDate,
                    shopRejectionReason: shop.shopRejectionReason,
                    owner: shop.owner,
                    createdAt: shop.createdAt,
                    updatedAt: shop.updatedAt
                }
            });
        } catch (err: unknown) {
            console.error("Shop get error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    getAllShops = async(req: Request, res: Response) => {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
            const skip = (page - 1) * limit;

            const filters: FilterQuery<any> = {
                shopStatus: 'approved' // Only show approved shops by default
            };

            // Add filters
            if (req.query.shopType) {
                filters.shopType = new RegExp(req.query.shopType as string, 'i');
            }

            if (req.query.productCategory) {
                filters.productCategory = { $in: [new RegExp(req.query.productCategory as string, 'i')] };
            }

            if (req.query.search) {
                filters.$or = [
                    { shopName: new RegExp(req.query.search as string, 'i') },
                    { shopdescription: new RegExp(req.query.search as string, 'i') }
                ];
            }

            // Allow admin to see all shops including pending/rejected
            if (req.query.showAll === 'true') {
                delete filters.shopStatus;
            }

            // Sorting
            let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
            if (req.query.sortBy) {
                const sortBy = req.query.sortBy as string;
                const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
                
                switch (sortBy) {
                    case 'shopName':
                        sortOption = { shopName: sortOrder };
                        break;
                    case 'createdAt':
                        sortOption = { createdAt: sortOrder };
                        break;
                    case 'shopApprovalDate':
                        sortOption = { shopApprovalDate: sortOrder };
                        break;
                }
            }

            const pipeline: PipelineStage[] = [
                { $match: filters },
                { $sort: sortOption },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "ownerInfo",
                        pipeline: [
                            { $project: { name: 1, kuEmail: 1, faculty: 1 } }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: { $arrayElemAt: ["$ownerInfo", 0] }
                    }
                },
                {
                    $project: {
                        ownerInfo: 0,
                        __v: 0
                    }
                }
            ];

            const [shops, totalCount] = await Promise.all([
                Shop.aggregate(pipeline),
                Shop.countDocuments(filters)
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            return res.status(200).json({
                success: true,
                data: {
                    shops,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: totalCount,
                        itemsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                        nextPage: page < totalPages ? page + 1 : null,
                        prevPage: page > 1 ? page - 1 : null
                    }
                }
            });
        } catch (err: unknown) {
            console.error("Get all shops error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    // Admin methods for shop approval
    getPendingShops = async(req: Request, res: Response) => {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
            const skip = (page - 1) * limit;

            const pipeline: PipelineStage[] = [
                { $match: { shopStatus: 'pending' } },
                { $sort: { shopRequestDate: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "ownerInfo",
                        pipeline: [
                            { $project: { name: 1, kuEmail: 1, faculty: 1, sellerStatus: 1 } }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: { $arrayElemAt: ["$ownerInfo", 0] }
                    }
                },
                {
                    $project: {
                        ownerInfo: 0,
                        __v: 0
                    }
                }
            ];

            const [shops, totalCount] = await Promise.all([
                Shop.aggregate(pipeline),
                Shop.countDocuments({ shopStatus: 'pending' })
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            return res.status(200).json({
                success: true,
                data: {
                    shops,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: totalCount,
                        itemsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (err: unknown) {
            console.error("Get pending shops error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    approveShop = async(req: Request, res: Response) => {
        try {
            const { shopId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(shopId)) {
                return res.status(400).json({ error: "Invalid shop ID" });
            }

            const shop = await Shop.findById(shopId).populate('owner', 'name kuEmail sellerStatus');
            if (!shop) {
                return res.status(404).json({ error: "Shop not found" });
            }

            if (shop.shopStatus !== 'pending') {
                return res.status(400).json({ 
                    error: "Shop status is not pending",
                    currentStatus: shop.shopStatus
                });
            }

            // Check if the owner is an approved seller
            const owner = shop.owner as any;
            if (owner.sellerStatus !== 'approved') {
                return res.status(400).json({ 
                    error: "Shop owner is not an approved seller",
                    ownerStatus: owner.sellerStatus
                });
            }

            shop.shopStatus = 'approved';
            shop.shopApprovalDate = new Date();
            await shop.save();

            return res.status(200).json({
                success: true,
                message: "Shop approved successfully",
                shop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopType: shop.shopType,
                    shopStatus: shop.shopStatus,
                    shopApprovalDate: shop.shopApprovalDate,
                    owner: shop.owner
                }
            });
        } catch (err: unknown) {
            console.error("Approve shop error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    rejectShop = async(req: Request, res: Response) => {
        try {
            const { shopId } = req.params;
            const { reason } = req.body;

            if (!mongoose.Types.ObjectId.isValid(shopId)) {
                return res.status(400).json({ error: "Invalid shop ID" });
            }

            if (!reason || reason.trim().length === 0) {
                return res.status(400).json({ error: "Rejection reason is required" });
            }

            const shop = await Shop.findById(shopId).populate('owner', 'name kuEmail');
            if (!shop) {
                return res.status(404).json({ error: "Shop not found" });
            }

            if (shop.shopStatus !== 'pending') {
                return res.status(400).json({ 
                    error: "Shop status is not pending",
                    currentStatus: shop.shopStatus
                });
            }

            shop.shopStatus = 'rejected';
            shop.shopRejectionReason = reason.trim();
            await shop.save();

            return res.status(200).json({
                success: true,
                message: "Shop rejected successfully",
                shop: {
                    id: shop._id,
                    shopName: shop.shopName,
                    shopStatus: shop.shopStatus,
                    shopRejectionReason: shop.shopRejectionReason,
                    owner: shop.owner
                }
            });
        } catch (err: unknown) {
            console.error("Reject shop error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }
}

  