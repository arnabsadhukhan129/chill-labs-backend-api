import { Request, Response, NextFunction } from 'express';

export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;

    if (!admin || !roles.includes(admin.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
