import { Request, Response, NextFunction } from "express";
import Joi from 'joi';

const updateProfileSchema = Joi.object({
    name: Joi.string().optional().messages({
        "string.base": "Name must be a string"
    }),

    faculty: Joi.string().optional().messages({
        "string.base": "Name must be a string"
    }),

    contact: Joi.string().pattern(/^0\d{9}$/).optional().messages({
        "string.pattern.base": "Contact must be a valid phone number (10 digits, starting with 0)"
    }),
})

export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.message });
    }
    next();
  };

