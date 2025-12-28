const Joi = require('joi');

// Define Joi schema for role creation
const roleSchema = Joi.object({
    roleName: Joi.string().max(100).required(),
    description: Joi.string().max(255).optional(),
    modulesPermissions: Joi.array().items(
        Joi.object({
            moduleId: Joi.number().required(),
            permissionIds: Joi.array().items(Joi.number().required()).min(1).required(),
        })
    ).min(1).required(),
});

// Validate role data function
const validateRole = (roleData :any ) => roleSchema.validate(roleData);

module.exports = { validateRole };
