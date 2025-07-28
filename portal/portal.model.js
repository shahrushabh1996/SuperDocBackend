const mongoose = require('mongoose');

const portalSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    workflow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'deleted'],
        default: 'draft'
    },
    theme: {
        logo: {
            type: String
        },
        primaryColor: {
            type: String
        },
        backgroundColor: {
            type: String
        },
        customCSS: {
            type: String
        }
    },
    settings: {
        requireAuth: {
            type: Boolean,
            default: false
        },
        allowedDomains: [{
            type: String
        }],
        expiresAt: {
            type: Date
        },
        maxSubmissions: {
            type: Number
        },
        redirectUrl: {
            type: String
        },
        customDomain: {
            type: String
        },
        displayOnPublicIndex: {
            type: Boolean,
            default: false
        },
        requirePhoneNumber: {
            type: Boolean,
            default: false
        },
        enableScreeningQuestion: {
            type: Boolean,
            default: false
        }
    },
    content: {
        welcomeMessage: {
            type: String
        },
        successMessage: {
            type: String
        },
        termsAndConditions: {
            type: String
        },
        privacyPolicy: {
            type: String
        },
        screeningQuestion: {
            type: String
        },
        denialMessage: {
            type: String
        }
    },
    analytics: {
        views: {
            type: Number,
            default: 0
        },
        submissions: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number
        },
        lastViewedAt: {
            type: Date
        }
    },
    publishedAt: {
        type: Date
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

const Portal = mongoose.model('Portal', portalSchema);

module.exports = Portal;