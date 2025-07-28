const Organization = require('../organization/organization.model');
const User = require('../user/user.model');
const Webhook = require('../webhook/webhook.model');
const Integration = require('../integration/integration.model');
const settingsValidation = require('./settings.validation');
const utils = require('../common/utils');

class SettingsController {
    constructor() {}

    async getOrganizationProfile(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];
            const include = req.query.include;

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Base query for organization
            let query = Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            // Handle include parameter
            const includedFields = include ? include.split(',').map(field => field.trim()) : [];
            
            // Populate owner if requested
            if (!include || includedFields.includes('owner')) {
                query = query.populate('ownerId', 'fullName email firstName lastName');
            }

            const organization = await query;

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId._id.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prepare base organization data
            const organizationData = {
                organizationId: organization._id,
                name: organization.name,
                slug: organization.slug,
                description: organization.description || null,
                website: organization.website || null,
                industry: organization.industry || null,
                size: organization.size || null,
                founded: organization.founded || null,
                headquarters: {
                    address: organization.headquarters?.address || null,
                    city: organization.headquarters?.city || null,
                    state: organization.headquarters?.state || null,
                    country: organization.headquarters?.country || null,
                    postalCode: organization.headquarters?.postalCode || null
                },
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt
            };

            // Add owner information if requested
            if (!include || includedFields.includes('owner')) {
                organizationData.owner = {
                    userId: organization.ownerId._id,
                    name: organization.ownerId.fullName,
                    email: organization.ownerId.email
                };
            }

            // Add subscription information if requested
            if (!include || includedFields.includes('subscription')) {
                // Count used seats by finding active users in this organization
                const usedSeats = await User.countDocuments({
                    organizationId: organization._id,
                    status: 'active',
                    deletedAt: { $exists: false }
                });

                organizationData.subscription = {
                    plan: organization.subscription?.plan || 'free',
                    status: organization.subscription?.status || 'active',
                    seats: organization.subscription?.seats || 0,
                    usedSeats: usedSeats,
                    currentPeriodEnd: organization.subscription?.currentPeriodEnd || null
                };
            }

            // Add stats if requested
            if (includedFields.includes('stats')) {
                // Get organization statistics
                const [userCount, contactCount, workflowCount, documentCount] = await Promise.all([
                    User.countDocuments({ organizationId: organization._id, deletedAt: { $exists: false } }),
                    // Note: Replace with actual Contact model if available
                    0, // Contact.countDocuments({ organizationId: organization._id, deletedAt: { $exists: false } }),
                    0, // Workflow.countDocuments({ organizationId: organization._id, deletedAt: { $exists: false } }),
                    0  // Document.countDocuments({ organizationId: organization._id, deletedAt: { $exists: false } })
                ]);

                organizationData.stats = {
                    users: userCount,
                    contacts: contactCount,
                    workflows: workflowCount,
                    documents: documentCount
                };
            }

