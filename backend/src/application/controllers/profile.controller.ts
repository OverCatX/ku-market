import { Request, Response } from "express";
import User from "../../data/models/User";
import { AuthenticatedRequest } from "../middlewares/authentication";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default class ProfileController {
    userView = async (req: Request, res: Response) =>{
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            const user = await User.findById(userId).select("-password -__v");
            if (!user){
                return res.status(404).json({ error: "User not found" });
            }
            return res.json(user);

          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Internal server error";
            return res.status(500).json({ error: message });
          }
    }

    userUpdate = async (req: Request, res: Response) =>{
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            
            const { name, faculty, contact } = req.body;
            const updateData: { name?: string; faculty?: string; contact?: string; profilePicture?: string } = {};
            
            if (name !== undefined) updateData.name = name;
            if (faculty !== undefined) updateData.faculty = faculty;
            if (contact !== undefined) updateData.contact = contact;
            
            // Handle profile picture upload
            // Note: upload.single() stores file in req.file, not req.files
            const file = (req as { file?: Express.Multer.File }).file;
            if (file) {
                try {
                    const imageUrl = await uploadToCloudinary(file.buffer, "profiles");
                    updateData.profilePicture = imageUrl;
                } catch (uploadError) {
                    return res.status(500).json({ 
                        error: "Failed to upload profile picture",
                        details: uploadError instanceof Error ? uploadError.message : "Unknown error"
                    });
                }
            }
            
            const user = await User.findByIdAndUpdate(
              userId,
              updateData,
              { new: true, runValidators: true }
            ).select("-password -__v");
            if (!user){
                return res.status(404).json({ error: "User not found" });
            }
            
            // Ensure profilePicture is included in response
            const userResponse = user.toObject();
            return res.json(userResponse);

          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message });
          }
    }
}