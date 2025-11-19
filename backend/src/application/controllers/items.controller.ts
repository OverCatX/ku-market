import {Request, Response } from "express";
import { uploadToCloudinary } from "../../lib/cloudinary";
import Item, { IItem } from "../../data/models/Item"
import mongoose, { FilterQuery, PipelineStage } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";

export default class ItemController {
    userUpload = async(req: Request, res: Response) => {
        try {
            // Get authenticated user ID
            const userId = (req as AuthenticatedRequest).user?.id;
            
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }

            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.status(400).json({ error: "No image files uploaded" });
            }
    
            const files = req.files as Express.Multer.File[];
            
            if (files.length > 5) {
                return res.status(400).json({ 
                    error: "Too many files. Maximum 5 photos allowed.",
                    uploaded: files.length,
                    maximum: 5
                });
            }
    
            const imageUrls: string[] = [];
            
            for (let i = 0; i < files.length; i++) {
                try {
                    console.log(`Uploading image ${i + 1}/${files.length}...`);
                    const imageUrl = await uploadToCloudinary(files[i].buffer);
                    imageUrls.push(imageUrl);
                } catch (uploadError) {
                    console.error(`Failed to upload image ${i + 1}:`, uploadError);
                    return res.status(500).json({ 
                        error: `Failed to upload image ${i + 1}`,
                        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                    });
                }
            }
    
            const newItem: Partial<IItem> = {
                owner: new mongoose.Types.ObjectId(userId), // Use authenticated user ID
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                price: Number(req.body.price),
                status: req.body.status || "available",
                approvalStatus: "pending", // New items need admin approval
                photo: imageUrls,
            };
    
            const item = await Item.create(newItem);
    
            return res.status(201).json({ 
                success: true, 
                item,
                uploadedPhotos: imageUrls.length,
                message: `Item created successfully with ${imageUrls.length} photo(s)`
            });
    
        } catch (err: unknown) {
            console.error("Create item error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    };

    userUpdatePicture = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
    
            const existingItem = await Item.findById(id);
            if (!existingItem) {
                return res.status(404).json({ error: "Item not found" });
            }
    
            const updateData: Partial<IItem> = {};
            let hasChanges = false;
    
            // Check each field and only add if it's different from existing
            if (req.body.title !== undefined && req.body.title !== existingItem.title) {
                updateData.title = req.body.title;
                hasChanges = true;
            }
            if (req.body.description !== undefined && req.body.description !== existingItem.description) {
                updateData.description = req.body.description;
                hasChanges = true;
            }
            if (req.body.category !== undefined && req.body.category !== existingItem.category) {
                updateData.category = req.body.category;
                hasChanges = true;
            }
            if (req.body.price !== undefined && Number(req.body.price) !== existingItem.price) {
                updateData.price = Number(req.body.price);
                hasChanges = true;
            }
            if (req.body.status !== undefined && req.body.status !== existingItem.status) {
                updateData.status = req.body.status;
                hasChanges = true;
            }
            if (req.body.owner !== undefined && req.body.owner !== existingItem.owner?.toString()) {
                updateData.owner = new mongoose.Types.ObjectId(req.body.owner);
                hasChanges = true;
            }
    
            const files = req.files as Express.Multer.File[];
    
            if (files && files.length > 0) {
                const imageUrl = await Promise.all(files.map(file => uploadToCloudinary(file.buffer)));
                updateData.photo = imageUrl;
                hasChanges = true;
            }
    
            if (!hasChanges) {
                return res.status(400).json({ 
                    error: "No changes detected",
                    message: "The provided values are the same as the existing item"
                });
            }
    
            const updatedItem = await Item.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
    
            return res.status(200).json({ 
                success: true, 
                item: updatedItem,
                message: "Item updated successfully"
            });
        } catch (err: unknown) {
            console.error("Patch error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    };

    userDeletePicture = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
    
            const existingItem = await Item.findById(id);
            if (!existingItem) {
                return res.status(404).json({ error: "Item not found" });
            }
    
            await Item.findByIdAndDelete(id);
    
            return res.status(200).json({ 
                success: true, 
                message: "Item deleted successfully",
                deletedItem: existingItem 
            });
        } catch (err: unknown) {
            console.error("Delete error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    userGetList = async(req: Request, res: Response) => {
        try {
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10)); 
            const skip = (page - 1) * limit;
            
            const filters: FilterQuery<IItem> = {};
            
            // Only show approved items in marketplace
            filters.approvalStatus = "approved";
            
            if (req.query.status && ["available", "reserved", "sold"].includes(req.query.status as string)) {
                filters.status = req.query.status;
            }
            
            if (req.query.category) {
                filters.category = new RegExp(req.query.category as string, 'i'); 
            }
            
            // Price range filter
            if (req.query.minPrice || req.query.maxPrice) {
                const priceFilter: { $gte?: number; $lte?: number } = {};
                if (req.query.minPrice) {
                    priceFilter.$gte = Number(req.query.minPrice);
                }
                if (req.query.maxPrice) {
                    priceFilter.$lte = Number(req.query.maxPrice);
                }
                filters.price = priceFilter as unknown as number;
            }
            
            // Owner filter
            if (req.query.owner && mongoose.Types.ObjectId.isValid(req.query.owner as string)) {
                filters.owner = new mongoose.Types.ObjectId(req.query.owner as string);
            }
            
            // Search in title and description
            if (req.query.search) {
                filters.$text = { $search: req.query.search as string };
            }
            
            // Sorting
            let sortOption: Record<string, 1 | -1 | { $meta: "textScore" }> = { createAt: -1 } as const;
            
            if (req.query.sortBy) {
                const sortBy = req.query.sortBy as string;
                const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
                
                switch (sortBy) {
                    case 'price':
                        sortOption = { price: sortOrder };
                        break;
                    case 'title':
                        sortOption = { title: sortOrder };
                        break;
                    case 'createAt':
                        sortOption = { createAt: sortOrder };
                        break;
                    case 'updateAt':
                        sortOption = { updateAt: sortOrder };
                        break;
                    case 'relevance':
                        if (req.query.search) {
                            sortOption = { score: { $meta: "textScore" } };
                        }
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
                            { $project: { name: 1, email: 1 } }
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
            
            const [items, totalCount] = await Promise.all([
                Item.aggregate(pipeline),
                Item.countDocuments(filters)
            ]);
            
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            return res.status(200).json({
                success: true,
                data: {
                    items,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalItems: totalCount,
                        itemsPerPage: limit,
                        hasNextPage,
                        hasPrevPage,
                        nextPage: hasNextPage ? page + 1 : null,
                        prevPage: hasPrevPage ? page - 1 : null
                    }
                }
            });
            
        } catch (err: unknown) {
            console.error("List items error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    userGet = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid item ID" 
                });
            }
    
            // Find the item and populate owner details
            const item = await Item.findById(id).populate('owner', 'name email');
            
            if (!item) {
                return res.status(404).json({ 
                    success: false,
                    error: "Item not found" 
                });
            }
    
            return res.status(200).json({ 
                success: true, 
                item 
            });
    
        } catch (err: unknown) {
            console.error("Get item by ID error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ 
                success: false,
                error: message 
            });
        }
    }
}