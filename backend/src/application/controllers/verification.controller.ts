import { Request, Response } from "express";
import Verification from "../../data/models/Verification";
import { uploadToCloudinary } from "../../lib/cloudinary";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/authentication";

export default class VerificationController {
    userRequestVerification = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }
            const { documentType } = req.body;

            // Validate document type
            if (!documentType || !["student_id", "citizen_id"].includes(documentType)) {
                return res.status(400).json({ 
                    error: "Invalid document type. Must be 'student_id' or 'citizen_id'" 
                });
            }

            // Check if user already has a pending verification
            const existingVerification = await Verification.findOne({ 
                userId: new mongoose.Types.ObjectId(userId),
                status: "pending"
            });

            if (existingVerification) {
                return res.status(400).json({ 
                    error: "You already have a pending verification request",
                    verificationId: existingVerification._id,
                    submittedAt: existingVerification.createdAt
                });
            }

            // Check if user already has an approved verification
            const approvedVerification = await Verification.findOne({ 
                userId: new mongoose.Types.ObjectId(userId),
                status: "approved"
            });

            if (approvedVerification) {
                return res.status(400).json({ 
                    error: "You are already verified",
                    verificationId: approvedVerification._id,
                    approvedAt: approvedVerification.reviewedAt
                });
            }

            // Handle file upload
            if (!req.file) {
                return res.status(400).json({ error: "No document file uploaded" });
            }

            // Upload document to Cloudinary
            const documentUrl = await uploadToCloudinary(req.file.buffer, "verification-documents");

            // Create verification request
            const verification = new Verification({
                userId: new mongoose.Types.ObjectId(userId),
                documentType,
                documentUrl,
                status: "pending"
            });

            await verification.save();

            return res.status(201).json({
                success: true,
                message: "Verification request submitted successfully",
                verification: {
                    id: verification._id,
                    documentType: verification.documentType,
                    status: verification.status,
                    submittedAt: verification.createdAt
                }
            });

        } catch (err: unknown) {
            console.error("Verification request error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }

    getUserVerificationStatus = async(req: Request, res: Response) => {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                return res.status(401).json({ error: "User not authenticated" });
            }

            const verification = await Verification.findOne({ 
                userId: new mongoose.Types.ObjectId(userId) 
            }).sort({ createdAt: -1 });

            if (!verification) {
                return res.status(404).json({ 
                    error: "No verification request found",
                    message: "Please submit a verification request first"
                });
            }

            return res.status(200).json({
                success: true,
                verification: {
                    id: verification._id,
                    documentType: verification.documentType,
                    status: verification.status,
                    submittedAt: verification.createdAt,
                    reviewedAt: verification.reviewedAt,
                    rejectionReason: verification.rejectionReason
                }
            });

        } catch (err: unknown) {
            console.error("Get verification status error:", err);
            const message = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ error: message });
        }
    }
}