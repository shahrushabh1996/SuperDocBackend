const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'URL must be a valid HTTP or HTTPS URL'
        }
    },
    events: [{
        type: String,
        required: true,
        enum: [
            'document.created',
            'document.signed',
            'document.completed',
            'document.rejected',
            'document.expired',
            'workflow.started',
            'workflow.completed',
            'workflow.cancelled',
            'contact.created',
            'contact.updated',
            'contact.deleted',
            'user.created',
            'user.updated',
            'user.deleted'
        ]
    }],
    headers: {
        type: Map,
        of: String,
        default: new Map()
    },
    secret: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    retryPolicy: {
        maxAttempts: {
            type: Number,
            default: 3,
            min: 1,
            max: 10
        },
        backoffMultiplier: {
            type: Number,
            default: 2,
            min: 1,
            max: 5
        }
    },
    statistics: {
        totalCalls: {
            type: Number,
            default: 0
        },
        successfulCalls: {
            type: Number,
            default: 0
        },
        failedCalls: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0
        }
    },
    lastTriggered: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Index for efficient queries
webhookSchema.index({ organizationId: 1, deletedAt: 1 });
webhookSchema.index({ active: 1, deletedAt: 1 });
webhookSchema.index({ events: 1, deletedAt: 1 });
webhookSchema.index({ createdAt: -1 });
webhookSchema.index({ lastTriggered: -1 });

const Webhook = mongoose.model('Webhook', webhookSchema);

module.exports = Webhook;