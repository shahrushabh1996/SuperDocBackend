const express = require('express');
const router = express.Router();
const portalController = require('./portal.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Portal:
 *       type: object
 *       required:
 *         - name
 *         - organizationId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Portal ID
 *         name:
 *           type: string
 *           description: Portal name
 *         slug:
 *           type: string
 *           description: Portal slug
 *         description:
 *           type: string
 *           description: Portal description
 *         workflow:
 *           type: string
 *           description: Associated workflow ID
 *         status:
 *           type: string
 *           enum: [draft, active, deleted]
 *           description: Portal status
 *         theme:
 *           type: object
 *           properties:
 *             logo:
 *               type: string
 *             primaryColor:
 *               type: string
 *             backgroundColor:
 *               type: string
 *             customCSS:
 *               type: string
 *         settings:
 *           type: object
 *           properties:
 *             requireAuth:
 *               type: boolean
 *             allowedDomains:
 *               type: array
 *               items:
 *                 type: string
 *             expiresAt:
 *               type: string
 *               format: date-time
 *             maxSubmissions:
 *               type: number
 *             redirectUrl:
 *               type: string
 *             customDomain:
 *               type: string
 *         content:
 *           type: object
 *           properties:
 *             welcomeMessage:
 *               type: string
 *             successMessage:
 *               type: string
 *             termsAndConditions:
 *               type: string
 *             privacyPolicy:
 *               type: string
 *         analytics:
 *           type: object
 *           properties:
 *             views:
 *               type: number
 *             submissions:
 *               type: number
 *             conversionRate:
 *               type: number
 *             lastViewedAt:
 *               type: string
 *               format: date-time
 *         organizationId:
 *           type: string
 *           description: Organization ID
 *         userId:
 *           type: string
 *           description: User ID who created the portal
 *         createdBy:
 *           type: string
 *           description: User ID who created the portal
 *         updatedBy:
 *           type: string
 *           description: User ID who last updated the portal
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Publication timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /portals:
 *   post:
 *     summary: Create a new portal
 *     tags: [Portals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - workflowId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Portal name
 *                 example: "Partner Portal"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Portal description
 *                 example: "Portal for partner onboarding"
 *               workflowId:
 *                 type: string
 *                 pattern: "^[0-9a-fA-F]{24}$"
 *                 description: Workflow ID to associate with the portal
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Portal created successfully
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
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001c8e4eaa"
 *                     name:
 *                       type: string
 *                       example: "Partner Portal"
 *                     slug:
 *                       type: string
 *                       example: "partner-portal-a1b2"
 *                     workflowId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                 message:
 *                   type: string
 *                   example: "Portal created successfully"
 *       400:
 *         description: Bad request
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
 *                   example: "Name and workflowId are required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyUserToken, portalController.createPortal);

/**
 * @swagger
 * /portals:
 *   get:
 *     summary: Get all portals for the authenticated user's organization
 *     tags: [Portals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, deleted]
 *         description: Filter by portal status
 *     responses:
 *       200:
 *         description: List of portals retrieved successfully
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
 *                     portals:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60c72b2f9b1e8b001c8e4eaa"
 *                           name:
 *                             type: string
 *                             example: "Partner Portal"
 *                           slug:
 *                             type: string
 *                             example: "partner-portal-a1b2"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           workflowId:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-01T10:00:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 42
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', verifyUserToken, portalController.getPortals);

/**
 * @swagger
 * /portals/{id}:
 *   get:
 *     summary: Get portal by ID
 *     tags: [Portals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portal ID
 *     responses:
 *       200:
 *         description: Portal retrieved successfully
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
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8b001c8e4eaa"
 *                     name:
 *                       type: string
 *                       example: "Partner Portal"
 *                     slug:
 *                       type: string
 *                       example: "partner-portal-a1b2"
 *                     description:
 *                       type: string
 *                       example: "Portal for partner onboarding"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     workflowId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-05T09:30:00Z"
 *       400:
 *         description: Bad request
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
 *                   example: "Invalid portal ID format"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Portal not found
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
 *                   example: "Portal not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id', verifyUserToken, portalController.getPortalById);

/**
 * @swagger
 * /portals/{id}:
 *   put:
 *     summary: Update portal
 *     tags: [Portals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Portal name
 *                 example: "Updated Portal Name"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Portal description
 *                 example: "Updated description"
 *               status:
 *                 type: string
 *                 enum: [draft, active, deleted]
 *                 description: Portal status
 *                 example: "active"
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Portal slug
 *                 example: "updated-portal-slug"
 *               workflow:
 *                 type: string
 *                 pattern: "^[0-9a-fA-F]{24}$"
 *                 description: Workflow ID
 *                 example: "507f1f77bcf86cd799439011"
 *               content:
 *                 type: object
 *                 properties:
 *                   welcomeMessage:
 *                     type: string
 *                     maxLength: 2000
 *                     description: Welcome message displayed to users
 *                     example: "Welcome to our portal! Please fill out the form below."
 *                   screeningQuestion:
 *                     type: string
 *                     maxLength: 500
 *                     description: Screening question for filtering applications
 *                     example: "What is your experience with React?"
 *                   denialMessage:
 *                     type: string
 *                     maxLength: 1000
 *                     description: Message shown when application is denied
 *                     example: "Thank you for your interest, but we cannot proceed with your application at this time."
 *               settings:
 *                 type: object
 *                 properties:
 *                   displayOnPublicIndex:
 *                     type: boolean
 *                     description: Whether to display this portal on the public portal index
 *                     example: true
 *                   requirePhoneNumber:
 *                     type: boolean
 *                     description: Whether to require phone number in applications
 *                     example: false
 *                   enableScreeningQuestion:
 *                     type: boolean
 *                     description: Whether to enable screening question for filtering applications
 *                     example: true
 *     responses:
 *       200:
 *         description: Portal updated successfully
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
 *                   example: "Portal updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Updated Portal Name"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-25T10:00:00Z"
 *       400:
 *         description: Bad request
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
 *                   example: "Portal ID must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Portal not found
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
 *                   example: "Portal not found"
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyUserToken, portalController.updatePortal);

module.exports = router;