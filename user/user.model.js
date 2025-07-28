const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    organizationName: {
        type: String,
        required: true
    },
    personName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    OTP: {
        type: String
    },
    OTPExpireAt: {
        type: Date
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'viewer'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    avatar: {
        type: String
    },
    lastLoginAt: {
        type: Date
    },
    preferences: {
        language: {
            type: String,
            default: 'en',
            enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko']
        },
        timezone: {
            type: String,
            default: 'UTC'
        },
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY',
            enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']
        },
        timeFormat: {
            type: String,
            default: '12h',
            enum: ['12h', '24h']
        },
        currency: {
            type: String,
            default: 'USD'
        },
        notifications: {
            email: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                frequency: {
                    type: String,
                    default: 'instant',
                    enum: ['instant', 'daily', 'weekly', 'never']
                },
                types: {
                    documentShared: {
                        type: Boolean,
                        default: true
                    },
                    documentSigned: {
                        type: Boolean,
                        default: true
                    },
                    workflowCompleted: {
                        type: Boolean,
                        default: true
                    }
                }
            },
            inApp: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                sound: {
                    type: Boolean,
                    default: true
                },
                desktop: {
                    type: Boolean,
                    default: true
                }
            },
            sms: {
                enabled: {
                    type: Boolean,
                    default: false
                }
            }
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

const User = mongoose.model('User', userSchema);

module.exports = User;