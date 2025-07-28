const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['onboarding', 'legal', 'hr', 'sales', 'finance', 'general'],
        required: true
    },
    tags: [{
        type: String
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    thumbnail: {
        type: String
    },
    popularity: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    workflowDefinition: {
        steps: {
            type: Array
        },
        estimatedTime: {
            type: Number
        }
    },
    requirements: {
        minPlan: {
            type: String,
            enum: ['free', 'starter', 'pro', 'enterprise'],
            default: 'free'
        },
        features: [{
            type: String
        }]
    },
    createdBy: {
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
    }
});

const Library = mongoose.model('Library', librarySchema);

module.exports = Library;