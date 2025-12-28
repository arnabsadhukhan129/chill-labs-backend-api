import { Request, Response, NextFunction } from 'express';

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if ((req as any).user && (req as any).user.user_type=='admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Access denied' });
  }
}