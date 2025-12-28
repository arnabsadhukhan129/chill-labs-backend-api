import { Request, Response, NextFunction } from 'express';

export const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.headers['x-reset-token'];
    if (!token) {
      token = (req.body as any)['x-reset-token']
    }
    if (Array.isArray(token)) {
      token = token[0];
    }
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Please provide the token' });
    }

    // Token is a plain JSON string; parse directly
    const data = JSON.parse(token);
    const createdAt = new Date(data.timestamp);

    if (isNaN(createdAt.getTime())) {
      return res.status(400).json({ message: 'Payload timestamp is malformed' });
    }

    const otpExpiresAt = new Date(createdAt);
    const time = parseInt(process.env.SET_FORGOT_OTP_EXPIRE_TIME || '5', 10);
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + time);
    if (otpExpiresAt.getTime() < Date.now()) {
      return res.status(401).json({ message: 'Session expired' });
    }

    (req as any).body.user_id = data.id;
    next();
  } catch (error: any) {
    res.status(401).json({ message: 'Token validation failed', error: error.message });
  }
};
