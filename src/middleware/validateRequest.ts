// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
        console.log(error)
      res.status(400).json({ message: 'Validation failed', error: error.message });
    }
  };
};





