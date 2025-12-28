import Joi from 'joi';


export const grievanceAddSchema = Joi.object({
    subject: Joi.string().min(3).max(255).required(),
    userComment: Joi.string().min(3).required(),
    userDocuments:Joi.any().optional(),
});

export const grievanceAddAdminSchema = Joi.object({
    subject: Joi.string().min(3).max(255).required(),
    userId: Joi.string().required(),
    userComment: Joi.string().min(3).max(255).required(),
    userDocuments:Joi.any().optional()
});

export const grievanceUpdateStaffCommentSchema = Joi.object({
    userComment: Joi.string().min(3).max(255).required(),
    userDocuments:Joi.any().optional()
});

