// src/middleware/parseUserInfo.ts
import { Request, Response, NextFunction } from 'express';

function parseUserInfo(req: Request, res: Response, next: NextFunction) {
    // Retrieve the X-User-Info header
    const userInfo = req.headers['x-user-info'];
    
    if (userInfo) {
        try {
            // Parse JSON user info from the header
            (req as any).user = JSON.parse(userInfo as string);
        } catch (err) {
            console.error('Failed to parse user info:', err);
        }
    }
    
    // Proceed to the next middleware or route handler
    next();
}

export default parseUserInfo;
