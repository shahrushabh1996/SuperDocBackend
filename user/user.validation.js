// Implement all the validations here

const Joi = require('joi');

class UserValidation {
    async signup(data) {
        const schema = Joi.object({
            organizationName: Joi.string().min(2).max(100).required().messages({
                'string.empty': 'Organization name is required',
                'string.min': 'Organization name must be at least 2 characters long',
                'string.max': 'Organization name cannot exceed 100 characters'
            }),
            personName: Joi.string().min(2).max(50).required().messages({
                'string.empty': 'Person name is required',
                'string.min': 'Person name must be at least 2 characters long',
                'string.max': 'Person name cannot exceed 50 characters'
            }),
            mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
                'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9',
                'string.empty': 'Mobile number is required'
            }),
            email: Joi.string().email().optional().allow('').messages({
                'string.email': 'Please provide a valid email address'
            })
        });

        return schema.validate(data);
    }

    async sendOTP(data) {
        const schema = Joi.object({
            mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
                'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9',
                'string.empty': 'Mobile number is required'
            })
        });

        return schema.validate(data);
    }

    async login(data) {
        const schema = Joi.object({
            mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
                'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9',
                'string.empty': 'Mobile number is required'
            }),
            otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
                'string.length': 'OTP must be 6 digits',
                'string.pattern.base': 'OTP must only contain numbers',
                'string.empty': 'OTP is required'
            })
        });

        return schema.validate(data);
    }

    async getUserById(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
            })
        });

        return schema.validate(params);
    }

    async updateUser(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
            }),
            fullName: Joi.string().min(2).max(50).optional().messages({
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 50 characters'
            }),
            firstName: Joi.string().min(1).max(25).optional().messages({
                'string.min': 'First name must be at least 1 character long',
                'string.max': 'First name cannot exceed 25 characters'
            }),
            lastName: Joi.string().min(1).max(25).optional().allow('').messages({
                'string.min': 'Last name must be at least 1 character long',
                'string.max': 'Last name cannot exceed 25 characters'
            }),
            email: Joi.string().email().optional().allow('').messages({
                'string.email': 'Please provide a valid email address'
            }),
            avatar: Joi.string().uri().optional().allow('').messages({
                'string.uri': 'Avatar must be a valid URL'
            }),
            preferences: Joi.object({
                language: Joi.string().valid('en', 'es', 'fr', 'de', 'hi').optional().messages({
                    'any.only': 'Language must be one of: en, es, fr, de, hi'
                }),
                timezone: Joi.string().optional(),
                notifications: Joi.object({
                    email: Joi.boolean().optional(),
                    inApp: Joi.boolean().optional()
                }).optional()
            }).optional()
        });

        return schema.validate(data);
    }

    async verifyOTP(data) {
        const schema = Joi.object({
            mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
                'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number starting with 6-9',
                'string.empty': 'Mobile number is required'
            }),
            otp: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
                'string.length': 'OTP must be 6 digits',
                'string.pattern.base': 'OTP must only contain numbers',
                'string.empty': 'OTP is required'
            })
        });

        return schema.validate(data);
    }

    async changePassword(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
            }),
            currentPassword: Joi.string().required().messages({
                'string.empty': 'Current password is required'
            }),
            newPassword: Joi.string().min(8).required().messages({
                'string.min': 'New password must be at least 8 characters long',
                'string.empty': 'New password is required'
            })
        });

        return schema.validate(data);
    }

    async getAllUsers(data) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            size: Joi.number().integer().min(1).max(100).optional().default(10),
            search: Joi.string().optional().allow('').messages({
                'string.base': 'Search query must be a string'
            }),
            status: Joi.string().valid('active', 'inactive', 'pending').optional(),
            role: Joi.string().valid('admin', 'user', 'viewer').optional()
        });

        return schema.validate(data);
    }

    async deleteUser(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
            })
        });

        return schema.validate(params);
    }
}

module.exports = new UserValidation();