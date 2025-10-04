import { Router, Request, Response } from "express";
import User, { IUser } from "../../data/models/User";

export default class ProfileController {
    userView = async (req: Request, res: Response) =>{
        try {
            const user = await User.findById((req as any).userId).select("-password -__v");
            if (!user){
                return res.status(404).json({ error: "User not found" });
            }
            return res.json(user);

          } catch (err: any) {
            return res.status(500).json({ error: err.message });
          }
    }

    userUpdate = async (req: Request, res: Response) =>{
        try {
            const { name, faculty, contact } = req.body;
            const user = await User.findByIdAndUpdate(
              (req as any).userId,
              { name, faculty, contact },
              { new: true, runValidators: true }
            ).select("-password -__v");
            if (!user){
                return res.status(404).json({ error: "User not found" });
            } 
            return res.json(user);

          } catch (err: any) {
            return res.status(400).json({ error: err.message });
          }
    }
}