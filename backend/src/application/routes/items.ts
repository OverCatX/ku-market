import express from "express";
import { upload } from "../../lib/upload";
import { uploadToCloudinary } from "../../lib/cloudinary";
import Item, { IItem } from "../../data/models/Item"
import mongoose from "mongoose";

const router = express.Router();

router.post("/create", upload.single("photo"), async (req, res) => {
    try {
        if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
        }

        const imageUrl = await uploadToCloudinary(req.file.buffer);

        const newItem: Partial<IItem> = {
        owner: req.body.owner ? new mongoose.Types.ObjectId(req.body.owner) : undefined, // make sure you send owner ID
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: Number(req.body.price),
        status: "available",
        photo: [imageUrl],
        };
        const item = await Item.create(newItem);

        res.status(201).json({ success: true, item });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || "Server error" });
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
    } catch (err: any) {
        console.error("Patch error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    console.log("DELETE /delete/:id hit");
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
    } catch (err: any) {
        console.error("Delete error:", err);
        res.status(500).json({ error: err.message || "Server error" });
    }
});

export default router;
