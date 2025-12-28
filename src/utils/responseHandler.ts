// src/utils/responseHandler.ts
import { Response } from 'express';

export const handleResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
  error: any = null
) => {
  const responsePayload = {
    message,
    ...(data && { data }),
    ...(error && { error }),
  };
  res.status(statusCode).json(responsePayload);
};
export class InvalidOtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOtpError';
  }
}