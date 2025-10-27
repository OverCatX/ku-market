import { Request, Response, NextFunction } from "express";
import Joi from 'joi';

const verificationRequestSchema = Joi.object({
  documentType: Joi.string().valid('student_id', 'citizen_id').required().messages({
    'any.only': 'Document type is required and must be either student_id or citizen_id'
  }),
})

export const validateVerificationRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error } = verificationRequestSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.message });
  }
  next();
}

