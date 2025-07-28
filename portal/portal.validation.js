const Joi = require('joi');

class PortalValidation {
    async createPortal(data) {
        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(200).required().messages({
                'string.empty': 'Portal name is required',
                'string.min': 'Portal name must be at least 1 character',
                'string.max': 'Portal name cannot exceed 200 characters'
            }),
            description: Joi.string().trim().max(1000).optional().allow('').messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
            workflowId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            })
        });

        return schema.validate(data);
    }

    async validatePortalId(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Portal ID must be a valid MongoDB ObjectId'
            })
        });
        return schema.validate(params);
    }

    async updatePortal(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Portal ID must be a valid MongoDB ObjectId'
            }),
            name: Joi.string().trim().min(1).max(200).optional().messages({
                'string.empty': 'Portal name cannot be empty',
                'string.min': 'Portal name must be at least 1 character',
                'string.max': 'Portal name cannot exceed 200 characters'
            }),
            description: Joi.string().trim().max(1000).optional().allow('').messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
            status: Joi.string().valid('draft', 'active', 'deleted').optional().messages({
                'any.only': 'Status must be one of: draft, active, deleted'
            }),
            slug: Joi.string().trim().min(1).max(100).optional().messages({
                'string.empty': 'Slug cannot be empty',
                'string.min': 'Slug must be at least 1 character',
                'string.max': 'Slug cannot exceed 100 characters'
            }),
            workflow: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            content: Joi.object({
                welcomeMessage: Joi.string().trim().max(2000).optional().allow('').messages({
                    'string.max': 'Welcome message cannot exceed 2000 characters'
                }),
                screeningQuestion: Joi.string().trim().max(500).optional().allow('').messages({
                    'string.max': 'Screening question cannot exceed 500 characters'
                }),
                denialMessage: Joi.string().trim().max(1000).optional().allow('').messages({
                    'string.max': 'Denial message cannot exceed 1000 characters'
                })
            }).optional(),
            settings: Joi.object({
                displayOnPublicIndex: Joi.boolean().optional().messages({
                    'boolean.base': 'Display on public index must be a boolean value'
                }),
                requirePhoneNumber: Joi.boolean().optional().messages({
                    'boolean.base': 'Require phone number must be a boolean value'
                }),
                enableScreeningQuestion: Joi.boolean().optional().messages({
                    'boolean.base': 'Enable screening question must be a boolean value'
                })
            }).optional()
        });

        return schema.validate(data);
    }
}

module.exports = new PortalValidation();