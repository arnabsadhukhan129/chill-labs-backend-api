// import { Request, Response } from "express";
// import * as feedbackService from "../services/feedback.service";
// import { handleResponse } from "../utils/responseHandler";
// import { feedbackAddSchema } from "../validators/feedback.validatior";

// // Controller to create feedback
// export const createFeedback = async (req: Request, res: Response) => {
//   try {
//     const data = req.body;
//     const user = (req as any).user;

//     const { error } = feedbackAddSchema.validate(data);
//     console.log(error);

//     if (error) {
//       return handleResponse(
//         res,
//         403,
//         "Validation failed!",
//         null,
//         error.details[0].message
//       );
//     }

//     const newFeedback = await feedbackService.createFeedback(data, user);
//     handleResponse(res, 200, "Feedback created successfully", {
//       feedback: newFeedback,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };

// // Controller to get all feedbacks
// export const getAllFeedbacks = async (req: Request, res: Response) => {
//   try {
//     // Extract query parameters for filters, sort, and pagination
//     const filters = {
//       category: req.query.category as string,
//       status: req.query.status as string,
//       rating: req.query.rating
//         ? parseInt(req.query.rating as string, 10)
//         : undefined,
//       createdBy: req.query.createdBy
//         ? parseInt(req.query.createdBy as string, 10)
//         : undefined,
//     };

//     const sort = {
//       sortBy: req.query.sortBy as string,
//       order: req.query.order as string,
//     };

//     const pagination = {
//       page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
//       limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
//     };

//     const feedbacks = await feedbackService.getAllFeedbacks(
//       filters,
//       sort,
//       pagination
//     );
//     return handleResponse(res, 200, "All feedbacks retrieved successfully", {
//       feedback: feedbacks,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };

// // Controller to get feedback by ID
// export const getFeedbackById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const feedback = await feedbackService.getFeedbackById(Number(id));
//     if (!feedback) {
//       return handleResponse(res, 404, "Feedback not found", null, "");
//     }
//     return handleResponse(res, 200, "All feedbacks retrieved successfully", {
//       feedback,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };

// // Controller to update feedback
// export const updateFeedback = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const updatedFeedback = await feedbackService.updateFeedback(
//       Number(id),
//       data
//     );
//     handleResponse(res, 200, "feedback updated successfully", {
//       feedback: updatedFeedback,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };

// // Controller to delete feedback (soft delete)
// export const deleteFeedback = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deletedFeedback = await feedbackService.deleteFeedback(Number(id));
//     handleResponse(res, 200, "feedback deleted successfully", {
//       feedback: deletedFeedback,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };

// // Controller to create feedback type
// export const createFeedbackType = async (req: Request, res: Response) => {
//   try {
//     const data = req.body;
//     const feedbackType = await feedbackService.createFeedbackType(data);
//     handleResponse(res, 200, "feedback type created successfully", {
//       feedbackType,
//     });
//   } catch (error: any) {
//     handleResponse(
//       res,
//       500,
//       "Failed to create feedback type",
//       null,
//       error.message
//     );
//   }
// };

// // Controller to update feedback type
// export const updateFeedbackType = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;
//     const updatedFeedbackType = await feedbackService.updateFeedbackType(
//       Number(id),
//       data
//     );
//     handleResponse(res, 200, "feedback type updated successfully", {
//       feedbackType: updatedFeedbackType,
//     });
//   } catch (error: any) {
//     handleResponse(
//       res,
//       500,
//       "Failed to create feedback type",
//       null,
//       error.message
//     );
//   }
// };

// // Controller to delete feedback type (soft delete)
// export const deleteFeedbackType = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deletedFeedbackType = await feedbackService.deleteFeedbackType(
//       Number(id)
//     );
//     handleResponse(res, 200, "feedback type deleted successfully", {
//       feedbackType: deletedFeedbackType,
//     });
//   } catch (error: any) {
//     handleResponse(
//       res,
//       500,
//       "Failed to create feedback type",
//       null,
//       error.message
//     );
//   }
// };

// // Controller to get feedback type by ID
// export const getFeedbackTypeById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const feedbackType = await feedbackService.getFeedbackTypeById(Number(id));
//     if (!feedbackType) {
//       return handleResponse(res, 404, "Feedback type not found", null, "");
//     }
//     return handleResponse(
//       res,
//       200,
//       "All feedback types retrieved successfully",
//       { feedbackType }
//     );
//   } catch (error: any) {
//     handleResponse(
//       res,
//       500,
//       "Failed to create feedback type",
//       null,
//       error.message
//     );
//   }
// };

// // Controller to get all feedback types
// export const getFeedbackTypes = async (req: Request, res: Response) => {
//   try {
//     const feedbackTypes = await feedbackService.getFeedbackTypes();
//     return handleResponse(
//       res,
//       200,
//       "All feedback types retrieved successfully",
//       { feedbackTypes }
//     );
//   } catch (error: any) {
//     handleResponse(
//       res,
//       500,
//       "Failed to create feedback type",
//       null,
//       error.message
//     );
//   }
// };

// // Controller to get feedback list by user ID
// export const feedbackForListByUser = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.id;
//     const { enums } = req.query;
//     if (
//       !enums ||
//       (enums !== "feedback for properties" &&
//         enums !== "feedback for loan application" &&
//         enums !== "feedback for expert advice")
//     ) {
//       return handleResponse(res, 400, "Invalid enums value", null, "");
//     }
//     const feedback = await feedbackService.feedbackForListByUserId(
//       Number(userId),
//       enums
//     );
//     return handleResponse(res, 200, "All feedbacks retrieved successfully", {
//       feedback,
//     });
//   } catch (error: any) {
//     handleResponse(res, 500, "Failed to create feedback", null, error.message);
//   }
// };
