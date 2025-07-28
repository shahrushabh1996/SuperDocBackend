const Joi = require('joi');

class ContactValidation {
    async createContact(data) {
        const schema = Joi.object({
            firstName: Joi.string().min(1).max(50).required().messages({
                'string.empty': 'First name is required',
                'string.min': 'First name must be at least 1 character long',
                'string.max': 'First name cannot exceed 50 characters'
            }),
            lastName: Joi.string().min(1).max(50).required().messages({
                'string.empty': 'Last name is required',
                'string.min': 'Last name must be at least 1 character long',
                'string.max': 'Last name cannot exceed 50 characters'
            }),
            email: Joi.string().email().required().messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),
            phone: Joi.string().optional().allow('').messages({
                'string.base': 'Phone must be a string'
            }),
            company: Joi.string().optional().allow('').messages({
                'string.base': 'Company must be a string'
            }),
            language: Joi.string().optional().allow('').messages({
                'string.base': 'Language must be a string'
            }),
            tags: Joi.array().items(Joi.string()).optional().default([]).messages({
                'array.base': 'Tags must be an array of strings'
            }),
            notes: Joi.string().optional().allow('').messages({
                'string.base': 'Notes must be a string'
            })
        });

        return schema.validate(data);
    }

    async getContactById(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId'
            })
        });

        return schema.validate(params);
    }

    async updateContact(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId'
            }),
            firstName: Joi.string().min(1).max(50).optional().messages({
                'string.min': 'First name must be at least 1 character long',
                'string.max': 'First name cannot exceed 50 characters'
            }),
            lastName: Joi.string().min(1).max(50).optional().messages({
                'string.min': 'Last name must be at least 1 character long',
                'string.max': 'Last name cannot exceed 50 characters'
            }),
            email: Joi.string().email().optional().messages({
                'string.email': 'Please provide a valid email address'
            }),
            phone: Joi.string().optional().allow('').messages({
                'string.base': 'Phone must be a string'
            }),
            company: Joi.string().optional().allow('').messages({
                'string.base': 'Company must be a string'
            }),
            language: Joi.string().optional().allow('').messages({
                'string.base': 'Language must be a string'
            }),
            tags: Joi.array().items(Joi.string()).optional().default([]).messages({
                'array.base': 'Tags must be an array of strings'
            }),
            notes: Joi.string().optional().allow('').messages({
                'string.base': 'Notes must be a string'
            })
        });

        return schema.validate(data);
    }

    async getAllContacts(data) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            limit: Joi.number().integer().min(1).max(100).optional().default(10),
            search: Joi.string().optional().allow('').messages({
                'string.base': 'Search query must be a string'
            }),
            status: Joi.string().valid('ENABLED', 'DISABLED', 'DELETED').optional(),
            tags: Joi.array().items(Joi.string()).optional().messages({
                'array.base': 'Tags must be an array of strings'
            })
        });

        return schema.validate(data);
    }

    async deleteContact(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId'
            })
        });

        return schema.validate(params);
    }

    async shareDocument(data) {
        const schema = Joi.object({
            contactId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId'
            }),
            documentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Document ID must be a valid MongoDB ObjectId',
                'string.empty': 'Document ID is required'
            }),
            permissions: Joi.string().valid('view', 'edit').required().messages({
                'any.only': 'Permissions must be either "view" or "edit"',
                'string.empty': 'Permissions is required'
            }),
            expiresAt: Joi.date().iso().greater('now').optional().messages({
                'date.base': 'Expiry date must be a valid date',
                'date.iso': 'Expiry date must be in ISO format',
                'date.greater': 'Expiry date must be in the future'
            })
        });

        return schema.validate(data);
    }
}

module.exports = new ContactValidation();