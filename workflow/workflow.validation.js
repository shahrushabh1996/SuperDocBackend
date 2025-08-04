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
                allowMultipleSubmissions: Joi.boolean().optional().messages({
                    'boolean.base': 'Allow multiple submissions must be either true or false'
                }),
                requireAuthentication: Joi.boolean().optional().messages({
                    'boolean.base': 'Require authentication must be either true or false'
                }),
                sendEmailNotifications: Joi.boolean().optional().messages({
                    'boolean.base': 'Send email notifications must be either true or false'
                }),
                autoArchiveAfterDays: Joi.number().integer().min(1).optional().allow(null).messages({
                    'number.base': 'Auto archive days must be a number',
                    'number.integer': 'Auto archive days must be a whole number',
                    'number.min': 'Auto archive days must be at least 1 day'
                }),
                emailSubject: Joi.string().optional().messages({
                    'string.base': 'Email subject must be text'
                }),
                emailBody: Joi.string().optional().messages({
                    'string.base': 'Email body must be text'
                }),
                daysBeforeActivation: Joi.number().integer().min(0).optional().messages({
                    'number.base': 'Days before activation must be a number',
                    'number.integer': 'Days before activation must be a whole number',
                    'number.min': 'Days before activation cannot be negative'
                }),
                sendFrequency: Joi.string().valid('daily', 'weekly', 'monthly').optional().messages({
                    'any.only': 'Send frequency must be one of: daily, weekly, or monthly',
                    'string.base': 'Send frequency must be text'
                }),
                maxAttempts: Joi.number().integer().min(1).optional().messages({
                    'number.base': 'Maximum attempts must be a number',
                    'number.integer': 'Maximum attempts must be a whole number',
                    'number.min': 'Maximum attempts must be at least 1'
                })
            }).optional().messages({
                'object.unknown': 'Unknown setting field: {#label}'
            })
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
            status: Joi.string().valid('active', 'archived').optional().messages({
                'any.only': 'Status must be one of: active, archived'
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
                    type: Joi.string().valid('form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay', 'checklist', 'Form', 'Document', 'Documents', 'Screen', 'Approval', 'Email', 'Sms', 'Webhook', 'Condition', 'Delay', 'Checklist').when('action', {
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
                allowMultipleSubmissions: Joi.boolean().optional().messages({
                    'boolean.base': 'Allow multiple submissions must be either true or false'
                }),
                requireAuthentication: Joi.boolean().optional().messages({
                    'boolean.base': 'Require authentication must be either true or false'
                }),
                sendEmailNotifications: Joi.boolean().optional().messages({
                    'boolean.base': 'Send email notifications must be either true or false'
                }),
                autoArchiveAfterDays: Joi.number().integer().min(1).optional().allow(null).messages({
                    'number.base': 'Auto archive days must be a number',
                    'number.integer': 'Auto archive days must be a whole number',
                    'number.min': 'Auto archive days must be at least 1 day'
                }),
                emailSubject: Joi.string().when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().optional().messages({
                        'string.base': 'Email subject must be text'
                    }),
                    otherwise: Joi.string().optional().allow('').messages({
                        'string.base': 'Email subject must be text'
                    })
                }),
                emailBody: Joi.string().when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().optional().messages({
                        'string.base': 'Email body must be text'
                    }),
                    otherwise: Joi.string().optional().allow('').messages({
                        'string.base': 'Email body must be text'
                    })
                }),
                daysBeforeActivation: Joi.number().integer().min(0).when('sendEmailNotifications', {
                    is: true,
                    then: Joi.number().integer().min(0).optional().messages({
                        'number.base': 'Days before activation must be a number',
                        'number.integer': 'Days before activation must be a whole number',
                        'number.min': 'Days before activation cannot be negative'
                    }),
                    otherwise: Joi.number().integer().min(0).optional().allow(0).messages({
                        'number.base': 'Days before activation must be a number',
                        'number.integer': 'Days before activation must be a whole number',
                        'number.min': 'Days before activation cannot be negative'
                    })
                }),
                sendFrequency: Joi.string().valid('daily', 'weekly', 'monthly').when('sendEmailNotifications', {
                    is: true,
                    then: Joi.string().valid('daily', 'weekly', 'monthly').optional().messages({
                        'any.only': 'Send frequency must be one of: daily, weekly, or monthly',
                        'string.base': 'Send frequency must be text'
                    }),
                    otherwise: Joi.string().valid('daily', 'weekly', 'monthly').optional().allow('').messages({
                        'any.only': 'Send frequency must be one of: daily, weekly, or monthly',
                        'string.base': 'Send frequency must be text'
                    })
                }),
                maxAttempts: Joi.number().integer().min(1).when('sendEmailNotifications', {
                    is: true,
                    then: Joi.number().integer().min(1).optional().messages({
                        'number.base': 'Maximum attempts must be a number',
                        'number.integer': 'Maximum attempts must be a whole number',
                        'number.min': 'Maximum attempts must be at least 1'
                    }),
                    otherwise: Joi.number().integer().min(0).optional().allow(0).messages({
                        'number.base': 'Maximum attempts must be a number',
                        'number.integer': 'Maximum attempts must be a whole number',
                        'number.min': 'Maximum attempts cannot be negative'
                    })
                })
            }).optional().messages({
                'object.unknown': 'Unknown setting field: {#label}'
            }),
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
            status: Joi.string().valid('active', 'archived').optional(),
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
            type: Joi.string().valid('form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay', 'checklist', 'Form', 'Document', 'Documents', 'Screen', 'Approval', 'Email', 'Sms', 'Webhook', 'Condition', 'Delay', 'Checklist').optional().messages({
                'any.only': 'Type must be one of: form, document, documents, screen, approval, email, sms, webhook, condition, delay, checklist (case-insensitive)'
            }),
            config: Joi.object({
                // Screen-specific fields
                screenTitle: Joi.when('...type', {
                    is: Joi.valid('Screen', 'screen'),
                    then: Joi.string().trim().min(1).max(500).optional().messages({
                        'string.empty': 'Screen title cannot be empty',
                        'string.min': 'Screen title must be at least 1 character',
                        'string.max': 'Screen title cannot exceed 500 characters'
                    }),
                    otherwise: Joi.optional()
                }),
                screenContent: Joi.when('...type', {
                    is: Joi.valid('Screen', 'screen'),
                    then: Joi.string().max(50000).optional().messages({
                        'string.empty': 'Screen content cannot be empty',
                        'string.max': 'Screen content cannot exceed 50000 characters'
                    }),
                    otherwise: Joi.optional()
                }),
                // Generic condition field for all step types
                condition: Joi.string().optional().messages({
                    'string.base': 'Condition must be a string'
                }),
                // Form fields
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
                // Document-specific fields (optional for backward compatibility)
                documentTemplateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                    'string.pattern.base': 'Document Template ID must be a valid MongoDB ObjectId'
                }),
                // Future document step fields
                documents: Joi.array().items(
                    Joi.object({
                        name: Joi.string().optional(),
                        type: Joi.string().optional(),
                        required: Joi.boolean().optional(),
                        maxSize: Joi.string().optional()
                    })
                ).optional(),
                maxTotalSize: Joi.string().optional().messages({
                    'string.base': 'Max total size must be a string (e.g., "50MB")'
                }),
                // Checklist-specific fields
                items: Joi.array().items(
                    Joi.object({
                        id: Joi.string().optional(),
                        text: Joi.string().required(),
                        completed: Joi.boolean().optional().default(false)
                    })
                ).optional(),
                allowUserToAddItems: Joi.boolean().optional().default(false),
                // Form-specific fields
                submitButtonText: Joi.string().optional().messages({
                    'string.base': 'Submit button text must be a string'
                }),
                // Email fields
                emailTemplate: Joi.object({
                    subject: Joi.string().optional(),
                    body: Joi.string().optional(),
                    attachments: Joi.array().items(Joi.string()).optional()
                }).optional(),
                // Delay fields
                delayDuration: Joi.number().min(0).optional().messages({
                    'number.min': 'Delay duration must be a positive number'
                }),
                // Conditional fields
                conditions: Joi.object().optional(),
                // Assignment fields
                assignee: Joi.object({
                    type: Joi.string().valid('contact', 'user', 'role', 'dynamic').required(),
                    value: Joi.string().required()
                }).optional()
            }).unknown(true).optional(),
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

    async reorderSteps(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            steps: Joi.array().min(1).required().items(
                Joi.object({
                    stepId: Joi.string().required().messages({
                        'string.empty': 'Step ID is required',
                        'any.required': 'Step ID is required'
                    }),
                    newPosition: Joi.number().integer().min(1).required().messages({
                        'number.base': 'New position must be a number',
                        'number.integer': 'New position must be an integer',
                        'number.min': 'New position must be at least 1',
                        'any.required': 'New position is required'
                    })
                })
            ).messages({
                'array.min': 'At least one step reordering instruction is required',
                'any.required': 'Steps array is required'
            })
        });
        return schema.validate(data);
    }

    async generatePresignedUrl(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            fileName: Joi.string().trim().min(1).max(255).required().messages({
                'string.empty': 'File name is required',
                'string.min': 'File name must be at least 1 character',
                'string.max': 'File name cannot exceed 255 characters',
                'any.required': 'File name is required'
            }),
            contentType: Joi.string().valid(
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ).required().messages({
                'any.only': 'Invalid content type',
                'any.required': 'Content type is required'
            }),
            stepId: Joi.string().optional().allow('').messages({
                'string.base': 'Step ID must be a string'
            }),
            expires: Joi.number().integer().min(60).max(3600).optional().default(900).messages({
                'number.base': 'Expires must be a number',
                'number.integer': 'Expires must be an integer',
                'number.min': 'Expires must be at least 60 seconds',
                'number.max': 'Expires cannot exceed 3600 seconds'
            })
        });
        return schema.validate(data);
    }

    async addWorkflowStep(data) {
        const schema = Joi.object({
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Workflow ID must be a valid MongoDB ObjectId'
            }),
            stepId: Joi.string().required().messages({
                'string.empty': 'Step ID is required',
                'any.required': 'Step ID is required'
            }),
            title: Joi.string().trim().min(1).max(200).required().messages({
                'string.empty': 'Step title is required',
                'string.min': 'Step title must be at least 1 character',
                'string.max': 'Step title cannot exceed 200 characters',
                'any.required': 'Step title is required'
            }),
            type: Joi.string().valid('form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay', 'checklist').required().messages({
                'any.only': 'Type must be one of: form, document, documents, screen, approval, email, sms, webhook, condition, delay, checklist',
                'any.required': 'Step type is required'
            }),
            required: Joi.boolean().optional().default(false).messages({
                'boolean.base': 'Required must be a boolean value'
            }),
            order: Joi.number().integer().min(1).optional().messages({
                'number.base': 'Order must be a number',
                'number.integer': 'Order must be an integer',
                'number.min': 'Order must be at least 1'
            }),
            config: Joi.object({
                // Screen-specific fields
                screenTitle: Joi.when('...type', {
                    is: 'screen',
                    then: Joi.string().trim().min(1).max(500).optional().messages({
                        'string.empty': 'Screen title cannot be empty',
                        'string.min': 'Screen title must be at least 1 character',
                        'string.max': 'Screen title cannot exceed 500 characters'
                    }),
                    otherwise: Joi.optional()
                }),
                screenContent: Joi.when('...type', {
                    is: 'screen',
                    then: Joi.string().max(50000).optional().messages({
                        'string.empty': 'Screen content cannot be empty',
                        'string.max': 'Screen content cannot exceed 50000 characters'
                    }),
                    otherwise: Joi.optional()
                }),
                // Form fields
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
                // Document-specific fields
                documentTemplateId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().messages({
                    'string.pattern.base': 'Document Template ID must be a valid MongoDB ObjectId'
                }),
                // Email fields
                emailTemplate: Joi.object({
                    subject: Joi.string().optional(),
                    body: Joi.string().optional(),
                    attachments: Joi.array().items(Joi.string()).optional()
                }).optional(),
                // Delay fields
                delayDuration: Joi.number().min(0).optional().messages({
                    'number.min': 'Delay duration must be a positive number'
                }),
                // Conditional fields
                conditions: Joi.object().optional(),
                // Assignment fields
                assignee: Joi.object({
                    type: Joi.string().valid('contact', 'user', 'role', 'dynamic').required(),
                    value: Joi.string().required()
                }).optional()
            }).unknown(true).optional(),
            nextSteps: Joi.array().items(
                Joi.object({
                    stepId: Joi.string().required(),
                    condition: Joi.object().optional()
                })
            ).optional()
        });

        return schema.validate(data);
    }
}

module.exports = new WorkflowValidation();