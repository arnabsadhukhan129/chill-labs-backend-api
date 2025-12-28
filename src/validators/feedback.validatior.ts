import Joi from "joi";

export const feedbackAddSchema = Joi.object({
  category: Joi.string().required(),
  categoryReferenceId: Joi.string().required(),
  categoryReferenceUserId: Joi.number().allow(null).optional(),
  title: Joi.string().required(),
  comment: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  documents: Joi.alternatives()
    .try(
      Joi.array().items(
        Joi.object({
          docId: Joi.string().required(),
          url: Joi.string().uri().required(),
        })
      ),
      Joi.valid(null) // This allows `null` explicitly
    )
    .default([]), // Ensures the default is an empty array
});
