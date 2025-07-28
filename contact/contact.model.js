const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    language: {
        type: String,
        default: 'en'
    },
    status: {
        type: String,
        enum: ['ENABLED', 'DISABLED', 'DELETED'],
        default: 'ENABLED'
    },
    invitationDate: {
        type: Date
    },
    tags: [{
        type: String
    }],
    customFields: [{
        name: {
            type: String
        },
        value: {
            type: mongoose.Schema.Types.Mixed
        },
        type: {
            type: String,
            enum: ['text', 'number', 'date', 'boolean']
        }
    }],
    notes: {
        type: String
    },
    lastInteractionAt: {
        type: Date
    },
    source: {
        type: String,
        enum: ['manual', 'import', 'api', 'form'],
        default: 'manual'
    },
    assignedWorkflows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkflowExecution'
    }],
    sharedDocuments: [{
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },
        sharedAt: {
            type: Date
        },
        expiresAt: {
            type: Date
        },
        permissions: {
            type: String,
            enum: ['view', 'download', 'edit'],
            default: 'view'
        }
    }],
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

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;