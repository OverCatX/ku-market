import { Request, Response } from "express";
import User from "../../data/models/User";

interface AuthenticatedRequest extends Request {
  userId: string;
}

export default class ProfileController {
    userView = async (req: Request, res: Response) =>{
        try {
            const user = await User.findById((req as AuthenticatedRequest).userId).select("-password -__v");
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
            const { name, faculty, contact } = req.body;
            const user = await User.findByIdAndUpdate(
              (req as AuthenticatedRequest).userId,
              { name, faculty, contact },
              { new: true, runValidators: true }
            ).select("-password -__v");
            if (!user){
                return res.status(404).json({ error: "User not found" });
            } 
            return res.json(user);

          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message });
          }
    }
}