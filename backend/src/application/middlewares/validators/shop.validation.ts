import { Request, Response, NextFunction } from "express";
import Joi from 'joi';

const shopRequestSchema = Joi.object({
  shopName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Shop name must be at least 2 characters long',
    'string.max': 'Shop name must not exceed 100 characters',
    'any.required': 'Shop name is required'
  }),
  shopType: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Shop type must be at least 2 characters long',
    'string.max': 'Shop type must not exceed 50 characters',
    'any.required': 'Shop type is required'
  }),
  productCategory: Joi.alternatives().try(
    Joi.array().items(Joi.string().min(1).max(50)).min(1).max(10),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 10) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch {
        return helpers.error('any.invalid');
      }
    })
  ).required().messages({
    'any.required': 'Product category is required',
    'any.invalid': 'Product category must be an array of 1-10 strings'
  }),
  shopdescription: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Shop description must be at least 10 characters long',
    'string.max': 'Shop description must not exceed 1000 characters',
    'any.required': 'Shop description is required'
  })
});

const shopUpdateSchema = Joi.object({
  shopName: Joi.string().min(2).max(100).optional(),
  shopType: Joi.string().min(2).max(50).optional(),
  productCategory: Joi.alternatives().try(
    Joi.array().items(Joi.string().min(1).max(50)).min(1).max(10),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.length <= 10) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch {
        return helpers.error('any.invalid');
      }
    })
  ).optional(),
  shopdescription: Joi.string().min(10).max(1000).optional()
});

const shopRejectionSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Rejection reason must be at least 10 characters long',
    'string.max': 'Rejection reason must not exceed 500 characters',
    'any.required': 'Rejection reason is required'
  })
});

export const validateShopRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error } = shopRequestSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validateShopUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { error } = shopUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validateShopRejection = (req: Request, res: Response, next: NextFunction) => {
  const { error } = shopRejectionSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    shopType: Joi.string().optional(),
    productCategory: Joi.string().optional(),
    search: Joi.string().optional(),
    showAll: Joi.string().valid('true', 'false').optional(),
    sortBy: Joi.string().valid('shopName', 'createdAt', 'shopApprovalDate').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  });

  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};
