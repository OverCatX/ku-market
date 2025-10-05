import { Request, Response, NextFunction } from "express";
import Joi from 'joi';
import multer from "multer";
import { upload } from "../../../lib/upload";


const createItemSchema = Joi.object({
    title: Joi.string().max(100).required().messages({
        "string.empty" : "Title is required"
    }),
    description: Joi.string().max(4000).optional(),
    category: Joi.string().required().messages({
        "string.empty" : "Category is required"
    }),
    price: Joi.number().invalid(NaN).min(0).required().messages({
        "number.empty" : "Price is required",
        "number.base": "Price must be a number",
        "number.min": "Price cannot be negative"
    }),
    status: Joi.string().valid('available', 'reserved', 'sold').optional().messages({
        "any.only": "Status must be one of 'available', 'reserved', or 'sold'"
    }),
});

const updateItemSchema = Joi.object({
    title: Joi.string().max(100).optional().messages({
        "string.empty" : "Title is required"
    }),
    description: Joi.string().max(4000).optional(),
    category: Joi.string().optional().messages({
        "string.empty" : "Category is required"
    }),
    price: Joi.number().invalid(NaN).min(0).optional().messages({
        "number.empty" : "Price is required",
        "number.base": "Price must be a number",
        "number.min": "Price cannot be negative"
    }),
    status: Joi.string().valid('available', 'reserved', 'sold').optional().messages({
        "any.only": "Status must be one of 'available', 'reserved', or 'sold'"
    }),
});

export const createItem = async(req: Request, res: Response, next: NextFunction) =>{
    const {error} = createItemSchema.validate(req.body, { allowUnknown: true });
    if (error) {
        return res.status(400).json({ errors: error.message });
    } else next()
}

export const updateItem = async(req: Request, res: Response, next: NextFunction) =>{
    const {error} = updateItemSchema.validate(req.body, { allowUnknown: true });
    if (error) {
        return res.status(400).json({ errors: error.message });
    } else next()
}

export const uploadFiles = (field: string, maxCount: number, required: boolean = true) => {
    return (req: Request, res: Response, next: NextFunction) => {
        upload.array(field, maxCount)(req, res, (err) => {
            if (err) {
                
                if (err instanceof multer.MulterError) {
                    if (err.code === "LIMIT_UNEXPECTED_FILE") {
                        return res.status(400).json({
                            error: `Too many files uploaded. Maximum ${maxCount} photos allowed.`,
                        });
                    }
                    return res.status(400).json({ error: err.message });
                }
                
                // Handle boundary not found error (empty multipart request)
                if (err.message && err.message.includes('Boundary not found')) {
                    if (!required) {
                        return next();
                    }
                    return res.status(400).json({ error: "No image files uploaded" });
                }
                
                return res.status(500).json({ 
                    error: "Server error during file upload",
                    details: err instanceof Error ? err.message : String(err)
                });
            }
            
            // If files are required but none uploaded, return error
            if (required && (!req.files || (req.files as Express.Multer.File[]).length === 0)) {
                return res.status(400).json({ error: "No image files uploaded" });
            }
            
            next();
        });
    };
};