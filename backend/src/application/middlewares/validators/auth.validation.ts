import { Request, Response, NextFunction } from "express";
import Joi from 'joi';

export const userSignup = (req: Request, res: Response, next: NextFunction) => {
    const scheme = Joi.object({
        name: Joi.string().required().trim().min(2).max(100).messages({
            "string.empty": "Name is required",
            "string.min": "Name must be at least 2 characters",
            "string.max": "Name must not exceed 100 characters"
        }),
        kuEmail: Joi.string().required().trim().email().pattern(/.+@ku\.ac\.th$/).messages({
            "string.empty": "KU email is required",
            "string.email": "Please enter a valid email address",
            "string.pattern.base": "Email must be a valid @ku.ac.th email address"
        }),
        password: Joi.string().required().min(6).messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters"
        }),
        confirm_password: Joi.string().required().valid(Joi.ref('password')).messages({
            "string.empty": "Confirm password is required",
            "any.only": "Passwords must match"
        }),
        faculty: Joi.string().required().trim().messages({
            "string.empty": "Faculty is required"
        }),
        contact: Joi.string().pattern(/^0\d{9}$/).required().messages({
            "string.empty": "Contact is required",
            "string.pattern.base": "Contact must be a valid phone number (10 digits, starting with 0)"
        })
    })

    const payload = req.body;

    const {error, value} = scheme.validate(payload, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error){
        // Get the first error message
        const firstError = error.details[0];
        return res.status(400).json({
            success: false,
            error: firstError.message
        })
    }
    
    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
}

export const userLogin = (req: Request, res: Response, next: NextFunction) => {
    const scheme = Joi.object({
        kuEmail: Joi.string().required().trim().email().pattern(/.+@ku\.ac\.th$/).messages({
            "string.empty": "KU email is required",
            "string.email": "Please enter a valid email address",
            "string.pattern.base": "Email must be a valid @ku.ac.th email address"
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required",
        })
    })

    const payload = req.body;
    const {error, value} = scheme.validate(payload, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error){
        // Get the first error message
        const firstError = error.details[0];
        return res.status(400).json({
            success: false,
            error: firstError.message
        })
    }
    
    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
}

