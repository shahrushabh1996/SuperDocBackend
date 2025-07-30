const contactService = require('./contact.service');
const contactValidation = require('./contact.validation');
const csv = require('csv-parser');
const fs = require('fs');
const Contact = require('./contact.model');

class ContactController {
    constructor() {}

    async createContact(req, res) {
        try {
            const { error, value } = await contactValidation.createContact(req.body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const contact = await contactService.createContact(value, userId, organizationId);

            return res.status(201).json({
                message: 'Contact created successfully',
                data: {
                    _id: contact._id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email,
                    phone: contact.phone,
                    company: contact.company,
                    language: contact.language,
                    tags: contact.tags,
                    notes: contact.notes,
                    createdAt: contact.createdAt
                }
            });

        } catch (error) {
            if (error.message === 'DUPLICATE_EMAIL') {
                return res.status(409).json({
                    message: 'A contact with this email already exists in your organization'
                });
            } else {
                console.error('Error creating contact:', error);
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }
        }
    }

    async getContactById(req, res) {
        try {
            const { error, value } = await contactValidation.getContactById(req.params);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }

            const organizationId = req.user.organizationId;
            const contact = await contactService.getContactById(value.id, organizationId);

            // Add stats object to the response
            const contactWithStats = {
                ...contact.toObject(),
                stats: {
                    documentsUploaded: 0,
                    completionRate: 0,
                    documentsMissing: 0
                }
            };

            return res.status(200).json({
                message: 'Contact retrieved successfully',
                data: contactWithStats
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    message: 'Contact not found'
                });
            } else {
                console.error('Error getting contact:', error);
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }
        }
    }

    async getAllContacts(req, res) {
        try {
            const { error, value } = await contactValidation.getAllContacts(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const organizationId = req.user.organizationId;
            const result = await contactService.getContactsByOrganization(organizationId, value);

            return res.status(200).json({
                success: true,
                data: {
                    contacts: result.contacts,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        pages: result.pages
                    }
                }
            });

        } catch (error) {
            console.error('Error getting contacts:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateContact(req, res) {
        try {
            const { error, value } = await contactValidation.updateContact({
                id: req.params.id,
                ...req.body
            });
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;
            const { id, ...updateData } = value;

            const contact = await contactService.updateContact(id, updateData, userId, organizationId);

            return res.status(200).json({
                message: 'Contact updated successfully',
                data: {
                    _id: contact._id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    email: contact.email,
                    phone: contact.phone,
                    company: contact.company,
                    language: contact.language,
                    tags: contact.tags,
                    notes: contact.notes,
                    createdAt: contact.createdAt
                }
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    message: 'Contact not found'
                });
            } else if (error.message === 'DUPLICATE_EMAIL') {
                return res.status(409).json({
                    message: 'A contact with this email already exists in your organization'
                });
            } else {
                console.error('Error updating contact:', error);
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }
        }
    }

    async deleteContact(req, res) {
        try {
            const { error, value } = await contactValidation.deleteContact(req.params);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }

            const organizationId = req.user.organizationId;
            await contactService.deleteContact(value.id, organizationId);

            return res.status(200).json({
                message: 'Contact deleted successfully'
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    message: 'Contact not found'
                });
            } else {
                console.error('Error deleting contact:', error);
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }
        }
    }

    async updateContactStatus(req, res) {
        try {
            const { id, action } = req.params;
            
            // Validate action parameter
            if (!['disable', 'enable'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid action. Use 'disable' or 'enable'"
                });
            }

            const { error, value } = await contactValidation.getContactById({ id });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;
            
            const result = await contactService.updateContactStatus(value.id, action, userId, organizationId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    _id: result.contact._id,
                    firstName: result.contact.firstName,
                    lastName: result.contact.lastName,
                    email: result.contact.email,
                    phone: result.contact.phone,
                    company: result.contact.company,
                    status: result.contact.status,
                    updatedAt: result.contact.updatedAt
                }
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            } else {
                console.error('Error updating contact status:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }

    async importContacts(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'CSV file is required'
                });
            }

            let mapping = {};
            try {
                mapping = req.body.mapping ? JSON.parse(req.body.mapping) : {};
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid mapping JSON format'
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;
            const results = [];
            const errors = [];
            let rowIndex = 0;
            const emailsInFile = new Set(); // Track emails already seen in the CSV

            return new Promise((resolve, reject) => {
                const stream = fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', (row) => {
                        rowIndex++;
                        
                        const contactData = {
                            userId,
                            organizationId,
                            source: 'import'
                        };

                        Object.keys(mapping).forEach(csvField => {
                            const contactField = mapping[csvField];
                            if (row[csvField]) {
                                if (contactField === 'tags') {
                                    contactData[contactField] = row[csvField].split(',').map(tag => tag.trim());
                                } else {
                                    contactData[contactField] = row[csvField];
                                }
                            }
                        });

                        Object.keys(row).forEach(csvField => {
                            if (!mapping[csvField]) {
                                const lowerField = csvField.toLowerCase();
                                if (lowerField.includes('firstname') || lowerField.includes('first_name')) {
                                    contactData.firstName = row[csvField];
                                } else if (lowerField.includes('lastname') || lowerField.includes('last_name')) {
                                    contactData.lastName = row[csvField];
                                } else if (lowerField.includes('email')) {
                                    contactData.email = row[csvField];
                                } else if (lowerField.includes('phone')) {
                                    contactData.phone = row[csvField];
                                } else if (lowerField.includes('company')) {
                                    contactData.company = row[csvField];
                                } else if (lowerField.includes('language')) {
                                    contactData.language = row[csvField];
                                }
                            }
                        });

                        const contact = new Contact(contactData);
                        const validationError = contact.validateSync();
                        
                        if (validationError) {
                            errors.push({
                                row: rowIndex,
                                reason: validationError.message
                            });
                        } else if (contactData.email) {
                            // Check if email already exists in the CSV file
                            const emailLower = contactData.email.toLowerCase();
                            if (emailsInFile.has(emailLower)) {
                                errors.push({
                                    row: rowIndex,
                                    reason: `Duplicate email ${contactData.email} found in CSV file`
                                });
                            } else {
                                emailsInFile.add(emailLower);
                                results.push(contactData);
                            }
                        } else {
                            results.push(contactData);
                        }
                    })
                    .on('end', async () => {
                        try {
                            let insertedCount = 0;
                            const insertErrors = [];

                            if (results.length > 0) {
                                // Extract all emails from results to check for duplicates
                                const emails = results.map(r => r.email).filter(email => email);
                                
                                // Find existing contacts with these emails in the organization
                                const existingContacts = await Contact.find({
                                    organizationId: organizationId,
                                    email: { $in: emails },
                                    status: { $ne: 'DELETED' }
                                }).select('email').lean();
                                
                                const existingEmails = new Set(existingContacts.map(c => c.email.toLowerCase()));
                                
                                // Separate contacts into new and duplicate
                                const newContacts = [];
                                const duplicateErrors = [];
                                
                                results.forEach((contact, index) => {
                                    if (contact.email && existingEmails.has(contact.email.toLowerCase())) {
                                        duplicateErrors.push({
                                            row: index + 1,
                                            reason: `Contact with email ${contact.email} already exists in your organization`
                                        });
                                    } else {
                                        newContacts.push(contact);
                                    }
                                });
                                
                                // Insert only new contacts
                                if (newContacts.length > 0) {
                                    try {
                                        const insertResult = await Contact.insertMany(newContacts, { ordered: false });
                                        insertedCount = insertResult.length;
                                    } catch (insertError) {
                                        if (insertError.writeErrors) {
                                            insertedCount = insertError.result.insertedIds ? Object.keys(insertError.result.insertedIds).length : 0;
                                            insertError.writeErrors.forEach(writeError => {
                                                const errorRow = newContacts.findIndex(r => r._id === writeError.err.op._id) + 1;
                                                insertErrors.push({
                                                    row: errorRow,
                                                    reason: writeError.err.errmsg || writeError.err.message
                                                });
                                            });
                                        }
                                    }
                                }
                                
                                // Add duplicate errors to the insertErrors array
                                insertErrors.push(...duplicateErrors);
                            }

                            fs.unlinkSync(req.file.path);

                            const response = {
                                success: true,
                                message: 'Import completed',
                                summary: {
                                    total: rowIndex,
                                    inserted: insertedCount,
                                    failed: errors.length + insertErrors.length
                                },
                                errors: [...errors, ...insertErrors]
                            };

                            res.status(200).json(response);
                            resolve();
                        } catch (error) {
                            console.error('Error processing CSV import:', error);
                            fs.unlinkSync(req.file.path);
                            res.status(500).json({
                                success: false,
                                message: 'Internal server error during import'
                            });
                            reject(error);
                        }
                    })
                    .on('error', (error) => {
                        console.error('Error reading CSV file:', error);
                        fs.unlinkSync(req.file.path);
                        res.status(400).json({
                            success: false,
                            message: 'Invalid CSV file format'
                        });
                        reject(error);
                    });
            });

        } catch (error) {
            console.error('Error importing contacts:', error);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async shareDocument(req, res) {
        try {
            const { error, value } = await contactValidation.shareDocument({
                contactId: req.params.id,
                ...req.body
            });
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;
            const { contactId, documentId, permissions, expiresAt } = value;

            await contactService.shareDocumentWithContact(
                contactId, 
                documentId, 
                permissions, 
                expiresAt, 
                userId, 
                organizationId
            );

            return res.status(200).json({
                success: true,
                message: 'Document shared successfully'
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            } else if (error.message === 'DOCUMENT_NOT_FOUND') {
                return res.status(403).json({
                    success: false,
                    message: 'Document not found or access denied'
                });
            } else if (error.message === 'SHARE_FAILED') {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to share document'
                });
            } else {
                console.error('Error sharing document:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }

    async getSharedDocuments(req, res) {
        try {
            const { error, value } = await contactValidation.getContactById(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const organizationId = req.user.organizationId;
            const sharedDocuments = await contactService.getSharedDocuments(value.id, organizationId);

            return res.status(200).json({
                success: true,
                data: sharedDocuments
            });

        } catch (error) {
            if (error.message === 'CONTACT_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            } else {
                console.error('Error getting shared documents:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }
}

module.exports = new ContactController();