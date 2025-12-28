// import Joi from "joi";
// import UserService from "../services/user.service";

// export const signupSchema = Joi.object({
//   email: Joi.string()
//     .email({ tlds: { allow: false } })
//     .required()
//     .external(async (email: string) => {
//       const user = await UserService.findUserByEmail(email);
//       if (user) {
//         throw new Error("Email already in use");
//       }
//     }),
//   phoneNumber: Joi.string()
//     .optional()
//     .external(async (phoneNumber: string) => {
//       if (phoneNumber) {
//         const user = await UserService.findUserByPhoneNumber(phoneNumber);
//         if (user) {
//           throw new Error("Phone number already in use");
//         }
//       }
//     }),
//   password: Joi.string().min(6).required(),
//   name: Joi.string().required(),
//   countryId: Joi.string().required(),

// });

// export const loginSchema = Joi.object({
//   password: Joi.string().required(),
//   email: Joi.string().email().required(),
// })
//   // .xor("username", "phoneNumber")
//   // .messages({
//   //   "object.missing": "Either username or phone number is required for login",
//   // });

// export const googleLoginSchema = Joi.object({
//   tokenId: Joi.string().required().messages({
//     "any.required": "Google token is required",
//   }),
//   fcm: Joi.string().optional(),
// });

// export const verifyOtpSchema = Joi.object({
//   phoneNumber: Joi.string()
//     .messages({
//       "string.pattern.base": "Invalid phone number format",
//       "any.required": "Phone number is required",
//     }),
//   otp: Joi.string().required().messages({
//     "any.required": "OTP is required",
//   }),
// });

// export const sendOtpSchema = Joi.object({
//   phoneNumber: Joi.string()
//     .optional()
//     .messages({
//       "string.pattern.base": "Invalid phone number format",
//       "any.required": "Phone number is required",
//     }),
//   email: Joi.string().email().optional(),
//   fcm: Joi.string().optional(),
//   whatsapp: Joi.boolean().optional(),
// });

// export const staffLoginSchema = Joi.object({
//   phoneNumber: Joi.string()
//     .required()
//     .messages({
//       "string.pattern.base": "Invalid phone number format",
//       "any.required": "Phone number is required",
//     }),
//   // email: Joi.string()
//   // .email()
//   // .required()
//   // .messages({
//   //   'string.email': 'Invalid email format',
//   //   'any.required': 'Email is required',
//   //   'string.empty': 'Email cannot be empty',
//   // }),
//   fcm: Joi.string().optional(),
// });

// export const adminLoginSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.email": "Invalid email format",
//     "any.required": "Email is required",
//     "string.empty": "Email cannot be empty",
//   }),
//   password: Joi.string().min(6).required(),
//   fcm: Joi.string().optional(),
// });

// export const setUserTypeSchema = Joi.object({
//   // phoneNumber: Joi.string()
//   // .required()
//   // .pattern(/^[0-9]{10,15}$/)
//   // .messages({
//   //   'string.pattern.base': 'Invalid phone number format',
//   //   'any.required': 'Phone number is required',
//   // }),
//   customer_type: Joi.string()
//     .valid("NRI", "Govt_employee", "resident_indians", "foreigners", "Other")
//     .required()
//     .messages({
//       "any.required": "Customer type is required",
//       "any.only": "Invalid customer type",
//     }),
//   country_id: Joi.number().integer().optional(),
// });

// export const resetPasswordSchema = Joi.object({
//   user_id: Joi.string().optional(),
//   new_password: Joi.string().min(6).required(),
//   confirm_password: Joi.string().valid(Joi.ref("new_password")).required(),
//   "x-reset-token": Joi.string().optional(),
// }).with("new_password", "confirm_password");

// export const forgotPasswordSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.email": "Invalid email format",
//     "any.required": "Email is required",
//     "string.empty": "Email cannot be empty",
//   }),
// });
