// jwtUtil.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

interface User {
  id: number;
  username: string;
}

export class JwtUtil {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET as string;
  }

  // Generate JWT token
  generateToken(user: User): string {
    return jwt.sign({ user }, this.secret, {
      expiresIn: '1h',
    });
  }

  // Verify JWT token
  verifyToken(token: string): JwtPayload | string | null {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        console.log('Token expired');
        return null;
      } else if (err instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token');
        return null;
      } else {
        console.log('Token verification failed');
        return null;
      }
    }
  }

  // Check if the token is expired (Optional Utility)
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded.exp ? Date.now() >= decoded.exp * 1000 : true;
    } catch (err) {
      return true;
    }
  }
}
