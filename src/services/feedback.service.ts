// import { Feedback } from "../../models/feedback";
// import { FeedbackDocument } from "../../models/feedbackDocumens";
// import { Op } from "sequelize";
// import User from "../../models/user";
// import { requestUSerLoanApplicationList } from "./toolscalManagementRequest.service";
// import { requestUSerTalkToExpertList } from "./slotManagementRequester.service";
// import FeedbackType from "../../models/feedbacktype";

// // Service to create feedback
// export const createFeedback = async (feedbackData: any, user: any) => {
//   try {
//     const { id, user_type } = user;
//     const { documents } = feedbackData;
//     console.log("feedbackData-->", feedbackData, "id--->", id);

//     const data: any = {
//       category: feedbackData.category,
//       categoryReferenceId: feedbackData.categoryReferenceId,
//       categoryReferenceUserId: feedbackData.categoryReferenceUserId || null,
//       title: feedbackData.title,
//       comment: feedbackData.comment,
//       rating: feedbackData.rating,
//       createdBy: parseInt(id),
//       status: "open",
//     };
//     // Initialize transaction
//     var transaction = await Feedback.sequelize?.transaction();

//     const feedback = await Feedback.create(data);

//     // Step 2: If documents are provided, create them
//     if (documents && documents.length > 0) {
//       const feedbackDocuments = documents.map((doc: any) => ({
//         feedbackId: feedback.id, // Use the created feedback's ID
//         ...doc,
//       }));

//       console.log("Creating feedback documents:", feedbackDocuments);

//       await FeedbackDocument.bulkCreate(feedbackDocuments, { transaction });
//     }

//     // Commit the transaction
//     await transaction?.commit();

//     console.log("Transaction committed successfully.");
//     return feedback;
//   } catch (error: any) {
//     // Rollback transaction in case of error
//     if (transaction) await transaction.rollback();
//     throw new Error("Error creating feedback: " + error.message);
//   }
// };

// // Service to fetch all feedbacks
// export const getAllFeedbacks = async (
//   filters: any,
//   sort: any,
//   pagination: any
// ) => {
//   try {
//     const { category, status, rating, createdBy } = filters || {};
//     const { sortBy = "createdAt", order = "DESC" } = sort || {}; // Default sort by createdAt in descending order
//     const { page = 1, limit = 10 } = pagination || {}; // Default to page 1 with 10 items per page

//     // Build the query options for fetching the data
//     const queryOptions: any = {
//       where: {
//         isDeleted: false, // Fetch only non-deleted feedbacks
//       },
//       order: [[sortBy, order]], // Sort by the specified field and order
//       limit: parseInt(limit, 10), // Limit the number of records per page
//       offset: (parseInt(page, 10) - 1) * parseInt(limit, 10), // Calculate offset for pagination
//     };

//     // Apply filters if provided
//     if (category) {
//       queryOptions.where.category = category;
//     }
//     if (status) {
//       queryOptions.where.status = status;
//     }
//     if (rating) {
//       queryOptions.where.rating = {
//         [Op.gte]: rating, // Find feedbacks with rating greater than or equal to the provided value
//       };
//     }
//     if (createdBy) {
//       queryOptions.where.createdBy = createdBy;
//     }

//     queryOptions.include = [
//       {
//         model: User,
//         as: "referenceUser",
//         attributes: ["id", "name", "email", "username", "phoneNumber"],
//       },
//       {
//         model: FeedbackDocument,
//         as: "documents",
//       },
//     ];

//     // Fetch feedbacks with the built query options
//     const feedbacks = await Feedback.findAll(queryOptions);

//     // Adjust the query for counting feedbacks
//     const countOptions: any = {
//       where: {
//         isDeleted: false, // Make sure to count only non-deleted feedbacks
//       },
//     };

