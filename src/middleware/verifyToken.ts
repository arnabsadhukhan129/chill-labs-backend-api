import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.util'; // Adjust path as needed

  /**
   * Skip Auth for ignore the requested path.
   * @param req - Express Request object
   * @param res - Express Response object
   * @author Aashutosh
   */

  /**
   * Verify Token of User to check API middleware request.
   * @param req - Express Request object
   * @param res - Express Response object
   * @author Aashutosh
   */
  function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Authorization: Bearer <token>'
  
    // Check if the token is not present
    if (!token) {
      return sendResponse(res, { statusCode: 401, error: 'Authentication required' }); // Use return to stop further execution
    }
  
    try {
      const decoded = token; // Replace this line with actual token verification logic (e.g., jwt.verify(token, secret))
      (req as any).user = {id:decoded}; // Attach decoded token to request
      next(); // Call next only if token verification is successful
    } catch (err) {
      sendResponse(res, { statusCode: 401, error: 'Token Verification failed' });
    }
  }

export default verifyToken;
