const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkflowTemplate'
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    trigger: {
        type: {
            type: String,
            enum: ['manual', 'event', 'schedule', 'api'],
            default: 'manual'
        },
        event: {
            type: String
        },
        schedule: {
            type: String
        },
        conditions: {
            type: Object
        }
    },
    steps: [{
        id: {
            type: String
        },
        name: {
            type: String
        },
        title: {
            type: String
        },
        type: {
            type: String,
            enum: ['form', 'document', 'documents', 'screen', 'approval', 'email', 'sms', 'webhook', 'condition', 'delay', 'checklist', 'Form', 'Document', 'Documents', 'Screen', 'Approval', 'Email', 'Sms', 'Webhook', 'Condition', 'Delay', 'Checklist'],
            required: true
        },
        order: {
            type: Number
        },
        required: {
            type: Boolean,
            default: false
        },
        fields: [{
            id: {
                type: String
            },
            label: {
                type: String
            },
            type: {
                type: String,
                enum: ['text', 'email', 'phone', 'date', 'file', 'select', 'checkbox']
            },
            required: {
                type: Boolean
            },
            options: [{
                type: String
            }],
            validation: {
                type: Object
            }
        }],
        config: {
            // Generic condition field for all step types
            condition: {
                type: String
            },
            // Document-specific fields
            documentTemplateId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Document'
            },
            documents: [{
                name: {
                    type: String
                },
                type: {
                    type: String
                },
                required: {
                    type: Boolean
                },
                maxSize: {
                    type: String
                }
            }],
            maxTotalSize: {
                type: String
            },
            // Checklist-specific fields
            items: [{
                id: {
                    type: String
                },
                text: {
                    type: String
                },
                completed: {
                    type: Boolean,
                    default: false
                }
            }],
            allowUserToAddItems: {
                type: Boolean,
                default: false
            },
            // Form-specific fields
            submitButtonText: {
                type: String
            },
            fields: [{
                id: {
                    type: String
                },
                label: {
                    type: String
                },
                type: {
                    type: String,
                    enum: ['text', 'email', 'phone', 'date', 'file', 'select', 'checkbox']
                },
                required: {
                    type: Boolean
                },
                options: [{
                    type: String
                }],
                validation: {
                    type: Object
                }
            }],
            // Email-specific fields
            emailTemplate: {
                subject: {
                    type: String
                },
                body: {
                    type: String
                },
                attachments: [{
                    type: String
                }]
            },
            // Delay-specific fields
            delayDuration: {
                type: Number
            },
            // Conditional fields
            conditions: {
                type: Object
            },
            // Assignment fields
            assignee: {
                type: {
                    type: String,
                    enum: ['contact', 'user', 'role', 'dynamic']
                },
                value: {
                    type: String
                }
            },
            // Screen-specific fields
            screenTitle: {
                type: String
            },
            screenContent: {
                type: String
            }
        },
        nextSteps: [{
            stepId: {
                type: String
            },
            condition: {
                type: Object
            }
        }]
    }],
    metrics: {
        totalExecutions: {
            type: Number,
            default: 0
        },
        completedExecutions: {
            type: Number,
            default: 0
        },
        averageCompletionTime: {
            type: Number
        },
        lastExecutedAt: {
            type: Date
        }
    },
    settings: {
        allowMultipleSubmissions: {
            type: Boolean,
            default: false
        },
        requireAuthentication: {
            type: Boolean,
            default: false
        },
        sendEmailNotifications: {
            type: Boolean,
            default: true
        },
        autoArchiveAfterDays: {
            type: Number,
            default: null
        },
        emailSubject: {
            type: String
        },
        emailBody: {
            type: String
        },
        daysBeforeActivation: {
            type: Number
        },
        sendFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly']
        },
        maxAttempts: {
            type: Number
        }
    },
    version: {
        type: Number,
        default: 1
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date
    }
});

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow;