const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
    integrationId: {
        type: String,
        required: true,
        enum: [
            'docusign',
            'salesforce',
            'hubspot',
            'zapier',
            'slack',
            'microsoft-teams',
            'google-drive',
            'dropbox',
            'quickbooks',
            'stripe',
            'paypal',
            'twilio',
            'sendgrid',
            'mailchimp',
            'zoom',
            'calendly'
        ]
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    connected: {
        type: Boolean,
        default: false
    },
    connectedAt: {
        type: Date
    },
    connectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Authentication credentials (encrypted)
    credentials: {
        // For API key based integrations
        apiKey: {
            type: String
        },
        apiSecret: {
            type: String
        },
        // For OAuth integrations
        accessToken: {
            type: String
        },
        refreshToken: {
            type: String
        },
        tokenExpiresAt: {
            type: Date
        },
        // OAuth app details
        clientId: {
            type: String
        },
        clientSecret: {
            type: String
        }
    },
    
    // Integration configuration
    configuration: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    },
    
    // Integration metadata
    metadata: {
        accountId: {
            type: String
        },
        accountName: {
            type: String
        },
        environment: {
            type: String,
            enum: ['sandbox', 'production'],
            default: 'production'
        },
        version: {
            type: String
        },
        region: {
            type: String
        }
    },
    
    // Sync settings
    syncSettings: {
        enabled: {
            type: Boolean,
            default: true
        },
        interval: {
            type: String,
            enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
            default: 'hourly'
        },
        direction: {
            type: String,
            enum: ['inbound', 'outbound', 'bidirectional'],
            default: 'bidirectional'
        },
        lastSyncAt: {
            type: Date
        },
        nextSyncAt: {
            type: Date
        }
    },
    
    // Status and health
    status: {
        type: String,
        enum: ['active', 'inactive', 'error', 'expired'],
        default: 'active'
    },
    
    // Error tracking
    lastError: {
        message: {
            type: String
        },
        code: {
            type: String
        },
        occurredAt: {
            type: Date
        }
    },
    
    // Statistics
    statistics: {
        totalSyncs: {
            type: Number,
            default: 0
        },
        successfulSyncs: {
            type: Number,
            default: 0
        },
        failedSyncs: {
            type: Number,
            default: 0
        },
        dataTransferred: {
            type: Number,
            default: 0
        }
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
integrationSchema.index({ organizationId: 1, integrationId: 1 }, { unique: true });
integrationSchema.index({ organizationId: 1, connected: 1, deletedAt: 1 });
integrationSchema.index({ status: 1, deletedAt: 1 });
integrationSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
integrationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    if (this.connected && !this.connectedAt) {
        this.connectedAt = new Date();
    }
    next();
});

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;