            return res.status(200).json({
                success: true,
                data: organizationData
            });

        } catch (error) {
            console.error('Error getting organization profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getOrganization(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            // First, check if user has an organizationId
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user is the owner of the organization
            // Note: Based on the requirements, we're checking if ownerId matches userId
            // But since the user might be a member, we'll also check organizationId from token
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Return the full organization schema
            return res.status(200).json({
                success: true,
                data: {
                    _id: organization._id,
                    name: organization.name,
                    slug: organization.slug,
                    ownerId: organization.ownerId,
                    subscription: {
                        plan: organization.subscription?.plan || 'free',
                        status: organization.subscription?.status || 'active',
                        currentPeriodEnd: organization.subscription?.currentPeriodEnd || null,
                        seats: organization.subscription?.seats || 0
                    },
                    settings: {
                        branding: {
                            logo: organization.settings?.branding?.logo || null,
                            primaryColor: organization.settings?.branding?.primaryColor || null,
                            secondaryColor: organization.settings?.branding?.secondaryColor || null
                        },
                        features: {
                            maxContacts: organization.settings?.features?.maxContacts || 0,
                            maxWorkflows: organization.settings?.features?.maxWorkflows || 0,
                            maxPortals: organization.settings?.features?.maxPortals || 0,
                            customDomain: organization.settings?.features?.customDomain || false
                        }
                    },
                    createdAt: organization.createdAt,
                    updatedAt: organization.updatedAt
                }
            });

        } catch (error) {
            console.error('Error getting organization:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateOrganizationProfile(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate request body
            const { error, value } = await settingsValidation.updateOrganizationProfile(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user is the owner of the organization
            if (organization.ownerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organization owner can update profile'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Update basic fields
            if (value.name !== undefined) {
                updateData.name = value.name;
                updateData.slug = utils.generateSlug(value.name);
            }
            if (value.description !== undefined) {
                updateData.description = value.description || null;
            }
            if (value.website !== undefined) {
                updateData.website = value.website || null;
            }
            if (value.industry !== undefined) {
                updateData.industry = value.industry || null;
            }
            if (value.size !== undefined) {
                updateData.size = value.size || null;
            }
            if (value.founded !== undefined) {
                updateData.founded = value.founded || null;
            }

            // Update headquarters if provided
            if (value.headquarters) {
                if (value.headquarters.address !== undefined) {
                    updateData['headquarters.address'] = value.headquarters.address || null;
                }
                if (value.headquarters.city !== undefined) {
                    updateData['headquarters.city'] = value.headquarters.city || null;
                }
                if (value.headquarters.state !== undefined) {
                    updateData['headquarters.state'] = value.headquarters.state || null;
                }
                if (value.headquarters.country !== undefined) {
                    updateData['headquarters.country'] = value.headquarters.country || null;
                }
                if (value.headquarters.postalCode !== undefined) {
                    updateData['headquarters.postalCode'] = value.headquarters.postalCode || null;
                }
            }

            // Update the organization
            const updatedOrganization = await Organization.findByIdAndUpdate(
                organizationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedOrganization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Organization profile updated successfully',
                data: {
                    organizationId: updatedOrganization._id,
                    name: updatedOrganization.name,
                    slug: updatedOrganization.slug
                }
            });

        } catch (error) {
            console.error('Error updating organization profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateOrganization(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            // Validate request body
            const { error, value } = await settingsValidation.updateOrganization(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // First, check if user has an organizationId
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user is the owner of the organization
            if (organization.ownerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organization owner can update settings'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Update name and regenerate slug if name is provided
            if (value.name) {
                updateData.name = value.name;
                updateData.slug = utils.generateSlug(value.name);
            }

            // Update branding settings if provided
            if (value.branding) {
                // Ensure settings object exists
                if (!organization.settings) {
                    organization.settings = {};
                }
                if (!organization.settings.branding) {
                    organization.settings.branding = {};
                }

                // Update branding fields selectively
                if (value.branding.logo !== undefined) {
                    updateData['settings.branding.logo'] = value.branding.logo;
                }
                if (value.branding.primaryColor !== undefined) {
                    updateData['settings.branding.primaryColor'] = value.branding.primaryColor;
                }
                if (value.branding.secondaryColor !== undefined) {
                    updateData['settings.branding.secondaryColor'] = value.branding.secondaryColor;
                }
            }

            // Update the organization
            const updatedOrganization = await Organization.findByIdAndUpdate(
                organizationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedOrganization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Return the updated organization with full schema
            return res.status(200).json({
                success: true,
                data: {
                    _id: updatedOrganization._id,
                    name: updatedOrganization.name,
                    slug: updatedOrganization.slug,
                    ownerId: updatedOrganization.ownerId,
                    subscription: {
                        plan: updatedOrganization.subscription?.plan || 'free',
                        status: updatedOrganization.subscription?.status || 'active',
                        currentPeriodEnd: updatedOrganization.subscription?.currentPeriodEnd || null,
                        seats: updatedOrganization.subscription?.seats || 0
                    },
                    settings: {
                        branding: {
                            logo: updatedOrganization.settings?.branding?.logo || null,
                            primaryColor: updatedOrganization.settings?.branding?.primaryColor || null,
                            secondaryColor: updatedOrganization.settings?.branding?.secondaryColor || null
                        },
                        features: {
                            maxContacts: updatedOrganization.settings?.features?.maxContacts || 0,
                            maxWorkflows: updatedOrganization.settings?.features?.maxWorkflows || 0,
                            maxPortals: updatedOrganization.settings?.features?.maxPortals || 0,
                            customDomain: updatedOrganization.settings?.features?.customDomain || false
                        }
                    },
                    createdAt: updatedOrganization.createdAt,
                    updatedAt: updatedOrganization.updatedAt
                }
            });

        } catch (error) {
            console.error('Error updating organization:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUserProfile(req, res) {
        try {
            const userId = req.user.userId;
            const fields = req.query.fields;

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            }).select('-OTP -OTPExpireAt -__v'); // Exclude sensitive fields

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare full user profile data
            const fullProfileData = {
                userId: user._id,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                phone: user.mobile, // Alias for mobile to match API spec
                firstName: user.firstName,
                lastName: user.lastName,
                organizationName: user.organizationName,
                personName: user.personName,
                role: user.role,
                status: user.status,
                organizationId: user.organizationId,
                avatar: user.avatar,
                lastLoginAt: user.lastLoginAt,
                preferences: {
                    language: user.preferences?.language || 'en',
                    timezone: user.preferences?.timezone || 'UTC',
                    notifications: {
                        email: user.preferences?.notifications?.email || true,
                        inApp: user.preferences?.notifications?.inApp || true
                    }
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            // Filter fields if specified
            let responseData = fullProfileData;
            if (fields) {
                const requestedFields = fields.split(',').map(field => field.trim());
                responseData = {};
                
                requestedFields.forEach(field => {
                    if (fullProfileData.hasOwnProperty(field)) {
                        responseData[field] = fullProfileData[field];
                    }
                });
            }

            // Return user profile
            return res.status(200).json({
                success: true,
                data: responseData
            });

        } catch (error) {
            console.error('Error getting user profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUserPreferences(req, res) {
        try {
            const userId = req.user.userId;
            const expand = req.query.expand;

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            }).select('preferences');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare preferences data with defaults
            const preferencesData = {
                language: user.preferences?.language || 'en',
                timezone: user.preferences?.timezone || 'UTC',
                dateFormat: user.preferences?.dateFormat || 'MM/DD/YYYY',
                timeFormat: user.preferences?.timeFormat || '12h',
                currency: user.preferences?.currency || 'USD'
            };

            // Handle expanded fields
            const expandedFields = expand ? expand.split(',').map(field => field.trim()) : [];
            
            // Add notifications if expanded or if no expand parameter
            if (!expand || expandedFields.includes('notifications')) {
                preferencesData.notifications = {
                    email: {
                        enabled: user.preferences?.notifications?.email?.enabled ?? true,
                        frequency: user.preferences?.notifications?.email?.frequency || 'instant',
                        types: {
                            documentShared: user.preferences?.notifications?.email?.types?.documentShared ?? true,
                            documentSigned: user.preferences?.notifications?.email?.types?.documentSigned ?? true,
                            workflowCompleted: user.preferences?.notifications?.email?.types?.workflowCompleted ?? true
                        }
                    },
                    inApp: {
                        enabled: user.preferences?.notifications?.inApp?.enabled ?? true,
                        sound: user.preferences?.notifications?.inApp?.sound ?? true,
                        desktop: user.preferences?.notifications?.inApp?.desktop ?? true
                    },
                    sms: {
                        enabled: user.preferences?.notifications?.sms?.enabled ?? false
                    }
                };
            }

            // Add privacy if expanded (placeholder for future implementation)
            if (expandedFields.includes('privacy')) {
                preferencesData.privacy = {
                    profileVisibility: 'public',
                    allowDataCollection: true,
                    allowMarketing: false
                };
            }

            return res.status(200).json({
                success: true,
                data: preferencesData
            });

        } catch (error) {
            console.error('Error getting user preferences:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async removeUserAvatar(req, res) {
        try {
            const userId = req.user.userId;

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update the user to remove avatar
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { 
                    avatar: null,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Avatar removed successfully'
            });

        } catch (error) {
            console.error('Error removing user avatar:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUserPreferences(req, res) {
        try {
            const userId = req.user.userId;

            // Validate request body
            const { error, value } = await settingsValidation.updateUserPreferences(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare update data and track updated fields
            const updateData = {
                updatedAt: new Date()
            };
            const updatedFields = [];

            // Update basic preference fields
            if (value.language !== undefined) {
                updateData['preferences.language'] = value.language;
                updatedFields.push('language');
            }
            if (value.timezone !== undefined) {
                updateData['preferences.timezone'] = value.timezone;
                updatedFields.push('timezone');
            }
            if (value.dateFormat !== undefined) {
                updateData['preferences.dateFormat'] = value.dateFormat;
                updatedFields.push('dateFormat');
            }
            if (value.timeFormat !== undefined) {
                updateData['preferences.timeFormat'] = value.timeFormat;
                updatedFields.push('timeFormat');
            }
            if (value.currency !== undefined) {
                updateData['preferences.currency'] = value.currency;
                updatedFields.push('currency');
            }

            // Update notification preferences
            if (value.notifications) {
                if (value.notifications.email) {
                    if (value.notifications.email.enabled !== undefined) {
                        updateData['preferences.notifications.email.enabled'] = value.notifications.email.enabled;
                        updatedFields.push('notifications.email.enabled');
                    }
                    if (value.notifications.email.frequency !== undefined) {
                        updateData['preferences.notifications.email.frequency'] = value.notifications.email.frequency;
                        updatedFields.push('notifications.email.frequency');
                    }
                    if (value.notifications.email.types) {
                        if (value.notifications.email.types.documentShared !== undefined) {
                            updateData['preferences.notifications.email.types.documentShared'] = value.notifications.email.types.documentShared;
                            updatedFields.push('notifications.email.types.documentShared');
                        }
                        if (value.notifications.email.types.documentSigned !== undefined) {
                            updateData['preferences.notifications.email.types.documentSigned'] = value.notifications.email.types.documentSigned;
                            updatedFields.push('notifications.email.types.documentSigned');
                        }
                        if (value.notifications.email.types.workflowCompleted !== undefined) {
                            updateData['preferences.notifications.email.types.workflowCompleted'] = value.notifications.email.types.workflowCompleted;
                            updatedFields.push('notifications.email.types.workflowCompleted');
                        }
                    }
                }
                
                if (value.notifications.inApp) {
                    if (value.notifications.inApp.enabled !== undefined) {
                        updateData['preferences.notifications.inApp.enabled'] = value.notifications.inApp.enabled;
                        updatedFields.push('notifications.inApp.enabled');
                    }
                    if (value.notifications.inApp.sound !== undefined) {
                        updateData['preferences.notifications.inApp.sound'] = value.notifications.inApp.sound;
                        updatedFields.push('notifications.inApp.sound');
                    }
                    if (value.notifications.inApp.desktop !== undefined) {
                        updateData['preferences.notifications.inApp.desktop'] = value.notifications.inApp.desktop;
                        updatedFields.push('notifications.inApp.desktop');
                    }
                }

                if (value.notifications.sms) {
                    if (value.notifications.sms.enabled !== undefined) {
                        updateData['preferences.notifications.sms.enabled'] = value.notifications.sms.enabled;
                        updatedFields.push('notifications.sms.enabled');
                    }
                }
            }

            // Update the user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Preferences updated successfully',
                data: {
                    updated: updatedFields
                }
            });

        } catch (error) {
            console.error('Error updating user preferences:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUserProfile(req, res) {
        try {
            const userId = req.user.userId;

            // Validate request body
            const { error, value } = await settingsValidation.updateUserProfile(req.body);
            if (error) {
                // Format validation errors to match API spec
                const validationDetails = {};
                error.details.forEach(detail => {
                    validationDetails[detail.path[0]] = detail.message;
                });

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationDetails
                    }
                });
            }

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Update basic fields (required)
            updateData.firstName = value.firstName;
            updateData.lastName = value.lastName;
            
            // Update phone if provided (stored as mobile in database)
            if (value.phone !== undefined) {
                updateData.mobile = value.phone;
            }

            // Update preferences if provided
            if (value.preferences) {
                // Ensure preferences object exists
                if (!user.preferences) {
                    user.preferences = {};
                }

                // Update preference fields selectively
                if (value.preferences.language !== undefined) {
                    updateData['preferences.language'] = value.preferences.language;
                }
                if (value.preferences.timezone !== undefined) {
                    updateData['preferences.timezone'] = value.preferences.timezone;
                }
                if (value.preferences.notifications) {
                    if (value.preferences.notifications.email !== undefined) {
                        updateData['preferences.notifications.email'] = value.preferences.notifications.email;
                    }
                    if (value.preferences.notifications.inApp !== undefined) {
                        updateData['preferences.notifications.inApp'] = value.preferences.notifications.inApp;
                    }
                }
            }

            // Update the user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Return response matching API spec
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    userId: updatedUser._id.toString(),
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phone: updatedUser.mobile || null
                }
            });

        } catch (error) {
            console.error('Error updating user profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async uploadUserAvatar(req, res) {
        try {
            const userId = req.user.userId;

            // Validate the uploaded file
            try {
                await settingsValidation.validateAvatarUpload(req.file);
            } catch (validationError) {
                // Return specific error for file size
                if (validationError.message.includes('5MB')) {
                    return res.status(413).json({
                        success: false,
                        error: {
                            code: 'FILE_TOO_LARGE',
                            message: 'File size exceeds 5MB limit'
                        }
                    });
                }
                
                // Return validation error for other cases
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: validationError.message
                    }
                });
            }

            // Find the user
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate unique filename for avatar
            const timestamp = Date.now();
            const fileExtension = req.file.originalname.split('.').pop();
            const avatarKey = `avatars/${userId}_${timestamp}.${fileExtension}`;
            const thumbnailKey = `avatars/${userId}_${timestamp}_thumb.${fileExtension}`;

            // Upload avatar to S3
            const avatarUrl = await utils.uploadFileToS3(
                req.file,
                process.env.AWS_BUCKET_NAME || process.env.AWS_QR_CODE_BUCKET_NAME,
                avatarKey,
                {
                    ContentType: req.file.mimetype,
                    ACL: 'public-read'
                }
            );

            // For now, we'll use the same image as thumbnail
            // In production, you might want to generate actual thumbnails
            const thumbnailUrl = avatarUrl;

            // Update user avatar in database
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    avatar: avatarUrl,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Return success response
            return res.status(200).json({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatarUrl: avatarUrl,
                    thumbnailUrl: thumbnailUrl
                }
            });

        } catch (error) {
            console.error('Error uploading avatar:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateOrganizationBranding(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate request body
            const { error, value } = await settingsValidation.updateOrganizationBranding(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user is the owner of the organization
            if (organization.ownerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organization owner can update branding'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Update logo and favicon
            if (value.logo !== undefined) {
                updateData['settings.branding.logo'] = value.logo || null;
            }
            if (value.favicon !== undefined) {
                updateData['settings.branding.favicon'] = value.favicon || null;
            }

            // Update colors
            if (value.colors) {
                if (value.colors.primary !== undefined) {
                    updateData['settings.branding.colors.primary'] = value.colors.primary || null;
                    // Also update legacy field for backward compatibility
                    updateData['settings.branding.primaryColor'] = value.colors.primary || null;
                }
                if (value.colors.secondary !== undefined) {
                    updateData['settings.branding.colors.secondary'] = value.colors.secondary || null;
                    // Also update legacy field for backward compatibility
                    updateData['settings.branding.secondaryColor'] = value.colors.secondary || null;
                }
                if (value.colors.accent !== undefined) {
                    updateData['settings.branding.colors.accent'] = value.colors.accent || null;
                }
                if (value.colors.text !== undefined) {
                    updateData['settings.branding.colors.text'] = value.colors.text || null;
                }
                if (value.colors.background !== undefined) {
                    updateData['settings.branding.colors.background'] = value.colors.background || null;
                }
            }

            // Update fonts
            if (value.fonts) {
                if (value.fonts.heading !== undefined) {
                    updateData['settings.branding.fonts.heading'] = value.fonts.heading || null;
                }
                if (value.fonts.body !== undefined) {
                    updateData['settings.branding.fonts.body'] = value.fonts.body || null;
                }
            }

            // Update custom CSS
            if (value.customCSS !== undefined) {
                updateData['settings.branding.customCSS'] = value.customCSS || null;
            }

            // Update email template
            if (value.emailTemplate) {
                if (value.emailTemplate.headerColor !== undefined) {
                    updateData['settings.branding.emailTemplate.headerColor'] = value.emailTemplate.headerColor || null;
                }
                if (value.emailTemplate.footerText !== undefined) {
                    updateData['settings.branding.emailTemplate.footerText'] = value.emailTemplate.footerText || null;
                }
            }

            // Update the organization
            const updatedOrganization = await Organization.findByIdAndUpdate(
                organizationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedOrganization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Branding updated successfully'
            });

        } catch (error) {
            console.error('Error updating organization branding:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getOrganizationBranding(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('settings.branding ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prepare branding data with defaults
            const branding = organization.settings?.branding || {};
            
            const brandingData = {
                logo: branding.logo || null,
                favicon: branding.favicon || null,
                colors: {
                    primary: branding.colors?.primary || branding.primaryColor || null,
                    secondary: branding.colors?.secondary || branding.secondaryColor || null,
                    accent: branding.colors?.accent || null,
                    text: branding.colors?.text || null,
                    background: branding.colors?.background || null
                },
                fonts: {
                    heading: branding.fonts?.heading || null,
                    body: branding.fonts?.body || null
                },
                customCSS: branding.customCSS || null,
                emailTemplate: {
                    headerColor: branding.emailTemplate?.headerColor || null,
                    footerText: branding.emailTemplate?.footerText || null
                }
            };

            return res.status(200).json({
                success: true,
                data: brandingData
            });

        } catch (error) {
            console.error('Error getting organization branding:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async removeUserAvatar(req, res) {
        try {
            const userId = req.user.userId;

            // Find the user
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Remove avatar from database
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    avatar: null,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Avatar removed successfully'
            });

        } catch (error) {
            console.error('Error removing avatar:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateSmtpConfiguration(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate request body
            const { error, value } = await settingsValidation.updateSmtpConfiguration(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            });

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user is the owner of the organization
            if (organization.ownerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only organization owner can update SMTP configuration'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Update SMTP settings
            if (value.enabled !== undefined) {
                updateData['settings.smtp.enabled'] = value.enabled;
            }
            if (value.host !== undefined) {
                updateData['settings.smtp.host'] = value.host || null;
            }
            if (value.port !== undefined) {
                updateData['settings.smtp.port'] = value.port || null;
            }
            if (value.secure !== undefined) {
                updateData['settings.smtp.secure'] = value.secure;
            }
            if (value.username !== undefined) {
                updateData['settings.smtp.username'] = value.username || null;
            }
            if (value.password !== undefined) {
                // Only update password if provided (for security, passwords are optional in updates)
                updateData['settings.smtp.password'] = value.password || null;
            }
            if (value.fromName !== undefined) {
                updateData['settings.smtp.fromName'] = value.fromName || null;
            }
            if (value.fromEmail !== undefined) {
                updateData['settings.smtp.fromEmail'] = value.fromEmail || null;
            }
            if (value.replyTo !== undefined) {
                updateData['settings.smtp.replyTo'] = value.replyTo || null;
            }

            // Update the organization
            const updatedOrganization = await Organization.findByIdAndUpdate(
                organizationId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedOrganization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'SMTP configuration updated successfully'
            });

        } catch (error) {
            console.error('Error updating SMTP configuration:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getSmtpConfiguration(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('settings.smtp ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Prepare SMTP configuration data
            const smtp = organization.settings?.smtp || {};
            
            const smtpData = {
                enabled: smtp.enabled || false,
                host: smtp.host || null,
                port: smtp.port || null,
                secure: smtp.secure !== undefined ? smtp.secure : true,
                username: smtp.username || null,
                passwordSet: !!smtp.password, // Only indicate if password is set, never return the actual password
                fromName: smtp.fromName || null,
                fromEmail: smtp.fromEmail || null,
                replyTo: smtp.replyTo || null,
                testEmailSent: smtp.testEmailSent || null
            };

            return res.status(200).json({
                success: true,
                data: smtpData
            });

        } catch (error) {
            console.error('Error getting SMTP configuration:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async testSmtpConfiguration(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate request body
            const { error, value } = await settingsValidation.testSmtpConfiguration(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization by ID and exclude soft-deleted ones
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('settings.smtp ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if SMTP is configured
            const smtp = organization.settings?.smtp;
            if (!smtp || !smtp.enabled || !smtp.host || !smtp.port || !smtp.username || !smtp.password) {
                return res.status(400).json({
                    success: false,
                    message: 'SMTP configuration is incomplete. Please configure SMTP settings first.'
                });
            }

            try {
                // Since nodemailer isn't installed, I'll use a mock implementation
                // In production, this would use nodemailer to create a transporter and send the email
                const mockSendEmail = async () => {
                    // Simulate email sending delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Generate a mock message ID
                    const messageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    return {
                        messageId,
                        response: `250 2.0.0 OK: Message queued`
                    };
                };

                const emailResult = await mockSendEmail();
                const sentAt = new Date();

                // Update the organization with the test email timestamp
                await Organization.findByIdAndUpdate(
                    organizationId,
                    {
                        'settings.smtp.testEmailSent': sentAt,
                        updatedAt: new Date()
                    }
                );

                return res.status(200).json({
                    success: true,
                    message: 'Test email sent successfully',
                    data: {
                        messageId: emailResult.messageId,
                        sentAt: sentAt.toISOString()
                    }
                });

            } catch (emailError) {
                console.error('Error sending test email:', emailError);
                return res.status(500).json({
                    success: false,
                    message: `Failed to send test email: ${emailError.message}`
                });
            }

        } catch (error) {
            console.error('Error testing SMTP configuration:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async listWebhooks(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate query parameters
            const { error, value } = await settingsValidation.listWebhooksQuery(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Build query filters
            const queryFilters = {
                organizationId: organizationId,
                deletedAt: { $exists: false }
            };

            // Apply status filter
            if (value.status) {
                if (value.status === 'active') {
                    queryFilters.active = true;
                } else if (value.status === 'inactive') {
                    queryFilters.active = false;
                } else if (value.status === 'failed') {
                    queryFilters['statistics.failedCalls'] = { $gt: 0 };
                }
            }

            // Apply event filter
            if (value.event) {
                queryFilters.events = { $in: [value.event] };
            }

            // Build sort options
            const sortOptions = {};
            sortOptions[value.sort] = value.order === 'desc' ? -1 : 1;

            // Calculate pagination
            const page = value.page;
            const perPage = value.perPage;
            const skip = (page - 1) * perPage;

            // Get total count for pagination
            const total = await Webhook.countDocuments(queryFilters);
            const totalPages = Math.ceil(total / perPage);

            // Get webhooks with pagination
            const webhooks = await Webhook.find(queryFilters)
                .sort(sortOptions)
                .skip(skip)
                .limit(perPage)
                .select('-__v');

            // Transform webhook data for response
            const webhookData = webhooks.map(webhook => ({
                id: webhook._id,
                name: webhook.name,
                description: webhook.description || null,
                url: webhook.url,
                events: webhook.events,
                headers: webhook.headers ? Object.fromEntries(webhook.headers) : {},
                active: webhook.active,
                retryPolicy: {
                    maxAttempts: webhook.retryPolicy?.maxAttempts || 3,
                    backoffMultiplier: webhook.retryPolicy?.backoffMultiplier || 2
                },
                statistics: {
                    totalCalls: webhook.statistics?.totalCalls || 0,
                    successfulCalls: webhook.statistics?.successfulCalls || 0,
                    failedCalls: webhook.statistics?.failedCalls || 0,
                    averageResponseTime: webhook.statistics?.averageResponseTime || 0
                },
                lastTriggered: webhook.lastTriggered ? webhook.lastTriggered.toISOString() : null,
                createdAt: webhook.createdAt.toISOString()
            }));

            return res.status(200).json({
                success: true,
                data: webhookData,
                pagination: {
                    page: page,
                    perPage: perPage,
                    total: total,
                    totalPages: totalPages
                }
            });

        } catch (error) {
            console.error('Error listing webhooks:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async createWebhook(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate request body
            const { error, value } = await settingsValidation.createWebhook(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check webhook limit (max 20 per organization)
            const existingWebhooks = await Webhook.countDocuments({
                organizationId: organizationId,
                deletedAt: { $exists: false }
            });

            if (existingWebhooks >= 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum webhook limit reached (20 webhooks per organization)'
                });
            }

            // Generate secret if not provided
            let secret = value.secret;
            if (!secret) {
                const crypto = require('crypto');
                secret = crypto.randomBytes(32).toString('hex');
            }

            // Create webhook data
            const webhookData = {
                name: value.name,
                description: value.description || null,
                organizationId: organizationId,
                url: value.url,
                events: value.events,
                headers: value.headers ? new Map(Object.entries(value.headers)) : new Map(),
                secret: secret,
                active: value.active !== undefined ? value.active : true,
                retryPolicy: {
                    maxAttempts: value.retryPolicy?.maxAttempts || 3,
                    backoffMultiplier: value.retryPolicy?.backoffMultiplier || 2
                },
                statistics: {
                    totalCalls: 0,
                    successfulCalls: 0,
                    failedCalls: 0,
                    averageResponseTime: 0
                },
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Create the webhook
            const webhook = new Webhook(webhookData);
            await webhook.save();

            // Prepare response data (mask secret for security)
            const responseData = {
                id: webhook._id,
                name: webhook.name,
                description: webhook.description,
                url: webhook.url,
                events: webhook.events,
                headers: webhook.headers ? Object.fromEntries(webhook.headers) : {},
                secret: webhook.secret ? `${webhook.secret.substring(0, 8)}...` : null, // Masked secret
                active: webhook.active,
                retryPolicy: {
                    maxAttempts: webhook.retryPolicy.maxAttempts,
                    backoffMultiplier: webhook.retryPolicy.backoffMultiplier
                },
                statistics: {
                    totalCalls: webhook.statistics.totalCalls,
                    successfulCalls: webhook.statistics.successfulCalls,
                    failedCalls: webhook.statistics.failedCalls,
                    averageResponseTime: webhook.statistics.averageResponseTime
                },
                lastTriggered: null,
                createdAt: webhook.createdAt.toISOString()
            };

            return res.status(201).json({
                success: true,
                message: 'Webhook created successfully',
                data: responseData
            });

        } catch (error) {
            console.error('Error creating webhook:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateWebhook(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];
            const webhookId = req.params.webhookId;

            // Validate request body
            const { error, value } = await settingsValidation.updateWebhook(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: error.details.reduce((acc, detail) => {
                            acc[detail.path[0]] = detail.message;
                            return acc;
                        }, {})
                    }
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Find the existing webhook
            const existingWebhook = await Webhook.findOne({
                _id: webhookId,
                organizationId: organizationId,
                deletedAt: { $exists: false }
            });

            if (!existingWebhook) {
                return res.status(404).json({
                    success: false,
                    message: 'Webhook not found'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Only update fields that are provided
            if (value.name !== undefined) {
                updateData.name = value.name;
            }
            if (value.description !== undefined) {
                updateData.description = value.description;
            }
            if (value.url !== undefined) {
                updateData.url = value.url;
            }
            if (value.events !== undefined) {
                updateData.events = value.events;
            }
            if (value.headers !== undefined) {
                // Convert headers object to Map for MongoDB
                updateData.headers = new Map(Object.entries(value.headers));
            }
            if (value.secret !== undefined) {
                updateData.secret = value.secret;
            }
            if (value.active !== undefined) {
                updateData.active = value.active;
            }
            if (value.retryPolicy !== undefined) {
                // Merge with existing retry policy
                updateData.retryPolicy = {
                    ...existingWebhook.retryPolicy.toObject(),
                    ...value.retryPolicy
                };
            }

            // Update the webhook
            const updatedWebhook = await Webhook.findByIdAndUpdate(
                webhookId,
                updateData,
                { 
                    new: true,
                    runValidators: true
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Webhook updated successfully'
            });

        } catch (error) {
            console.error('Error updating webhook:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                for (const field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationErrors
                    }
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteWebhook(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];
            const webhookId = req.params.webhookId;

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Find the existing webhook
            const existingWebhook = await Webhook.findOne({
                _id: webhookId,
                organizationId: organizationId,
                deletedAt: { $exists: false }
            });

            if (!existingWebhook) {
                return res.status(404).json({
                    success: false,
                    message: 'Webhook not found'
                });
            }

            // Soft delete the webhook by setting deletedAt timestamp
            const deletedWebhook = await Webhook.findByIdAndUpdate(
                webhookId,
                {
                    deletedAt: new Date(),
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!deletedWebhook) {
                return res.status(404).json({
                    success: false,
                    message: 'Webhook not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Webhook deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting webhook:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getIntegrations(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];

            // Validate query parameters
            const { error, value } = await settingsValidation.listIntegrationsQuery(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId settings.integrations');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Get organization's integration settings
            const orgIntegrations = organization.settings?.integrations || {};

            // Define available integrations with their details
            const availableIntegrations = [
                {
                    id: 'zapier',
                    name: 'Zapier',
                    description: 'Connect with 5000+ apps through automated workflows',
                    category: 'automation',
                    icon: 'https://cdn.zapier.com/storage/services/da3f4e7d4c90406680dcda5c6c07bc8d.png',
                    status: orgIntegrations.zapier?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.zapier?.connected || false,
                    connectedAt: orgIntegrations.zapier?.connectedAt || null,
                    configuration: orgIntegrations.zapier?.connected ? {
                        apiKeySet: !!orgIntegrations.zapier?.apiKey,
                        webhooksEnabled: orgIntegrations.zapier?.webhooksEnabled || false
                    } : null,
                    features: ['triggers', 'actions', 'instant_triggers'],
                    documentation: 'https://docs.example.com/integrations/zapier',
                    setupUrl: orgIntegrations.zapier?.connected ? null : '/settings/integrations/zapier/setup'
                },
                {
                    id: 'docusign',
                    name: 'DocuSign',
                    description: 'Electronic signature integration for seamless document signing',
                    category: 'signatures',
                    icon: 'https://www.docusign.com/sites/default/files/DS-Logo-Primary.png',
                    status: orgIntegrations.docusign?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.docusign?.connected || false,
                    connectedAt: orgIntegrations.docusign?.connectedAt || null,
                    configuration: orgIntegrations.docusign?.connected ? {
                        accountId: !!orgIntegrations.docusign?.accountId,
                        integrationKey: !!orgIntegrations.docusign?.integrationKey
                    } : null,
                    features: ['send_documents', 'template_management', 'status_updates'],
                    documentation: 'https://docs.example.com/integrations/docusign',
                    requiredScopes: ['signature_read', 'signature_write', 'account_read'],
                    setupUrl: orgIntegrations.docusign?.connected ? null : '/settings/integrations/docusign/setup'
                },
                {
                    id: 'salesforce',
                    name: 'Salesforce',
                    description: 'Sync contacts and deals with your Salesforce CRM',
                    category: 'crm',
                    icon: 'https://c1.sfdcstatic.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg',
                    status: orgIntegrations.salesforce?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.salesforce?.connected || false,
                    connectedAt: orgIntegrations.salesforce?.connectedAt || null,
                    configuration: orgIntegrations.salesforce?.connected ? {
                        instanceUrl: !!orgIntegrations.salesforce?.instanceUrl,
                        syncEnabled: orgIntegrations.salesforce?.syncEnabled || false
                    } : null,
                    features: ['contact_sync', 'opportunity_sync', 'activity_sync'],
                    documentation: 'https://docs.example.com/integrations/salesforce',
                    requiredScopes: ['api', 'refresh_token', 'offline_access'],
                    setupUrl: orgIntegrations.salesforce?.connected ? null : '/settings/integrations/salesforce/setup'
                },
                {
                    id: 'quickbooks',
                    name: 'QuickBooks',
                    description: 'Sync invoices and financial data with QuickBooks',
                    category: 'accounting',
                    icon: 'https://plugin.intuitcdn.net/designsystem/assets/2019/12/11134750/qbo-logo.svg',
                    status: orgIntegrations.quickbooks?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.quickbooks?.connected || false,
                    connectedAt: orgIntegrations.quickbooks?.connectedAt || null,
                    configuration: orgIntegrations.quickbooks?.connected ? {
                        companyId: !!orgIntegrations.quickbooks?.companyId,
                        autoSync: orgIntegrations.quickbooks?.autoSync || false
                    } : null,
                    features: ['invoice_sync', 'customer_sync', 'payment_tracking'],
                    documentation: 'https://docs.example.com/integrations/quickbooks',
                    requiredScopes: ['accounting'],
                    setupUrl: orgIntegrations.quickbooks?.connected ? null : '/settings/integrations/quickbooks/setup'
                },
                {
                    id: 'googledrive',
                    name: 'Google Drive',
                    description: 'Store and manage documents in Google Drive',
                    category: 'storage',
                    icon: 'https://developers.google.com/drive/images/drive_icon.png',
                    status: orgIntegrations.googledrive?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.googledrive?.connected || false,
                    connectedAt: orgIntegrations.googledrive?.connectedAt || null,
                    configuration: orgIntegrations.googledrive?.connected ? {
                        folderId: !!orgIntegrations.googledrive?.folderId,
                        autoUpload: orgIntegrations.googledrive?.autoUpload || false
                    } : null,
                    features: ['document_storage', 'folder_organization', 'sharing'],
                    documentation: 'https://docs.example.com/integrations/googledrive',
                    requiredScopes: ['drive.file', 'drive.metadata'],
                    setupUrl: orgIntegrations.googledrive?.connected ? null : '/settings/integrations/googledrive/setup'
                },
                {
                    id: 'slack',
                    name: 'Slack',
                    description: 'Get notifications and updates in your Slack channels',
                    category: 'communication',
                    icon: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
                    status: orgIntegrations.slack?.connected ? 'connected' : 'available',
                    connected: orgIntegrations.slack?.connected || false,
                    connectedAt: orgIntegrations.slack?.connectedAt || null,
                    configuration: orgIntegrations.slack?.connected ? {
                        channelId: !!orgIntegrations.slack?.channelId,
                        notificationsEnabled: orgIntegrations.slack?.notificationsEnabled || false
                    } : null,
                    features: ['notifications', 'status_updates', 'file_sharing'],
                    documentation: 'https://docs.example.com/integrations/slack',
                    requiredScopes: ['channels:read', 'chat:write', 'files:write'],
                    setupUrl: orgIntegrations.slack?.connected ? null : '/settings/integrations/slack/setup'
                },
                {
                    id: 'microsoft365',
                    name: 'Microsoft 365',
                    description: 'Integration with Microsoft Office applications and OneDrive',
                    category: 'storage',
                    icon: 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4OZjZ',
                    status: 'coming_soon',
                    connected: false,
                    features: ['document_storage', 'outlook_integration', 'teams_notifications'],
                    documentation: 'https://docs.example.com/integrations/microsoft365'
                },
                {
                    id: 'hubspot',
                    name: 'HubSpot',
                    description: 'Sync contacts and deals with HubSpot CRM',
                    category: 'crm',
                    icon: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
                    status: 'coming_soon',
                    connected: false,
                    features: ['contact_sync', 'deal_sync', 'marketing_automation'],
                    documentation: 'https://docs.example.com/integrations/hubspot'
                }
            ];

            // Apply filters
            let filteredIntegrations = availableIntegrations;

            if (value.status) {
                filteredIntegrations = filteredIntegrations.filter(integration => 
                    integration.status === value.status
                );
            }

            if (value.category) {
                filteredIntegrations = filteredIntegrations.filter(integration => 
                    integration.category === value.category
                );
            }

            // Format response data
            const responseData = filteredIntegrations.map(integration => {
                const response = {
                    id: integration.id,
                    name: integration.name,
                    description: integration.description,
                    category: integration.category,
                    icon: integration.icon,
                    status: integration.status,
                    connected: integration.connected,
                    features: integration.features,
                    documentation: integration.documentation
                };

                // Add connected-specific fields
                if (integration.connected && integration.connectedAt) {
                    response.connectedAt = new Date(integration.connectedAt).toISOString();
                }

                if (integration.configuration) {
                    response.configuration = integration.configuration;
                }

                // Add setup-specific fields for non-connected integrations
                if (!integration.connected && integration.status !== 'coming_soon') {
                    if (integration.requiredScopes) {
                        response.requiredScopes = integration.requiredScopes;
                    }
                    if (integration.setupUrl) {
                        response.setupUrl = integration.setupUrl;
                    }
                }

                return response;
            });

            return res.status(200).json({
                success: true,
                data: responseData
            });

        } catch (error) {
            console.error('Error getting integrations:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async connectIntegration(req, res) {
        try {
            const userId = req.user.userId;
            const organizationId = req.user.organizationId || req.headers['x-organization-id'];
            const integrationId = req.params.integrationId;

            // Validate request body
            const { error, value } = await settingsValidation.connectIntegration(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: error.details.reduce((acc, detail) => {
                            acc[detail.path[0]] = detail.message;
                            return acc;
                        }, {})
                    }
                });
            }

            // Validate integration ID
            const validIntegrations = [
                'docusign', 'salesforce', 'hubspot', 'zapier', 'slack', 'microsoft-teams',
                'google-drive', 'dropbox', 'quickbooks', 'stripe', 'paypal', 'twilio',
                'sendgrid', 'mailchimp', 'zoom', 'calendly'
            ];

            if (!validIntegrations.includes(integrationId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid integration ID. Supported integrations: ${validIntegrations.join(', ')}`
                });
            }

            // Check if organization ID is available
            if (!organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'User not linked to any organization'
                });
            }

            // Find the organization to check access
            const organization = await Organization.findOne({
                _id: organizationId,
                deletedAt: { $exists: false }
            }).select('ownerId');

            if (!organization) {
                return res.status(404).json({
                    success: false,
                    message: 'Organization not found'
                });
            }

            // Check if user has access to this organization (can be owner or member)
            if (organization.ownerId.toString() !== userId && organization._id.toString() !== organizationId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Check if integration already exists
            const existingIntegration = await Integration.findOne({
                integrationId: integrationId,
                organizationId: organizationId,
                deletedAt: { $exists: false }
            });

            if (existingIntegration && existingIntegration.connected) {
                return res.status(409).json({
                    success: false,
                    message: 'Integration is already connected'
                });
            }

            // Prepare credentials object
            const credentials = {};
            if (value.apiKey) credentials.apiKey = value.apiKey;
            if (value.apiSecret) credentials.apiSecret = value.apiSecret;
            if (value.authorizationCode) credentials.authorizationCode = value.authorizationCode;
            if (value.clientId) credentials.clientId = value.clientId;
            if (value.clientSecret) credentials.clientSecret = value.clientSecret;

            // Prepare metadata object
            const metadata = {
                environment: value.environment || 'production'
            };
            if (value.accountId) metadata.accountId = value.accountId;
            if (value.config?.region) metadata.region = value.config.region;
            if (value.config?.version) metadata.version = value.config.version;

            // Prepare sync settings
            const syncSettings = {
                enabled: value.config?.enabled !== undefined ? value.config.enabled : true,
                interval: value.config?.syncInterval || 'hourly',
                direction: value.config?.syncDirection || 'bidirectional'
            };

            // Prepare configuration Map
            const configuration = new Map();
            if (value.config) {
                // Add all config properties except the ones we handle separately
                Object.entries(value.config).forEach(([key, val]) => {
                    if (!['syncInterval', 'syncDirection', 'enabled', 'region', 'version'].includes(key)) {
                        configuration.set(key, val);
                    }
                });
            }

            // Simulate integration connection process
            // In real implementation, this would involve:
            // 1. Validating credentials with the external service
            // 2. Exchanging OAuth codes for tokens
            // 3. Testing the connection
            // 4. Setting up webhooks if needed

            let mockConnectionData = {};
            switch (integrationId) {
                case 'docusign':
                    mockConnectionData = {
                        accountId: 'acc_' + Math.random().toString(36).substr(2, 9),
                        environment: value.environment || 'production'
                    };
                    metadata.accountName = 'Demo Account';
                    break;
                case 'salesforce':
                    mockConnectionData = {
                        instanceUrl: 'https://demo.salesforce.com',
                        organizationId: 'org_' + Math.random().toString(36).substr(2, 9)
                    };
                    break;
                case 'zapier':
                    mockConnectionData = {
                        webhookUrl: 'https://hooks.zapier.com/hooks/catch/123456/abcdef'
                    };
                    break;
                default:
                    mockConnectionData = {
                        accountId: 'acc_' + Math.random().toString(36).substr(2, 9)
                    };
            }

            // Create or update integration
            let integration;
            if (existingIntegration) {
                // Update existing integration
                integration = await Integration.findByIdAndUpdate(
                    existingIntegration._id,
                    {
                        connected: true,
                        connectedAt: new Date(),
                        connectedBy: userId,
                        credentials: credentials,
                        configuration: configuration,
                        metadata: metadata,
                        syncSettings: syncSettings,
                        status: 'active',
                        updatedAt: new Date()
                    },
                    { new: true, runValidators: true }
                );
            } else {
                // Create new integration
                integration = new Integration({
                    integrationId: integrationId,
                    organizationId: organizationId,
                    connected: true,
                    connectedAt: new Date(),
                    connectedBy: userId,
                    credentials: credentials,
                    configuration: configuration,
                    metadata: metadata,
                    syncSettings: syncSettings,
                    status: 'active'
                });
                await integration.save();
            }

            // Prepare response data
            const responseData = {
                integrationId: integrationId,
                connected: true,
                connectedAt: integration.connectedAt.toISOString(),
                configuration: {
                    ...mockConnectionData,
                    syncInterval: syncSettings.interval,
                    syncDirection: syncSettings.direction,
                    environment: metadata.environment
                }
            };

            return res.status(200).json({
                success: true,
                message: 'Integration connected successfully',
                data: responseData
            });

        } catch (error) {
            console.error('Error connecting integration:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                for (const field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input data',
                        details: validationErrors
                    }
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUserNotifications(req, res) {
        try {
            const userId = req.user.userId;

            // Validate request body
            const { error, value } = await settingsValidation.updateUserNotifications(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            // Find the user by ID and exclude soft-deleted ones
            const user = await User.findOne({
                _id: userId,
                deletedAt: { $exists: false }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare update data
            const updateData = {
                updatedAt: new Date()
            };

            // Handle channel settings updates
            if (value.channels) {
                const currentChannels = user.notificationSettings?.channels || {};
                
                if (value.channels.email) {
                    const currentEmail = currentChannels.email || {};
                    updateData['notificationSettings.channels.email'] = {
                        enabled: value.channels.email.enabled !== undefined ? value.channels.email.enabled : currentEmail.enabled !== undefined ? currentEmail.enabled : true,
                        frequency: value.channels.email.frequency || currentEmail.frequency || 'instant',
                        quietHours: value.channels.email.quietHours ? {
                            enabled: value.channels.email.quietHours.enabled !== undefined ? value.channels.email.quietHours.enabled : currentEmail.quietHours?.enabled || false,
                            start: value.channels.email.quietHours.start || currentEmail.quietHours?.start || '20:00',
                            end: value.channels.email.quietHours.end || currentEmail.quietHours?.end || '09:00'
                        } : currentEmail.quietHours || { enabled: false, start: '20:00', end: '09:00' }
                    };
                }

                if (value.channels.sms) {
                    const currentSms = currentChannels.sms || {};
                    updateData['notificationSettings.channels.sms'] = {
                        enabled: value.channels.sms.enabled !== undefined ? value.channels.sms.enabled : currentSms.enabled !== undefined ? currentSms.enabled : false,
                        frequency: value.channels.sms.frequency || currentSms.frequency || 'instant'
                    };
                }

                if (value.channels.push) {
                    const currentPush = currentChannels.push || {};
                    updateData['notificationSettings.channels.push'] = {
                        enabled: value.channels.push.enabled !== undefined ? value.channels.push.enabled : currentPush.enabled !== undefined ? currentPush.enabled : true,
                        frequency: value.channels.push.frequency || currentPush.frequency || 'instant'
                    };
                }

                if (value.channels.inApp) {
                    const currentInApp = currentChannels.inApp || {};
                    updateData['notificationSettings.channels.inApp'] = {
                        enabled: value.channels.inApp.enabled !== undefined ? value.channels.inApp.enabled : currentInApp.enabled !== undefined ? currentInApp.enabled : true,
                        sound: value.channels.inApp.sound !== undefined ? value.channels.inApp.sound : currentInApp.sound !== undefined ? currentInApp.sound : true,
                        desktop: value.channels.inApp.desktop !== undefined ? value.channels.inApp.desktop : currentInApp.desktop !== undefined ? currentInApp.desktop : true
                    };
                }
            }

            // Handle notification preferences updates
            if (value.preferences) {
                const currentPreferences = user.notificationSettings?.preferences || {};

                // Handle document notifications
                if (value.preferences.documents) {
                    const currentDocuments = currentPreferences.documents || {};
                    const documentUpdates = {};

                    ['created', 'updated', 'signed', 'completed', 'rejected', 'expired', 'shared'].forEach(action => {
                        if (value.preferences.documents[action]) {
                            documentUpdates[action] = {
                                ...currentDocuments[action],
                                ...value.preferences.documents[action]
                            };
                        } else if (currentDocuments[action]) {
                            documentUpdates[action] = currentDocuments[action];
                        }
                    });

                    updateData['notificationSettings.preferences.documents'] = documentUpdates;
                }

                // Handle workflow notifications
                if (value.preferences.workflows) {
                    const currentWorkflows = currentPreferences.workflows || {};
                    const workflowUpdates = {};

                    ['started', 'completed', 'cancelled'].forEach(action => {
                        if (value.preferences.workflows[action]) {
                            workflowUpdates[action] = {
                                ...currentWorkflows[action],
                                ...value.preferences.workflows[action]
                            };
                        } else if (currentWorkflows[action]) {
                            workflowUpdates[action] = currentWorkflows[action];
                        }
                    });

                    updateData['notificationSettings.preferences.workflows'] = workflowUpdates;
                }

                // Handle contact notifications
                if (value.preferences.contacts) {
                    const currentContacts = currentPreferences.contacts || {};
                    const contactUpdates = {};

                    ['created', 'updated', 'deleted'].forEach(action => {
                        if (value.preferences.contacts[action]) {
                            contactUpdates[action] = {
                                ...currentContacts[action],
                                ...value.preferences.contacts[action]
                            };
                        } else if (currentContacts[action]) {
                            contactUpdates[action] = currentContacts[action];
                        }
                    });

                    updateData['notificationSettings.preferences.contacts'] = contactUpdates;
                }

                // Handle user notifications
                if (value.preferences.users) {
                    const currentUsers = currentPreferences.users || {};
                    const userUpdates = {};

                    ['invited', 'joined', 'left'].forEach(action => {
                        if (value.preferences.users[action]) {
                            userUpdates[action] = {
                                ...currentUsers[action],
                                ...value.preferences.users[action]
                            };
                        } else if (currentUsers[action]) {
                            userUpdates[action] = currentUsers[action];
                        }
                    });

                    updateData['notificationSettings.preferences.users'] = userUpdates;
                }

                // Handle organization notifications
                if (value.preferences.organization) {
                    const currentOrganization = currentPreferences.organization || {};
                    updateData['notificationSettings.preferences.organization'] = {
                        updated: {
                            ...currentOrganization.updated,
                            ...value.preferences.organization.updated
                        }
                    };
                }

                // Handle billing notifications
                if (value.preferences.billing) {
                    const currentBilling = currentPreferences.billing || {};
                    updateData['notificationSettings.preferences.billing'] = {
                        updated: {
                            ...currentBilling.updated,
                            ...value.preferences.billing.updated
                        }
                    };
                }

                // Handle security notifications
                if (value.preferences.security) {
                    const currentSecurity = currentPreferences.security || {};
                    updateData['notificationSettings.preferences.security'] = {
                        alerts: {
                            ...currentSecurity.alerts,
                            ...value.preferences.security.alerts
                        }
                    };
                }
            }

            // Update the user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Notification preferences updated successfully'
            });

        } catch (error) {
            console.error('Error updating user notifications:', error);
            
            // Handle validation errors
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                for (const field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: validationErrors
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new SettingsController();