//     // Apply the same filters to the count query
//     if (category) {
//       countOptions.where.category = category;
//     }
//     if (status) {
//       countOptions.where.status = status;
//     }
//     if (rating) {
//       countOptions.where.rating = {
//         [Op.gte]: rating,
//       };
//     }
//     if (createdBy) {
//       countOptions.where.createdBy = createdBy;
//     }

//     // Fetch the total count of feedbacks for pagination
//     const total: any = await Feedback.count(countOptions);

//     return {
//       data: feedbacks,
//       total: total,
//       page: parseInt(page, 10),
//       totalPages: Math.ceil(total / parseInt(limit, 10)),
//     };
//   } catch (error: any) {
//     throw new Error("Error fetching feedbacks: " + error.message);
//   }
// };

// // Service to get feedback by ID
// export const getFeedbackById = async (id: number) => {
//   try {
//     const feedback = await Feedback.findOne({
//       where: {
//         id,
//         isDeleted: false, // Ensure the feedback is not deleted
//       },
//     });
//     return feedback;
//   } catch (error: any) {
//     throw new Error("Error fetching feedback: " + error.message);
//   }
// };

// // Service to update feedback
// export const updateFeedback = async (id: number, data: any) => {
//   try {
//     const feedback = await Feedback.findByPk(id);
//     if (!feedback) {
//       throw new Error("Feedback not found");
//     }

//     await feedback.update(data);
//     return feedback;
//   } catch (error: any) {
//     throw new Error("Error updating feedback: " + error.message);
//   }
// };

// // Service to delete feedback (soft delete)
// export const deleteFeedback = async (id: number) => {
//   try {
//     const feedback = await Feedback.findByPk(id);
//     if (!feedback) {
//       throw new Error("Feedback not found");
//     }

//     await feedback.update({ isDeleted: true, deletedAt: new Date() });
//     return feedback;
//   } catch (error: any) {
//     throw new Error("Error deleting feedback: " + error.message);
//   }
// };

// export const createFeedbackType = async (data: any) => {
//   try {
//     const feedbackType = await FeedbackType.create(data);
//     return feedbackType;
//   } catch (error: any) {
//     throw new Error("Error creating feedback type: " + error.message);
//   }
// };

// export const updateFeedbackType = async (id: number, data: any) => {
//   try {
//     const feedbackType = await FeedbackType.findByPk(id);
//     if (!feedbackType) {
//       throw new Error("Feedback type not found");
//     }

//     await feedbackType.update(data);
//     return feedbackType;
//   } catch (error: any) {
//     throw new Error("Error updating feedback type: " + error.message);
//   }
// };

// export const deleteFeedbackType = async (id: number) => {
//   try {
//     const feedbackType = await FeedbackType.findByPk(id);
//     if (!feedbackType) {
//       throw new Error("Feedback type not found");
//     }

//     await feedbackType.destroy();
//     return feedbackType;
//   } catch (error: any) {
//     throw new Error("Error deleting feedback type: " + error.message);
//   }
// };

// export const getFeedbackTypeById = async (id: number) => {
//   try {
//     const feedbackType = await FeedbackType.findByPk(id);
//     return feedbackType;
//   } catch (error: any) {
//     throw new Error("Error fetching feedback type: " + error.message);
//   }
// };

// export const getFeedbackTypes = async () => {
//   try {
//     const feedbackTypes = await FeedbackType.findAll();
//     return feedbackTypes;
//   } catch (error: any) {
//     throw new Error("Error fetching feedback types: " + error.message);
//   }
// };

// export const feedbackForListByUserId = async (
//   userId: number,
//   enums: string
// ) => {
//   try {
//     switch (enums) {
//       case "feedback for properties":
//       // return await feedbackService.feedbackForPropertiesByUserId(id);
//       case "feedback for loan application":
//         return await requestUSerLoanApplicationList(userId);
//       case "feedback for expert advice":
//         return await requestUSerTalkToExpertList(userId);
//       default:
//         throw new Error("Invalid enums value");
//     }
//   } catch (error: any) {
//     throw new Error("Error fetching feedback: " + error.message);
//   }
// };
