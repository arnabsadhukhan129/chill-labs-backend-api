const Joi = require("joi");

export const incentiveSchema = Joi.object({
  id: Joi.number().integer().optional(),
  user_id: Joi.number().integer().optional(),
  incentive_type: Joi.string()
    .valid(
      "property listing",
      "bringing loan applicant",
      "bringing active buyer for emd"
    )
    .optional(),
  incentive_amount: Joi.number().integer().optional(),
  paid_amount: Joi.number().integer().optional(),
  pay_amount: Joi.number().integer().optional(),
  pay_method: Joi.string().valid("bank", "upi").optional(),
  approval: Joi.array()
    .items(
      Joi.object({
        status: Joi.string().valid("approved", "rejected").optional(),
        comment: Joi.string().optional(),
        created_at: Joi.date().iso().optional(),
        acted_by: Joi.object({
          user_id: Joi.number().integer().optional(),
          level: Joi.string()
            .valid("Admin", "Sub Admin", "Company Manager")
            .optional(),
        }).optional(),
      }).optional()
    )
    .optional(),
  incentive_for: Joi.object({
    type: Joi.string()
      .valid(
        "property listing",
        "bringing loan applicant",
        "bringing active buyer for emd"
      )
      .optional(),
    property_id: Joi.string().optional(),
  }).optional(),
  payment_status: Joi.string().valid("paid", "unpaid").optional(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});

const validateIncentive = (incentiveData: any) =>
  incentiveSchema.validate(incentiveData);

module.exports = { validateIncentive };
