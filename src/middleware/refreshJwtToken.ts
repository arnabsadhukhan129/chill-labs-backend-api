import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { skipAuth } from '../utils/skipAuthConfig'; // Adjust path as needed

  /**
   * Skip Auth for ignore the requested path.
   * @param req - Express Request object
   * @param res - Express Response object
   * @author Aashutosh
   */
  function shouldSkipAuth(req: Request, method: string): boolean {
    return skipAuth.some(config => 
      new RegExp(config.path).test(req.path) && config.method === method
    );
  }

  /**
   * This function here use for refresh token based on user activity it will call as a middleware.
   * @param req - Express Request object
   * @param res - Express Response object
   * @author Aashutosh
   */

function refreshJwtToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (shouldSkipAuth(req, req.method)) {
    return next(); // Skip authentication if the route matches the configuration
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string, { ignoreExpiration: true });
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpirationTime = decoded.exp;

    // Check if token is about to expire in less than 10 minutes
    const timeRemaining = tokenExpirationTime - currentTime;
    if (timeRemaining < 10 * 60) {
      // Renew the token with extended expiration time
      const newToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
      res.setHeader('Authorization', `Bearer ${newToken}`);
    }
    
    // Attach user to request
    (req as any).user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export default refreshJwtToken;
