const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de, hi]
 *                 example: "en"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["prospect", "tech"]
 *     responses:
 *       201:
 *         description: Contact created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ecb74f5b2f001c8e4b4a"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     company:
 *                       type: string
 *                       example: "Tech Corp"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["prospect", "tech"]
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "First name is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       409:
 *         description: Conflict - Contact with email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "A contact with this email already exists in your organization"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/', verifyUserToken, contactController.createContact);

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts for the authenticated user's organization with pagination, search, and filters
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of contacts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search term for firstName, lastName, email, or company
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ENABLED, DISABLED, DELETED]
 *         description: Filter by contact status
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     contacts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           firstName:
 *                             type: string
 *                             example: "Shah"
 *                           lastName:
 *                             type: string
 *                             example: "Rushabh"
 *                           email:
 *                             type: string
 *                             example: "shahrushabh1996@gmail.com"
 *                           phone:
 *                             type: string
 *                             example: "+1234567890"
 *                           company:
 *                             type: string
 *                             example: "InfO Media"
 *                           status:
 *                             type: string
 *                             enum: [ENABLED, DISABLED, DELETED]
 *                             example: "ENABLED"
 *                           invitationDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T00:00:00Z"
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["vip", "investor"]
 *                           lastInteractionAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-20T10:30:00Z"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T08:00:00Z"
 *                           notes:
 *                             type: string
 *                             example: "Customer interested in premium package"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 15
 *       400:
 *         description: Bad request - Validation error
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
 *                   example: "Validation error message"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/', verifyUserToken, contactController.getAllContacts);

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get a specific contact by ID
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ecb74f5b2f001c8e4b4a"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     company:
 *                       type: string
 *                       example: "Tech Corp"
 *                     status:
 *                       type: string
 *                       enum: [ENABLED, DISABLED, DELETED]
 *                       example: "ENABLED"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["vip", "investor"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T08:00:00Z"
 *                     notes:
 *                       type: string
 *                       example: "Customer interested in premium package"
 *                     stats:
 *                       type: object
 *                       properties:
 *                         documentsUploaded:
 *                           type: integer
 *                           example: 0
 *                           description: "Number of documents uploaded by the contact"
 *                         completionRate:
 *                           type: integer
 *                           example: 0
 *                           description: "Completion rate percentage"
 *                         documentsMissing:
 *                           type: integer
 *                           example: 0
 *                           description: "Number of missing documents"
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/:id', verifyUserToken, contactController.getContactById);

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Update a contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               company:
 *                 type: string
 *                 example: "Tech Corp"
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de, hi]
 *                 example: "en"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["prospect", "tech"]
 *     responses:
 *       200:
 *         description: Contact updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ecb74f5b2f001c8e4b4a"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     company:
 *                       type: string
 *                       example: "Tech Corp"
 *                     language:
 *                       type: string
 *                       example: "en"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["prospect", "tech"]
 *       400:
 *         description: Bad request - Validation error
 *       404:
 *         description: Contact not found
 *       409:
 *         description: Conflict - Contact with email already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyUserToken, contactController.updateContact);

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact (soft delete)
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact deleted successfully"
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', verifyUserToken, contactController.deleteContact);

/**
 * @swagger
 * /contacts/{id}/{action}:
 *   patch:
 *     summary: Update contact status (disable/enable contact)
 *     description: |
 *       Updates the contact status based on the action parameter:
 *       - action "disable": Sets contact status to DISABLED
 *       - action "enable": Sets contact status to ENABLED
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [disable, enable]
 *         description: Action to perform (disable or enable)
 *     responses:
 *       200:
 *         description: Contact status updated successfully
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
 *                   example: "Contact disabled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d5ecb74f5b2f001c8e4b4a"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     status:
 *                       type: string
 *                       enum: [ENABLED, DISABLED]
 *                       example: "DISABLED"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid action parameter
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
 *                   example: "Invalid action. Use 'disable' or 'enable'"
 *       404:
 *         description: Contact not found
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
 *                   example: "Contact not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.patch('/:id/:action', verifyUserToken, contactController.updateContactStatus);

/**
 * @swagger
 * /contacts/import:
 *   post:
 *     summary: Import contacts from CSV file
 *     tags: [Contact]
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
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing contact data
 *               mapping:
 *                 type: string
 *                 description: JSON object mapping CSV headers to contact fields
 *                 example: '{"First Name": "firstName", "Last Name": "lastName", "Email Address": "email"}'
 *     responses:
 *       200:
 *         description: Import completed successfully
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
 *                   example: "Import completed"
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     inserted:
 *                       type: integer
 *                       example: 87
 *                     failed:
 *                       type: integer
 *                       example: 13
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                         example: 3
 *                       reason:
 *                         type: string
 *                         example: "Email is not valid"
 *       400:
 *         description: Bad request - Missing file or invalid mapping
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
 *                   example: "CSV file is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.post('/import', verifyUserToken, upload.single('file'), contactController.importContacts);

/**
 * @swagger
 * /contacts/{id}/share-document:
 *   post:
 *     summary: Share a document with a contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - permissions
 *             properties:
 *               documentId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: ID of the document to share
 *               permissions:
 *                 type: string
 *                 enum: [view, edit]
 *                 example: "view"
 *                 description: Permission level for the shared document
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *                 description: Optional expiry date for the shared document
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Document shared successfully"
 *       400:
 *         description: Bad request - Validation error
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
 *                   example: "Document ID is required"
 *       403:
 *         description: Forbidden - Document not found or access denied
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
 *                   example: "Document not found or access denied"
 *       404:
 *         description: Contact not found
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
 *                   example: "Contact not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.post('/:id/share-document', verifyUserToken, contactController.shareDocument);

/**
 * @swagger
 * /contacts/{id}/shared-documents:
 *   get:
 *     summary: Get all documents shared with a contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Shared documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       documentId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439012"
 *                           name:
 *                             type: string
 *                             example: "Contract.pdf"
 *                           description:
 *                             type: string
 *                             example: "Service contract"
 *                           type:
 *                             type: string
 *                             example: "contract"
 *                           mimeType:
 *                             type: string
 *                             example: "application/pdf"
 *                           size:
 *                             type: number
 *                             example: 1024000
 *                           url:
 *                             type: string
 *                             example: "https://example.com/document.pdf"
 *                       sharedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-31T23:59:59Z"
 *                       permissions:
 *                         type: string
 *                         enum: [view, edit]
 *                         example: "view"
 *       404:
 *         description: Contact not found
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
 *                   example: "Contact not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/:id/shared-documents', verifyUserToken, contactController.getSharedDocuments);

module.exports = router;