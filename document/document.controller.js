const documentService = require('./document.service');
const documentValidation = require('./document.validation');

class DocumentController {
    constructor() {}

    async uploadDocument(req, res) {
        try {
            // Validate file upload
            await documentValidation.validateFileUpload(req.file);

            // Validate request body
            const requestData = {
                name: req.body.name,
                folder: req.body.folder,
                tags: req.body.tags ? JSON.parse(req.body.tags) : [],
                description: req.body.description,
                type: req.body.type,
                isTemplate: req.body.isTemplate === 'true'
            };

            const { error, value } = await documentValidation.uploadDocument(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            // Prepare file data for service
            const fileData = {
                ...req.file,
                name: value.name,
                folder: value.folder,
                tags: value.tags,
                description: value.description,
                type: value.type,
                isTemplate: value.isTemplate
            };

            const document = await documentService.uploadDocument(fileData, userId, organizationId);

            return res.status(200).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    id: document._id,
                    name: document.name,
                    fileUrl: document.url,
                    folder: document.folder,
                    tags: document.tags,
                    type: document.type,
                    mimeType: document.mimeType,
                    size: document.size,
                    createdAt: document.createdAt
                }
            });

        } catch (error) {
            console.error('Error uploading document:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getDocuments(req, res) {
        try {
            const { error, value } = await documentValidation.getDocuments(req.query);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await documentService.getUserDocuments(userId, organizationId, value);

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error('Error getting documents:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    async getDocumentById(req, res) {
        try {
            const { error, value } = await documentValidation.validateDocumentId(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const document = await documentService.getDocumentById(value.id, userId, organizationId);

            return res.status(200).json({
                success: true,
                data: document
            });

        } catch (error) {
            console.error('Error getting document:', error);
            if (error.message === 'Document not found' || error.message === 'Access denied') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateDocument(req, res) {
        try {
            const requestData = {
                id: req.params.id,
                ...req.body
            };

            const { error, value } = await documentValidation.updateDocument(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const { id, ...updateData } = value;
            const document = await documentService.updateDocument(id, updateData, userId, organizationId);

            return res.status(200).json({
                success: true,
                data: document
            });

        } catch (error) {
            console.error('Error updating document:', error);
            if (error.message === 'Document not found' || error.message === 'Access denied') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteDocument(req, res) {
        try {
            const { error, value } = await documentValidation.validateDocumentId(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const result = await documentService.deleteDocument(value.id, userId, organizationId);

            return res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            console.error('Error deleting document:', error);
            if (error.message === 'Document not found' || error.message === 'Access denied') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async shareDocument(req, res) {
        try {
            const requestData = {
                documentId: req.params.id,
                ...req.body
            };

            const { error, value } = await documentValidation.shareDocument(requestData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const { documentId, ...shareData } = value;
            const document = await documentService.shareDocument(documentId, shareData, userId, organizationId);

            return res.status(200).json({
                success: true,
                data: document
            });

        } catch (error) {
            console.error('Error sharing document:', error);
            if (error.message === 'Document not found' || error.message === 'Access denied') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async downloadDocument(req, res) {
        try {
            const { error, value } = await documentValidation.validateDocumentId(req.params);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const userId = req.user.userId;
            const organizationId = req.user.organizationId;

            const downloadData = await documentService.generateDownloadUrl(value.id, userId, organizationId);

            // Use 307 Temporary Redirect to redirect to the signed URL
            return res.status(307).redirect(downloadData.downloadUrl);

        } catch (error) {
            console.error('Error downloading document:', error);
            if (error.message === 'Document not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found'
                });
            }
            if (error.message === 'Access denied') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new DocumentController();