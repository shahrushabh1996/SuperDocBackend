const Joi = require('joi');

class WorkflowValidation {
    async createWorkflow(data) {
        const schema = Joi.object({
            title: Joi.string().trim().min(1).max(200).required().messages({
                'string.empty': 'Workflow title is required',
                'string.min': 'Workflow title must be at least 1 character',
                'string.max': 'Workflow title cannot exceed 200 characters',
                'any.required': 'Workflow title is required'
            }),
            description: Joi.string().trim().max(1000).optional().allow('').messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
            templateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                'string.pattern.base': 'Template ID must be a valid MongoDB ObjectId'
            }),
            settings: Joi.object({
                allowMultipleSubmissions: Joi.boolean().optional(),
                requireAuthentication: Joi.boolean().optional(),
                sendEmailNotifications: Joi.boolean().optional(),
                autoArchiveAfterDays: Joi.number().integer().min(1).optional().allow(null),
                emailSubject: Joi.string().optional(),
                emailBody: Joi.string().optional(),
                daysBeforeActivation: Joi.number().integer().min(0).optional(),
                sendFrequency: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
                maxAttempts: Joi.number().integer().min(1).optional()
            }).optional()
        });

        return schema.validate(data);
    }

    async updateWorkflow(data) {
        console.log('🔍 [updateWorkflow Validation] Input data:', {
            id: data.id,
            hasSteps: !!data.steps,
            stepsCount: data.steps?.length,
            steps: data.steps?.map(s => ({
                action: s.action,
                id: s.id,
                title: s.title,
                type: s.type,
                order: s.order
            }))
        });

        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            title: Joi.string().trim().min(1).max(200).optional().messages({
                'string.empty': 'Workflow title cannot be empty',
                'string.min': 'Workflow title must be at least 1 character',
                'string.max': 'Workflow title cannot exceed 200 characters'
            }),
            description: Joi.string().trim().max(1000).optional().allow('').messages({
                'string.max': 'Description cannot exceed 1000 characters'
            }),
            status: Joi.string().valid('draft', 'active', 'paused', 'archived').optional().messages({
                'any.only': 'Status must be one of: draft, active, paused, archived'
            }),
            templateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                'string.pattern.base': 'Template ID must be a valid MongoDB ObjectId'
            }),
            trigger: Joi.object({
                type: Joi.string().valid('manual', 'event', 'schedule', 'api').optional(),
                event: Joi.string().optional(),
                schedule: Joi.string().optional(),
                conditions: Joi.object().optional()
            }).optional(),
            steps: Joi.array().items(
                Joi.object({
                    action: Joi.string().valid('create', 'update', 'delete').required().messages({
                        'any.only': 'Action must be one of: create, update, delete'
                    }),
                    id: Joi.string().when('action', {
                        is: Joi.string().valid('update', 'delete'),
                        then: Joi.string().required().messages({
                            'any.required': 'Step ID is required for update and delete actions'
                        }),
                        otherwise: Joi.string().optional()
                    }),
                    title: Joi.string().trim().min(1).max(200).when('action', {
                        is: 'create',
                        then: Joi.required().messages({
                            'any.required': 'Title is required for create action'
                        }),
                        otherwise: Joi.optional()
                    }),
                    type: Joi.string().valid('form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay').when('action', {
                        is: 'create',
                        then: Joi.required().messages({
                            'any.required': 'Type is required for create action'
                        }),
                        otherwise: Joi.optional()
                    }),
                    order: Joi.number().integer().min(1).optional(),
                    required: Joi.boolean().optional(),
                    fields: Joi.array().items(
                        Joi.object({
                            id: Joi.string().optional(),
                            label: Joi.string().optional(),
                            type: Joi.string().valid('text', 'email', 'phone', 'date', 'file', 'select', 'checkbox').optional(),
                            required: Joi.boolean().optional(),
                            options: Joi.array().items(Joi.string()).optional(),
                            validation: Joi.object().optional()
                        })
                    ).optional(),
                    config: Joi.object().optional(),
                    nextSteps: Joi.array().items(Joi.object()).optional()
                })
            ).optional(),
            settings: Joi.object({
                allowMultipleSubmissions: Joi.boolean().optional(),
                requireAuthentication: Joi.boolean().optional(),
                sendEmailNotifications: Joi.boolean().optional(),
                autoArchiveAfterDays: Joi.number().integer().min(1).optional().allow(null),
                emailSubject: Joi.string().when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().optional(),
                    otherwise: Joi.string().optional().allow('')
                }),
                emailBody: Joi.string().when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().optional(),
                    otherwise: Joi.string().optional().allow('')
                }),
                daysBeforeActivation: Joi.number().integer().min(0).when('sendEmailNotifications', {
                    is: true,
                    then: Joi.number().integer().min(0).optional(),
                    otherwise: Joi.number().integer().min(0).optional().allow(0)
                }),
                sendFrequency: Joi.string().valid('daily', 'weekly', 'monthly').when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
                    otherwise: Joi.string().valid('daily', 'weekly', 'monthly').optional().allow('')
                }),
                maxAttempts: Joi.number().integer().min(1).when('sendEmailNotifications', {
                    is: true,
                    then: Joi.number().integer().min(1).optional(),
                    otherwise: Joi.number().integer().min(0).optional().allow(0)
                })
            }).optional(),
            version: Joi.number().optional()
        });

        const result = schema.validate(data);
        
        if (!result.error && result.value.steps) {
            console.log('✅ [updateWorkflow Validation] Validated data:', {
                id: result.value.id,
                hasSteps: !!result.value.steps,
                stepsCount: result.value.steps?.length,
                validatedSteps: result.value.steps?.map(s => ({
                    action: s.action,
                    id: s.id,
                    title: s.title,
                    type: s.type,
                    order: s.order
                }))
            });
        }

        return result;
    }

    async getWorkflows(data) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            limit: Joi.number().integer().min(1).max(100).optional().default(20),
            search: Joi.string().optional().allow(''),
            status: Joi.string().valid('draft', 'active', 'paused', 'archived').optional(),
            sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt').optional().default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
        });

        return schema.validate(data);
    }

    async validateWorkflowId(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            })
        });
        return schema.validate(params);
    }

    async duplicateWorkflow(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            title: Joi.string().trim().min(1).max(200).required().messages({
                'string.empty': 'Workflow title is required',
                'string.min': 'Workflow title must be at least 1 character',
                'string.max': 'Workflow title cannot exceed 200 characters',
                'any.required': 'Workflow title is required'
            }),
            copySteps: Joi.boolean().optional().default(true).messages({
                'boolean.base': 'copySteps must be a boolean value'
            }),
            copySettings: Joi.boolean().optional().default(true).messages({
                'boolean.base': 'copySettings must be a boolean value'
            })
        });

        return schema.validate(data);
    }

    async getWorkflowExecutions(data) {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            limit: Joi.number().integer().min(1).max(100).optional().default(20),
            status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed', 'cancelled').optional(),
            sortBy: Joi.string().valid('startedAt', 'completedAt', 'status').optional().default('startedAt'),
            sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
        });

        return schema.validate(data);
    }

    async executeWorkflow(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            contactId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Contact ID must be a valid MongoDB ObjectId',
                'any.required': 'Contact ID is required'
            }),
            context: Joi.object({
                source: Joi.string().valid('manual', 'trigger', 'api').optional().default('manual'),
                customData: Joi.object().optional().default({})
            }).optional().default({})
        });

        return schema.validate(data);
    }

    async updateWorkflowStep(data) {
        const schema = Joi.object({
            workflowId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            stepId: Joi.string().required().messages({
                'string.empty': 'Step ID is required',
                'any.required': 'Step ID is required'
            }),
            name: Joi.string().trim().min(1).max(200).optional().messages({
                'string.empty': 'Step name cannot be empty',
                'string.min': 'Step name must be at least 1 character',
                'string.max': 'Step name cannot exceed 200 characters'
            }),
            type: Joi.string().valid('form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay').optional().messages({
                'any.only': 'Type must be one of: form, document, documents, screen, approval, email, sms, webhook, condition, delay'
            }),
            config: Joi.object({
                fields: Joi.array().items(
                    Joi.object({
                        id: Joi.string().optional(),
                        label: Joi.string().required(),
                        type: Joi.string().valid('text', 'email', 'phone', 'date', 'file', 'select', 'checkbox').required(),
                        required: Joi.boolean().optional().default(false),
                        options: Joi.array().items(Joi.string()).optional(),
                        validation: Joi.object().optional()
                    })
                ).optional(),
                documentTemplateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                    'string.pattern.base': 'Document Template ID must be a valid MongoDB ObjectId'
                }),
                emailTemplate: Joi.object({
                    subject: Joi.string().optional(),
                    body: Joi.string().optional(),
                    attachments: Joi.array().items(Joi.string()).optional()
                }).optional(),
                delayDuration: Joi.number().min(0).optional().messages({
                    'number.min': 'Delay duration must be a positive number'
                }),
                conditions: Joi.object().optional(),
                assignee: Joi.object({
                    type: Joi.string().valid('contact', 'user', 'role', 'dynamic').required(),
                    value: Joi.string().required()
                }).optional()
            }).optional(),
            order: Joi.number().integer().min(0).optional().messages({
                'number.integer': 'Order must be an integer',
                'number.min': 'Order must be a positive number'
            }),
            nextSteps: Joi.array().items(
                Joi.object({
                    stepId: Joi.string().required(),
                    condition: Joi.object().optional()
                })
            ).optional()
        });

        return schema.validate(data);
    }

    async validateWorkflowStepIds(params) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            stepId: Joi.string().required().messages({
                'string.empty': 'Step ID is required',
                'any.required': 'Step ID is required'
            })
        });
        return schema.validate(params);
    }

    async validateWorkflowAnalytics(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            days: Joi.number().integer().min(1).max(365).optional().default(30).messages({
                'number.base': 'Days must be a number',
                'number.integer': 'Days must be an integer',
                'number.min': 'Days must be at least 1',
                'number.max': 'Days cannot exceed 365'
            })
        });
        return schema.validate(data);
    }
}

module.exports = new WorkflowValidation();