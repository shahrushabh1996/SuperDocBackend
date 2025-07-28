const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
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
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['document', 'template', 'form', 'contract', 'report'],
        default: 'document'
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    },
    url: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    tags: [{
        type: String
    }],
    folder: {
        type: String
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    templateVariables: [{
        name: {
            type: String
        },
        type: {
            type: String,
            enum: ['text', 'date', 'number', 'signature']
        },
        required: {
            type: Boolean
        }
    }],
    permissions: {
        public: {
            type: Boolean,
            default: false
        },
        sharedWith: [{
            type: {
                type: String,
                enum: ['user', 'contact', 'anyone']
            },
            id: {
                type: mongoose.Schema.Types.ObjectId
            },
            permissions: {
                type: String,
                enum: ['view', 'download', 'edit'],
                default: 'view'
            }
        }]
    },
    version: {
        type: Number,
        default: 1
    },
    previousVersionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    metadata: {
        pages: {
            type: Number
        },
        words: {
            type: Number
        },
        signatureFields: {
            type: Number
        }
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
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;