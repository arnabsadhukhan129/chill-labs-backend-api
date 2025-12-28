import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validateCreateRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    role_name: Joi.string().required(),
    role_description: Joi.string().optional(),
    role_color: Joi.string().optional(),
    role_type: Joi.string().optional(),
    parent_id: Joi.number().optional(),
    role_level: Joi.string().optional(),
    modules_permissions: Joi.array()
      .items(
        Joi.object({
          module_id: Joi.number().integer().required(),
          permission_id: Joi.number().integer().required(),
        })
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export const validateEditRole = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    role_name: Joi.string().required(),
    role_description: Joi.string().optional(),
    role_color: Joi.string().optional(),
    role_type: Joi.string().optional(),
    parent_id: Joi.number().optional(),
    role_level: Joi.string().optional(),
    modules_permissions: Joi.array()
      .items(
        Joi.object({
          module_id: Joi.number().required(),
          permission_id: Joi.number().required(),
        })
      )
      .required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
