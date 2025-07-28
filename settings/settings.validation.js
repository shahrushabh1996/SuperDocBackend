const Joi = require('joi');

class SettingsValidation {
    async updateOrganization(data) {
        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(100).optional().messages({
                'string.empty': 'Organization name cannot be empty',
                'string.min': 'Organization name must be at least 1 character',
                'string.max': 'Organization name cannot exceed 100 characters'
            }),
            branding: Joi.object({
                logo: Joi.string().uri().optional().allow('').messages({
                    'string.uri': 'Logo must be a valid URL'
                }),
                primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Primary color must be a valid hex color code (e.g., #FF6B6B)'
                }),
                secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Secondary color must be a valid hex color code (e.g., #FCAB10)'
                })
            }).optional()
        });

        return schema.validate(data);
    }

    async updateUserProfile(data) {
        // Common supported languages
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko'];
        
        // Common timezones - you can expand this list as needed
        const supportedTimezones = [
            'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
            'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney',
            'Pacific/Auckland', 'America/Toronto', 'America/Sao_Paulo', 'Africa/Cairo'
        ];

        const schema = Joi.object({
            firstName: Joi.string().trim().min(1).max(50).required().messages({
                'string.empty': 'First name is required',
                'string.min': 'First name must be at least 1 character',
                'string.max': 'First name cannot exceed 50 characters',
                'any.required': 'First name is required'
            }),
            lastName: Joi.string().trim().min(1).max(50).required().messages({
                'string.empty': 'Last name is required',
                'string.min': 'Last name must be at least 1 character',
                'string.max': 'Last name cannot exceed 50 characters',
                'any.required': 'Last name is required'
            }),
            phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow('').messages({
                'string.pattern.base': 'Invalid phone number format'
            }),
            preferences: Joi.object({
                language: Joi.string().valid(...supportedLanguages).optional().messages({
                    'any.only': `Language must be one of: ${supportedLanguages.join(', ')}`
                }),
                timezone: Joi.string().valid(...supportedTimezones).optional().messages({
                    'any.only': `Timezone must be one of the supported timezones`
                }),
                notifications: Joi.object({
                    email: Joi.boolean().optional(),
                    inApp: Joi.boolean().optional()
                }).optional()
            }).optional()
        });

        return schema.validate(data);
    }

    async updateUserPreferences(data) {
        // Common supported languages
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko'];
        
        // Common timezones - you can expand this list as needed
        const supportedTimezones = [
            'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
            'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney',
            'Pacific/Auckland', 'America/Toronto', 'America/Sao_Paulo', 'Africa/Cairo'
        ];

        const supportedDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'];
        const supportedTimeFormats = ['12h', '24h'];
        const supportedFrequencies = ['instant', 'daily', 'weekly', 'never'];

        const schema = Joi.object({
            language: Joi.string().valid(...supportedLanguages).optional().messages({
                'any.only': `Language must be one of: ${supportedLanguages.join(', ')}`
            }),
            timezone: Joi.string().valid(...supportedTimezones).optional().messages({
                'any.only': 'Timezone must be one of the supported timezones'
            }),
            dateFormat: Joi.string().valid(...supportedDateFormats).optional().messages({
                'any.only': `Date format must be one of: ${supportedDateFormats.join(', ')}`
            }),
            timeFormat: Joi.string().valid(...supportedTimeFormats).optional().messages({
                'any.only': `Time format must be one of: ${supportedTimeFormats.join(', ')}`
            }),
            currency: Joi.string().length(3).uppercase().optional().messages({
                'string.length': 'Currency must be a 3-letter ISO code',
                'string.uppercase': 'Currency must be uppercase'
            }),
            notifications: Joi.object({
                email: Joi.object({
                    enabled: Joi.boolean().optional(),
                    frequency: Joi.string().valid(...supportedFrequencies).optional().messages({
                        'any.only': `Email frequency must be one of: ${supportedFrequencies.join(', ')}`
                    }),
                    types: Joi.object({
                        documentShared: Joi.boolean().optional(),
                        documentSigned: Joi.boolean().optional(),
                        workflowCompleted: Joi.boolean().optional()
                    }).optional()
                }).optional(),
                inApp: Joi.object({
                    enabled: Joi.boolean().optional(),
                    sound: Joi.boolean().optional(),
                    desktop: Joi.boolean().optional()
                }).optional(),
                sms: Joi.object({
                    enabled: Joi.boolean().optional()
                }).optional()
            }).optional()
        });

        return schema.validate(data);
    }

    async updateOrganizationProfile(data) {
        const supportedSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(100).optional().messages({
                'string.empty': 'Organization name cannot be empty',
                'string.min': 'Organization name must be at least 1 character',
                'string.max': 'Organization name cannot exceed 100 characters'
            }),
            description: Joi.string().trim().max(500).optional().allow('').messages({
                'string.max': 'Description cannot exceed 500 characters'
            }),
            website: Joi.string().uri().optional().allow('').messages({
                'string.uri': 'Website must be a valid URL'
            }),
            industry: Joi.string().trim().max(100).optional().allow('').messages({
                'string.max': 'Industry cannot exceed 100 characters'
            }),
            size: Joi.string().valid(...supportedSizes).optional().messages({
                'any.only': `Organization size must be one of: ${supportedSizes.join(', ')}`
            }),
            founded: Joi.string().pattern(/^\d{4}$/).optional().allow('').messages({
                'string.pattern.base': 'Founded year must be a 4-digit year (e.g., 2010)'
            }),
            headquarters: Joi.object({
                address: Joi.string().trim().max(200).optional().allow('').messages({
                    'string.max': 'Address cannot exceed 200 characters'
                }),
                city: Joi.string().trim().max(100).optional().allow('').messages({
                    'string.max': 'City cannot exceed 100 characters'
                }),
                state: Joi.string().trim().max(100).optional().allow('').messages({
                    'string.max': 'State cannot exceed 100 characters'
                }),
                country: Joi.string().trim().length(2).uppercase().optional().allow('').messages({
                    'string.length': 'Country must be a 2-letter ISO code',
                    'string.uppercase': 'Country code must be uppercase'
                }),
                postalCode: Joi.string().trim().max(20).optional().allow('').messages({
                    'string.max': 'Postal code cannot exceed 20 characters'
                })
            }).optional()
        });

        return schema.validate(data);
    }

    async validateAvatarUpload(file) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif'
        ];

        const maxFileSize = 5 * 1024 * 1024; // 5MB

        if (!file) {
            throw new Error('Avatar file is required');
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file format. Supported formats: JPEG, PNG, GIF');
        }

        if (file.size > maxFileSize) {
            throw new Error('File size exceeds 5MB limit');
        }

        return true;
    }

    async updateOrganizationBranding(data) {
        // Common approved fonts list
        const approvedFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Trebuchet MS',
            'Inter', 'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Source Sans Pro',
            'Poppins', 'Nunito', 'Ubuntu', 'PT Sans', 'Merriweather', 'Playfair Display'
        ];

        const schema = Joi.object({
            logo: Joi.string().uri().optional().allow('').messages({
                'string.uri': 'Logo must be a valid URL'
            }),
            favicon: Joi.string().uri().optional().allow('').messages({
                'string.uri': 'Favicon must be a valid URL'
            }),
            colors: Joi.object({
                primary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Primary color must be a valid hex color (e.g., #FF6B6B)'
                }),
                secondary: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Secondary color must be a valid hex color (e.g., #4ECDC4)'
                }),
                accent: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Accent color must be a valid hex color (e.g., #FFD93D)'
                }),
                text: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Text color must be a valid hex color (e.g., #2D3436)'
                }),
                background: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Background color must be a valid hex color (e.g., #FFFFFF)'
                })
            }).optional(),
            fonts: Joi.object({
                heading: Joi.string().valid(...approvedFonts).optional().messages({
                    'any.only': `Heading font must be from approved list: ${approvedFonts.join(', ')}`
                }),
                body: Joi.string().valid(...approvedFonts).optional().messages({
                    'any.only': `Body font must be from approved list: ${approvedFonts.join(', ')}`
                })
            }).optional(),
            customCSS: Joi.string().max(10240).optional().allow('').messages({ // 10KB limit
                'string.max': 'Custom CSS cannot exceed 10KB (10,240 characters)'
            }),
            emailTemplate: Joi.object({
                headerColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
                    'string.pattern.base': 'Email header color must be a valid hex color (e.g., #FF6B6B)'
                }),
                footerText: Joi.string().max(500).optional().allow('').messages({
                    'string.max': 'Email footer text cannot exceed 500 characters'
                })
            }).optional()
        });

        return schema.validate(data);
    }

    async updateSmtpConfiguration(data) {
        const schema = Joi.object({
            enabled: Joi.boolean().optional().messages({
                'boolean.base': 'Enabled must be true or false'
            }),
            host: Joi.string().hostname().optional().allow('').messages({
                'string.hostname': 'Host must be a valid hostname'
            }),
            port: Joi.number().integer().min(1).max(65535).optional().messages({
                'number.base': 'Port must be a number',
                'number.integer': 'Port must be an integer',
                'number.min': 'Port must be at least 1',
                'number.max': 'Port must be at most 65535'
            }),
            secure: Joi.boolean().optional().messages({
                'boolean.base': 'Secure must be true or false'
            }),
            username: Joi.string().max(255).optional().allow('').messages({
                'string.max': 'Username cannot exceed 255 characters'
            }),
            password: Joi.string().max(1000).optional().allow('').messages({
                'string.max': 'Password cannot exceed 1000 characters'
            }),
            fromName: Joi.string().max(100).optional().allow('').messages({
                'string.max': 'From name cannot exceed 100 characters'
            }),
            fromEmail: Joi.string().email().optional().allow('').messages({
                'string.email': 'From email must be a valid email address'
            }),
            replyTo: Joi.string().email().optional().allow('').messages({
                'string.email': 'Reply-to must be a valid email address'
            })
        });

        return schema.validate(data);
    }

    async testSmtpConfiguration(data) {
        const schema = Joi.object({
            testEmail: Joi.string().email().required().messages({
                'string.email': 'Test email must be a valid email address',
                'any.required': 'Test email is required'
            }),
            testSubject: Joi.string().min(1).max(255).optional().messages({
                'string.min': 'Test subject cannot be empty',
                'string.max': 'Test subject cannot exceed 255 characters'
            }),
            testBody: Joi.string().min(1).max(10000).optional().messages({
                'string.min': 'Test body cannot be empty',
                'string.max': 'Test body cannot exceed 10,000 characters'
            })
        });

        return schema.validate(data);
    }

    async listWebhooksQuery(data) {
        const validStatuses = ['active', 'inactive', 'failed'];
        const validEvents = [
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
        ];
        const validSortFields = ['createdAt', 'name', 'lastTriggered'];
        const validSortOrders = ['asc', 'desc'];

        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1).messages({
                'number.base': 'Page must be a number',
                'number.integer': 'Page must be an integer',
                'number.min': 'Page must be at least 1'
            }),
            perPage: Joi.number().integer().min(1).max(100).optional().default(20).messages({
                'number.base': 'Per page must be a number',
                'number.integer': 'Per page must be an integer',
                'number.min': 'Per page must be at least 1',
                'number.max': 'Per page cannot exceed 100'
            }),
            status: Joi.string().valid(...validStatuses).optional().messages({
                'any.only': `Status must be one of: ${validStatuses.join(', ')}`
            }),
            event: Joi.string().valid(...validEvents).optional().messages({
                'any.only': `Event must be one of: ${validEvents.join(', ')}`
            }),
            sort: Joi.string().valid(...validSortFields).optional().default('createdAt').messages({
                'any.only': `Sort field must be one of: ${validSortFields.join(', ')}`
            }),
            order: Joi.string().valid(...validSortOrders).optional().default('desc').messages({
                'any.only': `Sort order must be one of: ${validSortOrders.join(', ')}`
            })
        });

        return schema.validate(data);
    }

    async createWebhook(data) {
        const validEvents = [
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
        ];

        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(100).required().messages({
                'string.empty': 'Webhook name is required',
                'string.min': 'Webhook name must be at least 1 character',
                'string.max': 'Webhook name cannot exceed 100 characters',
                'any.required': 'Webhook name is required'
            }),
            description: Joi.string().max(500).optional().allow('').messages({
                'string.max': 'Description cannot exceed 500 characters'
            }),
            url: Joi.string().uri({ scheme: ['https'] }).required().messages({
                'string.uri': 'URL must be a valid HTTPS endpoint',
                'any.required': 'Webhook URL is required'
            }),
            events: Joi.array().items(
                Joi.string().valid(...validEvents).messages({
                    'any.only': `Event must be one of: ${validEvents.join(', ')}`
                })
            ).min(1).required().messages({
                'array.min': 'At least one event must be specified',
                'any.required': 'Events are required'
            }),
            headers: Joi.object().pattern(
                Joi.string(),
                Joi.string()
            ).optional().messages({
                'object.base': 'Headers must be an object with string keys and values'
            }),
            secret: Joi.string().min(8).max(256).optional().messages({
                'string.min': 'Secret must be at least 8 characters long',
                'string.max': 'Secret cannot exceed 256 characters'
            }),
            active: Joi.boolean().optional().default(true).messages({
                'boolean.base': 'Active must be true or false'
            }),
            retryPolicy: Joi.object({
                maxAttempts: Joi.number().integer().min(1).max(10).optional().default(3).messages({
                    'number.base': 'Max attempts must be a number',
                    'number.integer': 'Max attempts must be an integer',
                    'number.min': 'Max attempts must be at least 1',
                    'number.max': 'Max attempts cannot exceed 10'
                }),
                backoffMultiplier: Joi.number().min(1).max(5).optional().default(2).messages({
                    'number.base': 'Backoff multiplier must be a number',
                    'number.min': 'Backoff multiplier must be at least 1',
                    'number.max': 'Backoff multiplier cannot exceed 5'
                })
            }).optional()
        });

        return schema.validate(data);
    }

    async updateWebhook(data) {
        const validEvents = [
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
        ];

        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(100).optional().messages({
                'string.empty': 'Webhook name cannot be empty',
                'string.min': 'Webhook name must be at least 1 character',
                'string.max': 'Webhook name cannot exceed 100 characters'
            }),
            description: Joi.string().max(500).optional().allow('').messages({
                'string.max': 'Description cannot exceed 500 characters'
            }),
            url: Joi.string().uri({ scheme: ['https'] }).optional().messages({
                'string.uri': 'URL must be a valid HTTPS endpoint'
            }),
            events: Joi.array().items(
                Joi.string().valid(...validEvents).messages({
                    'any.only': `Event must be one of: ${validEvents.join(', ')}`
                })
            ).min(1).optional().messages({
                'array.min': 'At least one event must be specified'
            }),
            headers: Joi.object().pattern(
                Joi.string(),
                Joi.string()
            ).optional().messages({
                'object.base': 'Headers must be an object with string keys and values'
            }),
            secret: Joi.string().min(8).max(256).optional().allow('').messages({
                'string.min': 'Secret must be at least 8 characters long',
                'string.max': 'Secret cannot exceed 256 characters'
            }),
            active: Joi.boolean().optional().messages({
                'boolean.base': 'Active must be true or false'
            }),
            retryPolicy: Joi.object({
                maxAttempts: Joi.number().integer().min(1).max(10).optional().messages({
                    'number.base': 'Max attempts must be a number',
                    'number.integer': 'Max attempts must be an integer',
                    'number.min': 'Max attempts must be at least 1',
                    'number.max': 'Max attempts cannot exceed 10'
                }),
                backoffMultiplier: Joi.number().min(1).max(5).optional().messages({
                    'number.base': 'Backoff multiplier must be a number',
                    'number.min': 'Backoff multiplier must be at least 1',
                    'number.max': 'Backoff multiplier cannot exceed 5'
                })
            }).optional()
        });

        return schema.validate(data);
    }

    async listIntegrationsQuery(data) {
        const validStatuses = ['connected', 'available', 'coming_soon'];
        const validCategories = ['automation', 'signatures', 'crm', 'accounting', 'storage', 'communication'];

        const schema = Joi.object({
            status: Joi.string().valid(...validStatuses).optional().messages({
                'any.only': `Status must be one of: ${validStatuses.join(', ')}`
            }),
            category: Joi.string().valid(...validCategories).optional().messages({
                'any.only': `Category must be one of: ${validCategories.join(', ')}`
            })
        });

        return schema.validate(data);
    }

    async connectIntegration(data) {
        const validIntegrations = [
            'docusign', 'salesforce', 'hubspot', 'zapier', 'slack', 'microsoft-teams',
            'google-drive', 'dropbox', 'quickbooks', 'stripe', 'paypal', 'twilio',
            'sendgrid', 'mailchimp', 'zoom', 'calendly'
        ];
        const validSyncIntervals = ['realtime', 'hourly', 'daily', 'weekly', 'manual'];
        const validSyncDirections = ['inbound', 'outbound', 'bidirectional'];
        const validEnvironments = ['sandbox', 'production'];

        const schema = Joi.object({
            // API Key based authentication
            apiKey: Joi.string().min(8).max(500).optional().messages({
                'string.min': 'API key must be at least 8 characters long',
                'string.max': 'API key cannot exceed 500 characters'
            }),
            apiSecret: Joi.string().min(8).max(500).optional().messages({
                'string.min': 'API secret must be at least 8 characters long',
                'string.max': 'API secret cannot exceed 500 characters'
            }),
            
            // OAuth based authentication
            authorizationCode: Joi.string().min(8).max(1000).optional().messages({
                'string.min': 'Authorization code must be at least 8 characters long',
                'string.max': 'Authorization code cannot exceed 1000 characters'
            }),
            redirectUri: Joi.string().uri({ scheme: ['https'] }).optional().messages({
                'string.uri': 'Redirect URI must be a valid HTTPS URL'
            }),
            clientId: Joi.string().min(8).max(200).optional().messages({
                'string.min': 'Client ID must be at least 8 characters long',
                'string.max': 'Client ID cannot exceed 200 characters'
            }),
            clientSecret: Joi.string().min(8).max(500).optional().messages({
                'string.min': 'Client secret must be at least 8 characters long',
                'string.max': 'Client secret cannot exceed 500 characters'
            }),
            
            // Integration metadata
            environment: Joi.string().valid(...validEnvironments).optional().default('production').messages({
                'any.only': `Environment must be one of: ${validEnvironments.join(', ')}`
            }),
            accountId: Joi.string().max(100).optional().messages({
                'string.max': 'Account ID cannot exceed 100 characters'
            }),
            
            // Configuration object
            config: Joi.object({
                syncInterval: Joi.string().valid(...validSyncIntervals).optional().default('hourly').messages({
                    'any.only': `Sync interval must be one of: ${validSyncIntervals.join(', ')}`
                }),
                syncDirection: Joi.string().valid(...validSyncDirections).optional().default('bidirectional').messages({
                    'any.only': `Sync direction must be one of: ${validSyncDirections.join(', ')}`
                }),
                enabled: Joi.boolean().optional().default(true).messages({
                    'boolean.base': 'Enabled must be true or false'
                }),
                region: Joi.string().max(50).optional().messages({
                    'string.max': 'Region cannot exceed 50 characters'
                }),
                version: Joi.string().max(20).optional().messages({
                    'string.max': 'Version cannot exceed 20 characters'
                })
            }).unknown(true).optional() // Allow additional custom fields
        });

        return schema.validate(data);
    }

    async updateUserNotifications(data) {
        const validFrequencies = ['instant', 'daily', 'weekly', 'never'];
        const validChannels = ['email', 'sms', 'push', 'inApp'];
        const validNotificationTypes = [
            'documents.created', 'documents.updated', 'documents.signed', 'documents.completed', 
            'documents.rejected', 'documents.expired', 'documents.shared',
            'workflows.started', 'workflows.completed', 'workflows.cancelled',
            'contacts.created', 'contacts.updated', 'contacts.deleted',
            'users.invited', 'users.joined', 'users.left',
            'organization.updated', 'billing.updated', 'security.alerts'
        ];

        const schema = Joi.object({
            channels: Joi.object({
                email: Joi.object({
                    enabled: Joi.boolean().optional().messages({
                        'boolean.base': 'Email enabled must be true or false'
                    }),
                    frequency: Joi.string().valid(...validFrequencies).optional().messages({
                        'any.only': `Email frequency must be one of: ${validFrequencies.join(', ')}`
                    }),
                    quietHours: Joi.object({
                        enabled: Joi.boolean().optional().messages({
                            'boolean.base': 'Quiet hours enabled must be true or false'
                        }),
                        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
                            'string.pattern.base': 'Quiet hours start time must be in HH:MM format (e.g., 20:00)'
                        }),
                        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
                            'string.pattern.base': 'Quiet hours end time must be in HH:MM format (e.g., 09:00)'
                        })
                    }).optional()
                }).optional(),
                sms: Joi.object({
                    enabled: Joi.boolean().optional().messages({
                        'boolean.base': 'SMS enabled must be true or false'
                    }),
                    frequency: Joi.string().valid(...validFrequencies).optional().messages({
                        'any.only': `SMS frequency must be one of: ${validFrequencies.join(', ')}`
                    })
                }).optional(),
                push: Joi.object({
                    enabled: Joi.boolean().optional().messages({
                        'boolean.base': 'Push enabled must be true or false'
                    }),
                    frequency: Joi.string().valid(...validFrequencies).optional().messages({
                        'any.only': `Push frequency must be one of: ${validFrequencies.join(', ')}`
                    })
                }).optional(),
                inApp: Joi.object({
                    enabled: Joi.boolean().optional().messages({
                        'boolean.base': 'In-app enabled must be true or false'
                    }),
                    sound: Joi.boolean().optional().messages({
                        'boolean.base': 'In-app sound must be true or false'
                    }),
                    desktop: Joi.boolean().optional().messages({
                        'boolean.base': 'Desktop notifications must be true or false'
                    })
                }).optional()
            }).optional(),
            preferences: Joi.object({
                documents: Joi.object({
                    created: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document created notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    updated: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document updated notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    signed: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document signed notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    completed: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document completed notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    rejected: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document rejected notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    expired: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document expired notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    shared: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Document shared notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                workflows: Joi.object({
                    started: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Workflow started notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    completed: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Workflow completed notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    cancelled: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Workflow cancelled notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                contacts: Joi.object({
                    created: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Contact created notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    updated: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Contact updated notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    deleted: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Contact deleted notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                users: Joi.object({
                    invited: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `User invited notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    joined: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `User joined notification channels must be one of: ${validChannels.join(', ')}`
                    }),
                    left: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `User left notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                organization: Joi.object({
                    updated: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Organization updated notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                billing: Joi.object({
                    updated: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Billing updated notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional(),
                security: Joi.object({
                    alerts: Joi.object().pattern(
                        Joi.string().valid(...validChannels),
                        Joi.boolean()
                    ).optional().messages({
                        'object.pattern.match': `Security alerts notification channels must be one of: ${validChannels.join(', ')}`
                    })
                }).optional()
            }).optional()
        });

        return schema.validate(data);
    }
}

module.exports = new SettingsValidation();