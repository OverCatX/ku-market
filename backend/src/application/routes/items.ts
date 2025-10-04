import express from "express";
import { upload } from "../../lib/upload";
import { uploadToCloudinary } from "../../lib/cloudinary";
import Item, { IItem } from "../../data/models/Item"
import mongoose, { FilterQuery, PipelineStage } from "mongoose";

const router = express.Router();

router.post("/create", upload.array("photos", 5), async (req, res) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: "No image files uploaded" });
        }

        const files = req.files as Express.Multer.File[];
        
        if (files.length > 5) {
            return res.status(400).json({ 
                error: "Too munknown files. Maximum 5 photos allowed.",
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
            owner: req.body.owner ? new mongoose.Types.ObjectId(req.body.owner) : undefined,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            price: Number(req.body.price),
            status: "available",
            photo: imageUrls,
        };

        const item = await Item.create(newItem);

        res.status(201).json({ 
            success: true, 
            item,
            uploadedPhotos: imageUrls.length,
            message: `Item created successfully with ${imageUrls.length} photo(s)`
        });

    } catch (err: unknown) {
        console.error("Create item error:", err);
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) || "Server error" });
    }
});

router.patch("/update/:id", upload.single("image"), async (req, res) => {
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

        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.price !== undefined) updateData.price = Number(req.body.price);
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.owner !== undefined) {
            updateData.owner = new mongoose.Types.ObjectId(req.body.owner);
        }

        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            updateData.photo = [imageUrl];
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, item: updatedItem });
    } catch (err: unknown) {
        console.error("Patch error:", err);
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) || "Server error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
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

        res.status(200).json({ 
            success: true, 
            message: "Item deleted successfully",
            deletedItem: existingItem 
        });
    } catch (err: unknown) {
        console.error("Delete error:", err);
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) || "Server error" });
    }
});

router.get("/list", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10)); 
        const skip = (page - 1) * limit;
        
        const filters: FilterQuery<IItem> = {};
        
        if (req.query.status && ["available", "reserved", "sold"].includes(req.query.status as string)) {
            filters.status = req.query.status;
        }
        
        if (req.query.category) {
            filters.category = new RegExp(req.query.category as string, 'i'); 
        }
        
        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filters.price = {};
            if (req.query.minPrice) {
                filters.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filters.price.$lte = Number(req.query.maxPrice);
            }
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
        let sortOption: unknown = { createAt: -1 };
        
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
            { $sort: sortOption as Record<string, 1 | -1> },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerInfo",
                pipeline: [{ $project: { name: 1, email: 1 } }],
              },
            },
            {
              $addFields: {
                owner: { $arrayElemAt: ["$ownerInfo", 0] },
              },
            },
            {
              $project: {
                ownerInfo: 0,
                __v: 0,
              },
            },
          ];
        
        const [items, totalCount] = await Promise.all([
            Item.aggregate(pipeline),
            Item.countDocuments(filters)
        ]);
        
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        res.status(200).json({
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
        res.status(500).json({ error: err instanceof Error ? err.message : String(err) || "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid item ID format" 
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

        res.status(200).json({ 
            success: true, 
            item 
        });

    } catch (err: unknown) {
        console.error("Get item by ID error:", err);
        res.status(500).json({ 
            success: false,
            error: err instanceof Error ? err.message : String(err) || "Server error" 
        });
    }
});

export default router;