const DocumentDAO = require('./document.dao');
const Document = require('./document.model');
const utils = require('../common/utils');
const { v4: uuidv4 } = require('uuid');

class DocumentService {
    
    async uploadDocument(fileData, userId, organizationId) {
        try {
            const uniqueKey = `${uuidv4()}-${fileData.originalname}`;
            
            const uploadedFile = await utils.uploadImageToS3({
                ...fileData,
                originalname: uniqueKey
            });

            const documentData = {
                userId,
                organizationId,
                name: fileData.name,
                description: fileData.description || '',
                type: fileData.type || 'document',
                mimeType: fileData.mimetype,
                size: fileData.size,
                url: uploadedFile,
                folder: fileData.folder || '',
                tags: fileData.tags || [],
                isTemplate: fileData.isTemplate || false,
                permissions: {
                    isPublic: false,
                    sharedWith: [],
                    contactIds: []
                },
                metadata: {
                    pages: 0,
                    words: 0,
                    characters: 0,
                    signatures: 0
                },
                createdBy: userId,
                updatedBy: userId
            };

            const document = new Document(documentData);
            const savedDocument = await document.save();
            
            return savedDocument;
        } catch (error) {
            throw new Error(`Document upload failed: ${error.message}`);
        }
    }

    async getDocumentById(documentId, userId, organizationId) {
        try {
            const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
            
            if (!document || document.isDeleted) {
                throw new Error('Document not found');
            }

            // Check if user has permission to view this document
            if (document.userId.toString() !== userId && 
                !document.permissions.isPublic && 
                !document.permissions.sharedWith.includes(userId)) {
                throw new Error('Access denied');
            }

            return document;
        } catch (error) {
            throw new Error(`Failed to retrieve document: ${error.message}`);
        }
    }

    async getUserDocuments(userId, organizationId, queryParams) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                folder = '',
                tags = [],
                type = '',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            let filter = {
                organizationId,
                isDeleted: false, // Exclude soft deleted documents
                $or: [
                    { userId },
                    { 'permissions.isPublic': true },
                    { 'permissions.sharedWith': userId }
                ]
            };

            if (search) {
                filter.name = { $regex: search, $options: 'i' };
            }

            if (folder) {
                filter.folder = folder;
            }

            if (tags.length > 0) {
                filter.tags = { $in: tags };
            }

            if (type) {
                filter.type = type;
            }

            const documents = await Document.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email');

            const total = await Document.countDocuments(filter);

            return {
                documents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to retrieve documents: ${error.message}`);
        }
    }

    async updateDocument(documentId, updateData, userId, organizationId) {
        try {
            const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
            
            if (!document || document.isDeleted) {
                throw new Error('Document not found');
            }

            // Check if user has permission to update this document
            if (document.userId.toString() !== userId && 
                !document.permissions.sharedWith.includes(userId)) {
                throw new Error('Access denied');
            }

            const updatedDocument = await Document.findByIdAndUpdate(
                documentId,
                { ...updateData, updatedBy: userId, updatedAt: new Date() },
                { new: true, runValidators: true }
            );

            return updatedDocument;
        } catch (error) {
            throw new Error(`Failed to update document: ${error.message}`);
        }
    }

    async deleteDocument(documentId, userId, organizationId) {
        try {
            const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
            
            if (!document) {
                throw new Error('Document not found');
            }

            // Check if document is already deleted
            if (document.isDeleted) {
                throw new Error('Document not found');
            }

            // Check if user has permission to delete this document
            if (document.userId.toString() !== userId) {
                throw new Error('Access denied');
            }

            // Soft delete the document
            await Document.findByIdAndUpdate(
                documentId,
                {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: userId,
                    updatedAt: new Date(),
                    updatedBy: userId
                },
                { new: true }
            );

            return { message: 'Document deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }

    async shareDocument(documentId, shareData, userId, organizationId) {
        try {
            const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
            
            if (!document || document.isDeleted) {
                throw new Error('Document not found');
            }

            // Check if user has permission to share this document
            if (document.userId.toString() !== userId) {
                throw new Error('Access denied');
            }

            const updateData = {
                'permissions.isPublic': shareData.isPublic || false,
                'permissions.sharedWith': shareData.shareWith || document.permissions.sharedWith,
                'permissions.contactIds': shareData.contactIds || document.permissions.contactIds,
                'permissions.expiresAt': shareData.expiresAt || document.permissions.expiresAt,
                updatedBy: userId,
                updatedAt: new Date()
            };

            const updatedDocument = await Document.findByIdAndUpdate(
                documentId,
                updateData,
                { new: true, runValidators: true }
            );

            return updatedDocument;
        } catch (error) {
            throw new Error(`Failed to share document: ${error.message}`);
        }
    }

    async generateDownloadUrl(documentId, userId, organizationId) {
        try {
            const document = await DocumentDAO.findDocumentByIdAndOrganization(documentId, organizationId);
            
            if (!document || document.isDeleted) {
                throw new Error('Document not found');
            }

            // Check if user has permission to download this document
            if (document.userId.toString() !== userId && 
                !document.permissions.isPublic && 
                !document.permissions.sharedWith.includes(userId)) {
                throw new Error('Access denied');
            }

            // Extract the S3 key from the document URL
            const s3Key = document.url.split('/').pop(); // Get filename from URL
            const bucketName = process.env.AWS_QR_CODE_BUCKET_NAME;
            
            // Generate signed URL for 5 minutes
            const signedUrl = utils.generateSignedDownloadUrl(bucketName, s3Key, 300);
            
            return {
                downloadUrl: signedUrl,
                expiresIn: 300, // 5 minutes
                document: {
                    id: document._id,
                    name: document.name,
                    mimeType: document.mimeType,
                    size: document.size
                }
            };
        } catch (error) {
            throw new Error(`Failed to generate download URL: ${error.message}`);
        }
    }
}

module.exports = new DocumentService();