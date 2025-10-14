import { Request, Response } from "express";
import User from "../../data/models/User";
import jwt from "jsonwebtoken";

export default class AuthController {
    userSignup = async(req: Request, res: Response) =>{
        const {name, kuEmail, password, confirm_password, faculty, contact} = req.body;

        try {
            const userEmailexist = await User.findOne({kuEmail});

            if (userEmailexist){
                return res.status(400).json({ message: "Email is already registered"})
            }

            const userContactExist = await User.findOne({contact})

            if (userContactExist){
                return res.status(400).json({message : "Phone number is already existed"})
            }

            if (password !== confirm_password){
                return res.status(400).json({message : "Password and Confirm password do not match"})
            }

            const user = new User({name, kuEmail, password, faculty, contact});
            await user.save();

            return res.status(201).json({message: "User created successfully"})
            
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message })
        }
    }

    userLogin = async(req: Request, res: Response ,) => {
        const {kuEmail, password} = req.body;

        try {
            const user = await User.findOne({kuEmail});

            if (!user){
                return res.status(404).json({ error : "Email is not found"})
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch){
                return res.status(400).json({ error : "Invalid credentials"})
            }

            const token = jwt.sign({id : user._id}, process.env.JWT_SECRET || "secret", {expiresIn: "1h"} )
            return res.json({token})
            
        } catch (err : unknown) {
            const message = err instanceof Error ? err.message : "Bad request";
            return res.status(400).json({ error: message });
        }
    }
}