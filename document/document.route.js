const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - name
 *         - url
 *         - mimeType
 *         - size
 *       properties:
 *         id:
 *           type: string
 *           description: Document ID
 *         name:
 *           type: string
 *           description: Document name
 *         description:
 *           type: string
 *           description: Document description
 *         type:
 *           type: string
 *           enum: [document, template, form, contract, report]
 *           description: Document type
 *         mimeType:
 *           type: string
 *           description: File MIME type
 *         size:
 *           type: number
 *           description: File size in bytes
 *         url:
 *           type: string
 *           description: File URL
 *         folder:
 *           type: string
 *           description: Folder path
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Document tags
 *         isTemplate:
 *           type: boolean
 *           description: Whether document is a template
 *         permissions:
 *           type: object
 *           properties:
 *             isPublic:
 *               type: boolean
 *             sharedWith:
 *               type: array
 *               items:
 *                 type: string
 *             contactIds:
 *               type: array
 *               items:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - name
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, DOCX, etc.)
 *               name:
 *                 type: string
 *                 description: User-defined name for the document
 *                 example: "Lease Agreement"
 *               folder:
 *                 type: string
 *                 description: Optional folder path
 *                 example: "/contracts"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional tags
 *                 example: ["legal", "2024"]
 *               description:
 *                 type: string
 *                 description: Optional document description
 *               type:
 *                 type: string
 *                 enum: [document, template, form, contract, report]
 *                 description: Document type
 *               isTemplate:
 *                 type: boolean
 *                 description: Whether document is a template
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document uploaded successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post('/upload', verifyUserToken, upload.single('file'), documentController.uploadDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents for user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of documents per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by document name
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Filter by folder
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [document, template, form, contract, report]
 *         description: Filter by document type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, size]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Document'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 */
router.get('/', verifyUserToken, documentController.getDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 */
router.get('/:id', verifyUserToken, documentController.getDocumentById);

/**
 * @swagger
 * /documents/{id}:
 *   put:
 *     summary: Update document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               folder:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [document, template, form, contract, report]
 *               isTemplate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 */
router.put('/:id', verifyUserToken, documentController.updateDocument);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/:id', verifyUserToken, documentController.deleteDocument);

/**
 * @swagger
 * /documents/{id}/share:
 *   post:
 *     summary: Share document with users or contacts
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shareWith:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to share with
 *               contactIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of contact IDs to share with
 *               isPublic:
 *                 type: boolean
 *                 description: Make document publicly accessible
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date for sharing
 *     responses:
 *       200:
 *         description: Document shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 */
router.post('/:id/share', verifyUserToken, documentController.shareDocument);

/**
 * @swagger
 * /documents/{id}/download:
 *   get:
 *     summary: Download document with secure signed URL
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       307:
 *         description: Temporary redirect to secure download URL
 *         headers:
 *           Location:
 *             description: Signed S3 URL for document download
 *             schema:
 *               type: string
 *               format: uri
 *       400:
 *         description: Invalid document ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Document ID must be a valid MongoDB ObjectId"
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Document not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/:id/download', verifyUserToken, documentController.downloadDocument);

module.exports = router;