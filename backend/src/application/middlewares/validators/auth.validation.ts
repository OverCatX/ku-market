import { Request, Response, NextFunction } from "express";
import Joi from 'joi';

export const userSignup = (req: Request, res: Response, next: NextFunction) => {
    const scheme = Joi.object({
        name: Joi.string().required().messages({
            "string.empty": "Name is required"
        }),
        kuEmail: Joi.string().required().pattern(/.+@ku\.ac\.th$/).messages({
            "string.empty": "KU email is required",
            "string.pattern.base": "KU email must be a valid @ku.ac.th email"
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required"
        }),
        faculty: Joi.string().required().messages({
            "string.empty": "Faculty is required"
        }),
        contact: Joi.string().pattern(/^0\d{9}$/).required().messages({
            "string.empty": "Contact is required",
            "string.pattern.base": "Contact must be a valid phone number (10 digits, starting with 0)"
        })
    })

    const payload = req.body;

    const {error} = scheme.validate(payload);

    if (error){
        return res.status(406).json({
            error: error.message
        })
    } else next()
}

export const userLogin = (req: Request, res: Response, next: NextFunction) => {
    const scheme = Joi.object({
        kuEmail: Joi.string().required().pattern(/.+@ku\.ac\.th$/).messages({
            "string.empty": "KU email is required",
            "string.pattern.base": "KU email must be a valid @ku.ac.th email"
        }),
        password: Joi.string().required().messages({
            "string.empty": "Password is required",
        })
    })

    const payload = req.body;
    const {error} = scheme.validate(payload);

    if (error){
        return res.status(406).json({
            error: error.message
        })
    } else next()
}

