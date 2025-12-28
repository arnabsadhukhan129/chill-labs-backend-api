// import { Request, Response } from 'express';
// import AuthService from '../services/auth.service';
// import AuthController from '../controllers/auth.controller';
// import { jest } from '@jest/globals';

// jest.mock('../services/auth.service', () => ({
//   verifyMobileOtp: jest.fn() as jest.MockedFunction<typeof AuthService.verifyMobileOtp>,
//   setUserType: jest.fn(),
// }));

// describe('AuthController', () => {
//   let req: Partial<Request>;
//   let res: Partial<Response>;

//   beforeEach(() => {
//     req = {};
//     res = {
//       json: jest.fn() as jest.MockedFunction<Response['json']>,
//       status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
//     };
//   });

//   it('should verify mobile OTP', async () => {
//     req.body = { phoneNumber: '1234567890', otp: '1234' };
//     const mockToken = 'mockToken';
//     (AuthService.verifyMobileOtp as jest.MockedFunction<typeof AuthService.verifyMobileOtp>).mockResolvedValue(req.body);

//     await AuthController.verifyMobileOtp(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'OTP verification successful',
//       data: { token: mockToken },
//     });
//   });

//   it('should return an error if OTP verification fails', async () => {
//     req.body = { phoneNumber: '1234567890', otp: 'wrongOtp' };
//     const mockError = new Error('Invalid OTP');
//     (AuthService.verifyMobileOtp as jest.MockedFunction<typeof AuthService.verifyMobileOtp>).mockRejectedValue(mockError);

//     await AuthController.verifyMobileOtp(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'OTP verification failed',
//       error: 'Invalid OTP',
//     });
//   });

//   it('should return an error if OTP or phone number is missing', async () => {
//     req.body = { phoneNumber: '1234567890' }; // Missing OTP
//     await AuthController.verifyMobileOtp(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//         "error": "Invalid OTP",
//         "message": "OTP verification failed",
//     });
//   });

//   it('should return an error if the request body is missing', async () => {
//     await AuthController.verifyMobileOtp(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       "error": "Cannot read properties of undefined (reading 'phoneNumber')",
//       "message": "OTP verification failed",
//     });
//   });

//   it('should handle unexpected errors gracefully', async () => {
//     req.body = { phoneNumber: '1234567890', otp: '1234' };
//     const mockError = new Error('Unexpected error');
//     (AuthService.verifyMobileOtp as jest.MockedFunction<typeof AuthService.verifyMobileOtp>).mockRejectedValue(mockError);

//     await AuthController.verifyMobileOtp(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//         "error": "Unexpected error",
//         "message": "OTP verification failed",
//     });
//   });


//   it('should set customer type', async () => {
//     req.body = { customer_type: 'NRI' };
//     (req as any).user = { phoneNumber: '9804876940' }; // Simulate user in request

//     const mockResponse = true; // Simulate the user being registered after setting customer type

//     // Mock the setUserType function from AuthService
//     (AuthService.setUserType as jest.MockedFunction<typeof AuthService.setUserType>)
//       .mockResolvedValue(mockResponse);

//     await AuthController.setUserType(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       message: 'User type set successfully',
//       data: { is_registered: mockResponse },
//     });
//   });

//   it('should return an error if customer type or phone number is missing', async () => {
//     req.body = {}; // Missing customerType
//     (req as any).user = { phoneNumber: '9804876940' };
//     await AuthController.setUserType(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.json).toHaveBeenCalledWith({
//       "message": "Customer type is required",


//     });
//   });

//   it('should handle unexpected errors when setting customer type', async () => {
//     req.body = { customerType: 'NRI' };
//     (req as any).user = { phoneNumber: '9804876940' };
//     const mockError = new Error('Unexpected error');

//     (AuthService.setUserType as jest.MockedFunction<typeof AuthService.setUserType>)
//       .mockRejectedValue(mockError);

//     await AuthController.setUserType(req as Request, res as Response);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.json).toHaveBeenCalledWith({
//       "error": "Unexpected error",
//       "message": "Failed to set user type",
//     });
//   });
// });
