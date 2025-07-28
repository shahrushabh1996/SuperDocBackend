const Joi = require('joi');

class DocumentValidation {
    async uploadDocument(data) {
        const schema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Document name is required',
                'any.required': 'Document name is required'
            }),
            folder: Joi.string().optional().allow('').messages({
                'string.base': 'Folder must be a string'
            }),
            tags: Joi.array().items(Joi.string()).optional().messages({
                'array.base': 'Tags must be an array of strings'
            }),
            description: Joi.string().optional().allow('').messages({
                'string.base': 'Description must be a string'
            }),
            type: Joi.string().valid('document', 'template', 'form', 'contract', 'report').optional().default('document'),
            isTemplate: Joi.boolean().optional().default(false)
        });

        return schema.validate(data);
    }

    async validateFileUpload(file) {
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];

        const maxFileSize = 10 * 1024 * 1024; // 10MB

        if (!file) {
            throw new Error('File is required');
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('File type not supported. Allowed types: PDF, DOCX, DOC, XLSX, XLS, TXT, JPG, JPEG, PNG');
        }

        if (file.size > maxFileSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        return true;
    }

    async getDocuments(data) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            limit: Joi.number().integer().min(1).max(100).optional().default(10),
            search: Joi.string().optional().allow(''),
            folder: Joi.string().optional().allow(''),
            tags: Joi.array().items(Joi.string()).optional(),
            type: Joi.string().valid('document', 'template', 'form', 'contract', 'report').optional(),
            sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'size').optional().default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
        });

        return schema.validate(data);
    }

    async validateDocumentId(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Document ID must be a valid MongoDB ObjectId'
            })
        });
        return schema.validate(params);
    }

    async updateDocument(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Document ID must be a valid MongoDB ObjectId'
            }),
            name: Joi.string().optional(),
            description: Joi.string().optional().allow(''),
            folder: Joi.string().optional().allow(''),
            tags: Joi.array().items(Joi.string()).optional(),
            type: Joi.string().valid('document', 'template', 'form', 'contract', 'report').optional(),
            isTemplate: Joi.boolean().optional()
        });

        return schema.validate(data);
    }

    async shareDocument(data) {
        const schema = Joi.object({
            documentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Document ID must be a valid MongoDB ObjectId'
            }),
            shareWith: Joi.array().items(
                Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
                    'string.pattern.base': 'User ID must be a valid MongoDB ObjectId'
                })
            ).optional(),
            contactIds: Joi.array().items(
                Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
                    'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId'
                })
            ).optional(),
            isPublic: Joi.boolean().optional().default(false),
            expiresAt: Joi.date().optional()
        });

        return schema.validate(data);
    }
}

module.exports = new DocumentValidation();