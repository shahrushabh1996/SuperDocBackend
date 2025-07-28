const mongoose = require('mongoose');

const workflowExecutionSchema = new mongoose.Schema({
    workflowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    currentStepId: {
        type: String
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    completionRate: {
        type: Number,
        default: 0
    },
    stepExecutions: [{
        stepId: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'skipped', 'failed']
        },
        startedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        },
        response: {
            type: Object
        },
        error: {
            type: String
        }
    }],
    context: {
        type: Object
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

const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

module.exports = WorkflowExecution;