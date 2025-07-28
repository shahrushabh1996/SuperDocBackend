const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    website: {
        type: String
    },
    industry: {
        type: String
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    founded: {
        type: String
    },
    headquarters: {
        address: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        country: {
            type: String
        },
        postalCode: {
            type: String
        }
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'starter', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'past_due', 'canceled'],
            default: 'active'
        },
        currentPeriodEnd: {
            type: Date
        },
        seats: {
            type: Number
        }
    },
    settings: {
        branding: {
            logo: {
                type: String
            },
            favicon: {
                type: String
            },
            colors: {
                primary: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Primary color must be a valid hex color'
                    }
                },
                secondary: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Secondary color must be a valid hex color'
                    }
                },
                accent: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Accent color must be a valid hex color'
                    }
                },
                text: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Text color must be a valid hex color'
                    }
                },
                background: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Background color must be a valid hex color'
                    }
                }
            },
            fonts: {
                heading: {
                    type: String
                },
                body: {
                    type: String
                }
            },
            customCSS: {
                type: String
            },
            emailTemplate: {
                headerColor: {
                    type: String,
                    validate: {
                        validator: function(v) {
                            return !v || /^#[0-9A-F]{6}$/i.test(v);
                        },
                        message: 'Email header color must be a valid hex color'
                    }
                },
                footerText: {
                    type: String
                }
            },
            // Legacy fields for backward compatibility
            primaryColor: {
                type: String
            },
            secondaryColor: {
                type: String
            }
        },
        features: {
            maxContacts: {
                type: Number
            },
            maxWorkflows: {
                type: Number
            },
            maxPortals: {
                type: Number
            },
            customDomain: {
                type: Boolean
            }
        },
        smtp: {
            enabled: {
                type: Boolean,
                default: false
            },
            host: {
                type: String
            },
            port: {
                type: Number
            },
            secure: {
                type: Boolean,
                default: true
            },
            username: {
                type: String
            },
            password: {
                type: String
            },
            fromName: {
                type: String
            },
            fromEmail: {
                type: String
            },
            replyTo: {
                type: String
            },
            testEmailSent: {
                type: Date
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

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;