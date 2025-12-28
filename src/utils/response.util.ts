import { Response } from 'express';

interface ResponseOptions {
    statusCode?: number;
    message?: string;
    data?: any;
    error?: string;
}

// Common response function
export const sendResponse = (res: Response, options: ResponseOptions) => {
    const { statusCode = 200, message, data, error } = options;
    
    if (error) {
        res.status(statusCode).json({ success: false, error });
    } else {
        res.status(statusCode).json({ success: true, message, data });
    }
};
