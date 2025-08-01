const express = require('express');
const router = express.Router();
const workflowController = require('./workflow.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Workflow:
 *       type: object
 *       required:
 *         - title
 *         - organizationId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Workflow ID
 *         title:
 *           type: string
 *           description: Workflow title
 *         description:
 *           type: string
 *           description: Workflow description
 *         templateId:
 *           type: string
 *           description: Template ID used to create this workflow
 *         status:
 *           type: string
 *           enum: [draft, active, paused, archived]
 *           description: Workflow status
 *         trigger:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [manual, event, schedule, api]
 *               description: Trigger type
 *             event:
 *               type: string
 *               description: Event name for event triggers
 *             schedule:
 *               type: string
 *               description: Schedule expression for scheduled triggers
 *             conditions:
 *               type: object
 *               description: Trigger conditions
 *         steps:
 *           type: array
 *           items:
 *             type: object
 *             description: Workflow steps
 *         metrics:
 *           type: object
 *           properties:
 *             totalExecutions:
 *               type: number
 *               description: Total number of executions
 *             completedExecutions:
 *               type: number
 *               description: Number of completed executions
 *             averageCompletionTime:
 *               type: number
 *               description: Average completion time in milliseconds
 *             lastExecutedAt:
 *               type: string
 *               format: date-time
 *               description: Last execution timestamp
 *         settings:
 *           type: object
 *           properties:
 *             allowMultipleSubmissions:
 *               type: boolean
 *               description: Allow multiple submissions for this workflow
 *             requireAuthentication:
 *               type: boolean
 *               description: Require authentication to access workflow
 *             sendEmailNotifications:
 *               type: boolean
 *               description: Send email notifications for workflow events
 *         version:
 *           type: number
 *           description: Workflow version
 *         organizationId:
 *           type: string
 *           description: Organization ID
 *         userId:
 *           type: string
 *           description: User ID who created the workflow
 *         createdBy:
 *           type: string
 *           description: User ID who created the workflow
 *         updatedBy:
 *           type: string
 *           description: User ID who last updated the workflow
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
 * /workflows:
 *   post:
 *     summary: Create a new workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Workflow title
 *                 example: "Customer Onboarding"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Workflow description
 *                 example: "Onboarding workflow for new customers"
 *               templateId:
 *                 type: string
 *                 pattern: "^[0-9a-fA-F]{24}$"
 *                 description: Template ID to clone from (optional)
 *                 example: "507f1f77bcf86cd799439011"
 *               settings:
 *                 type: object
 *                 description: Workflow settings (optional)
 *                 properties:
 *                   allowMultipleSubmissions:
 *                     type: boolean
 *                     description: Allow multiple submissions for this workflow
 *                     example: true
 *                   requireAuthentication:
 *                     type: boolean
 *                     description: Require authentication to access workflow
 *                     example: false
 *                   sendEmailNotifications:
 *                     type: boolean
 *                     description: Send email notifications for workflow events
 *                     example: true
 *     responses:
 *       201:
 *         description: Workflow created successfully
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
 *                   example: "Workflow created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "609e125f8f1a2c0015dcedcd"
 *                     title:
 *                       type: string
 *                       example: "Customer Onboarding"
 *                     description:
 *                       type: string
 *                       example: "Onboarding workflow for new customers"
 *                     templateId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     status:
 *                       type: string
 *                       example: "draft"
 *                     settings:
 *                       type: object
 *                       properties:
 *                         allowMultipleSubmissions:
 *                           type: boolean
 *                           example: false
 *                         requireAuthentication:
 *                           type: boolean
 *                           example: false
 *                         sendEmailNotifications:
 *                           type: boolean
 *                           example: true
 *                     organizationId:
 *                       type: string
 *                       example: "org_id_from_token"
 *                     userId:
 *                       type: string
 *                       example: "user_id_from_token"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
 *                   example: "Workflow title is required"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyUserToken, workflowController.createWorkflow);

/**
 * @swagger
 * /workflows:
 *   get:
 *     summary: Get all workflows for the organization
 *     tags: [Workflows]
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
 *         description: Number of workflows per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, paused, archived]
 *         description: Filter by workflow status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, status]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Workflows retrieved successfully
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
 *                     workflows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           title:
 *                             type: string
 *                             example: "New Partner Onboarding"
 *                           contactsInWorkflow:
 *                             type: integer
 *                             example: 45
 *                           completionRate:
 *                             type: number
 *                             example: 78.5
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           lastExecutedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-20T15:30:00Z"
 *                             nullable: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         pages:
 *                           type: integer
 *                           example: 3
 */
router.get('/', verifyUserToken, workflowController.getWorkflows);

/**
 * @swagger
 * /workflows/{id}:
 *   get:
 *     summary: Get workflow by ID
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *       404:
 *         description: Workflow not found
 */
router.get('/:id', verifyUserToken, workflowController.getWorkflowById);

/**
 * @swagger
 * /workflows/{id}:
 *   put:
 *     summary: Update workflow details
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Workflow title
 *                 example: "Updated Workflow Title"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Workflow description
 *                 example: "Updated workflow description"
 *               status:
 *                 type: string
 *                 enum: [draft, active, paused, archived]
 *                 description: Workflow status
 *                 example: "archived"
 *               templateId:
 *                 type: string
 *                 pattern: "^[0-9a-fA-F]{24}$"
 *                 description: Template ID reference
 *                 example: "507f1f77bcf86cd799439011"
 *               trigger:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [manual, event, schedule, api]
 *                   event:
 *                     type: string
 *                   schedule:
 *                     type: string
 *                   conditions:
 *                     type: object
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [form, document, approval, email, sms, webhook, condition, delay]
 *                     config:
 *                       type: object
 *                     order:
 *                       type: number
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: object
 *               version:
 *                 type: number
 *                 description: Workflow version
 *     responses:
 *       200:
 *         description: Workflow updated successfully
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
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "Updated Workflow Title"
 *                     status:
 *                       type: string
 *                       example: "archived"
 *       400:
 *         description: Bad request
 *       404:
 *         description: Workflow not found
 *       403:
 *         description: Not authorized to update this workflow
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/:id', verifyUserToken, workflowController.updateWorkflow);

/**
 * @swagger
 * /workflows/{id}:
 *   delete:
 *     summary: Delete workflow (soft delete)
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *     responses:
 *       200:
 *         description: Workflow deleted successfully
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
router.delete('/:id', verifyUserToken, workflowController.deleteWorkflow);

/**
 * @swagger
 * /workflows/{id}/duplicate:
 *   post:
 *     summary: Duplicate a workflow
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID to duplicate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Title for the duplicated workflow
 *                 example: "Customer Onboarding - Copy"
 *     responses:
 *       201:
 *         description: Workflow duplicated successfully
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
 *                       example: "60abc12345de67890fghijkl"
 *                     title:
 *                       type: string
 *                       example: "Customer Onboarding - Copy"
 *       400:
 *         description: Bad request
 *       404:
 *         description: Workflow not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/:id/duplicate', verifyUserToken, workflowController.duplicateWorkflow);

router.post('/:id/execute', verifyUserToken, workflowController.executeWorkflow);

/**
 * @swagger
 * /workflows/{id}/executions:
 *   get:
 *     summary: Get workflow executions
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
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
 *           default: 20
 *         description: Number of executions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, cancelled]
 *         description: Filter by execution status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [startedAt, completedAt, status]
 *           default: startedAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Workflow executions retrieved successfully
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
 *                     executions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "64ea1c84f1b9bc0001c2a344"
 *                           status:
 *                             type: string
 *                             enum: [pending, in_progress, completed, failed, cancelled]
 *                             example: "completed"
 *                           executedBy:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "507f1f77bcf86cd799439012"
 *                               name:
 *                                 type: string
 *                                 example: "Rushabh Shah"
 *                           contact:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "507f1f77bcf86cd799439011"
 *                               name:
 *                                 type: string
 *                                 example: "John Doe"
 *                           startedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T12:00:00Z"
 *                           completedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T12:10:00Z"
 *                             nullable: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 1
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
 *                   example: "Workflow ID must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workflow not found
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
 *                   example: "Workflow not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id/executions', verifyUserToken, workflowController.getWorkflowExecutions);

/**
 * @swagger
 * /workflows/{id}/steps/{stepId}:
 *   put:
 *     summary: Update a workflow step
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         description: Step ID
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
 *                 description: Step name
 *                 example: "Collect Updated Documents"
 *               type:
 *                 type: string
 *                 enum: [form, document, approval, email, sms, webhook, condition, delay]
 *                 description: Step type
 *                 example: "form"
 *               config:
 *                 type: object
 *                 properties:
 *                   fields:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Field ID
 *                         label:
 *                           type: string
 *                           description: Field label
 *                           example: "Updated ID Proof"
 *                         type:
 *                           type: string
 *                           enum: [text, email, phone, date, file, select, checkbox]
 *                           description: Field type
 *                           example: "file"
 *                         required:
 *                           type: boolean
 *                           description: Whether field is required
 *                           example: true
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Options for select fields
 *                         validation:
 *                           type: object
 *                           description: Field validation rules
 *                   documentTemplateId:
 *                     type: string
 *                     pattern: "^[0-9a-fA-F]{24}$"
 *                     description: Document template ID
 *                   emailTemplate:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                         description: Email subject
 *                       body:
 *                         type: string
 *                         description: Email body
 *                       attachments:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Email attachments
 *                   delayDuration:
 *                     type: number
 *                     minimum: 0
 *                     description: Delay duration in seconds
 *                   conditions:
 *                     type: object
 *                     description: Step conditions
 *                   assignee:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [contact, user, role, dynamic]
 *                         description: Assignee type
 *                       value:
 *                         type: string
 *                         description: Assignee value
 *                 description: Step configuration
 *               order:
 *                 type: number
 *                 minimum: 0
 *                 description: Step order
 *                 example: 3
 *               nextSteps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stepId:
 *                       type: string
 *                       description: Next step ID
 *                     condition:
 *                       type: object
 *                       description: Condition for next step
 *                 description: Next steps configuration
 *     responses:
 *       200:
 *         description: Workflow step updated successfully
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
 *                   example: "Workflow step updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64ec0d3f78a9f00001c3f932"
 *                     name:
 *                       type: string
 *                       example: "Collect Updated Documents"
 *                     type:
 *                       type: string
 *                       example: "form"
 *                     order:
 *                       type: number
 *                       example: 3
 *                     config:
 *                       type: object
 *                       properties:
 *                         fields:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                                 example: "Updated ID Proof"
 *                               type:
 *                                 type: string
 *                                 example: "file"
 *                               required:
 *                                 type: boolean
 *                                 example: true
 *                     nextSteps:
 *                       type: array
 *                       items:
 *                         type: object
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
 *                   example: "Workflow ID must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workflow or step not found
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
 *                   example: "Step not found"
 *       500:
 *         description: Internal server error
 */
router.put('/:id/steps/:stepId', verifyUserToken, workflowController.updateWorkflowStep);

/**
 * @swagger
 * /workflows/{id}/steps/{stepId}:
 *   delete:
 *     summary: Delete a workflow step
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workflow ID
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         description: Step ID to delete
 *     responses:
 *       200:
 *         description: Workflow step deleted successfully
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
 *                   example: "Workflow step deleted successfully"
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
 *                   example: "Workflow ID must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workflow or step not found
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
 *                   example: "Step not found"
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/steps/:stepId', verifyUserToken, workflowController.deleteWorkflowStep);

/**
 * @swagger
 * /workflows/{id}/analytics:
 *   get:
 *     summary: Get workflow analytics
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: Workflow ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days to include in trends data
 *         example: 30
 *     responses:
 *       200:
 *         description: Workflow analytics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalSubmissions:
 *                           type: integer
 *                           description: Total number of workflow submissions
 *                           example: 1240
 *                         completionRate:
 *                           type: number
 *                           format: float
 *                           description: Completion rate as percentage
 *                           example: 86.2
 *                         averageCompletionTime:
 *                           type: integer
 *                           description: Average completion time in seconds
 *                           example: 422
 *                         activePortals:
 *                           type: integer
 *                           description: Number of active portals using this workflow
 *                           example: 6
 *                     trends:
 *                       type: object
 *                       properties:
 *                         submissions:
 *                           type: array
 *                           description: Daily submission counts
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2025-07-01"
 *                               count:
 *                                 type: integer
 *                                 example: 82
 *                         completions:
 *                           type: array
 *                           description: Daily completion counts
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2025-07-01"
 *                               count:
 *                                 type: integer
 *                                 example: 71
 *                         dropoffRates:
 *                           type: array
 *                           description: Daily dropoff rates
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2025-07-01"
 *                               rate:
 *                                 type: number
 *                                 format: float
 *                                 description: Dropoff rate as percentage
 *                                 example: 13.4
 *                     stepAnalytics:
 *                       type: array
 *                       description: Analytics for each workflow step
 *                       items:
 *                         type: object
 *                         properties:
 *                           stepId:
 *                             type: string
 *                             description: Step identifier
 *                             example: "abc123"
 *                           stepTitle:
 *                             type: string
 *                             description: Step title or name
 *                             example: "Document Upload"
 *                           views:
 *                             type: integer
 *                             description: Number of times step was viewed/reached
 *                             example: 1250
 *                           completions:
 *                             type: integer
 *                             description: Number of times step was completed
 *                             example: 1170
 *                           dropoffRate:
 *                             type: number
 *                             format: float
 *                             description: Step dropoff rate as percentage
 *                             example: 6.4
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
 *                   example: "Workflow ID must be a valid MongoDB ObjectId"
 *       401:
 *         description: Unauthorized
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
 *                   example: "Access token is required"
 *       404:
 *         description: Workflow not found
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
 *                   example: "Workflow not found"
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
router.get('/:id/analytics', verifyUserToken, workflowController.getWorkflowAnalytics);

/**
 * @swagger
 * /workflows/{id}/reorder-steps:
 *   post:
 *     summary: Reorder workflow steps
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: Workflow ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - steps
 *             properties:
 *               steps:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of step reordering instructions
 *                 items:
 *                   type: object
 *                   required:
 *                     - stepId
 *                     - newPosition
 *                   properties:
 *                     stepId:
 *                       type: string
 *                       description: The ID of the step to reorder
 *                       example: "step-123"
 *                     newPosition:
 *                       type: integer
 *                       minimum: 1
 *                       description: The new position for the step (1-based index)
 *                       example: 3
 *                 example:
 *                   - stepId: "step-id-1"
 *                     newPosition: 3
 *                   - stepId: "step-id-2"
 *                     newPosition: 1
 *     responses:
 *       200:
 *         description: Steps reordered successfully
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
 *                   example: "Steps reordered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     workflowId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     steps:
 *                       type: array
 *                       description: The reordered steps with their new positions
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "step-123"
 *                           title:
 *                             type: string
 *                             example: "Collect Documents"
 *                           order:
 *                             type: integer
 *                             example: 1
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
 *                   examples:
 *                     invalidWorkflowId:
 *                       value: "Workflow ID must be a valid MongoDB ObjectId"
 *                     duplicatePosition:
 *                       value: "Multiple steps cannot have the same position"
 *                     invalidStepId:
 *                       value: "Step with ID 'step-xyz' not found in workflow"
 *                     invalidPosition:
 *                       value: "Position must be between 1 and total number of steps"
 *       401:
 *         description: Unauthorized
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
 *                   example: "Access token is required"
 *       404:
 *         description: Workflow not found
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
 *                   example: "Workflow not found"
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
router.post('/:id/reorder-steps', verifyUserToken, workflowController.reorderSteps);

/**
 * @swagger
 * /workflows/{id}/presigned-url:
 *   post:
 *     summary: Generate presigned URL for workflow file upload
 *     tags: [Workflows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: Workflow ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Name of the file to upload
 *                 example: "workflow-document.pdf"
 *               contentType:
 *                 type: string
 *                 description: MIME type of the file
 *                 example: "application/pdf"
 *                 enum:
 *                   - application/pdf
 *                   - image/jpeg
 *                   - image/png
 *                   - image/gif
 *                   - application/msword
 *                   - application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *                   - application/vnd.ms-excel
 *                   - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
 *               stepId:
 *                 type: string
 *                 description: Optional step ID to associate the file with
 *                 example: "step-123"
 *               expires:
 *                 type: integer
 *                 minimum: 60
 *                 maximum: 3600
 *                 default: 900
 *                 description: URL expiration time in seconds (default 15 minutes)
 *                 example: 900
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
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
 *                     uploadUrl:
 *                       type: string
 *                       format: uri
 *                       description: Presigned URL for file upload
 *                       example: "https://s3.amazonaws.com/bucket/key?X-Amz-Algorithm=..."
 *                     key:
 *                       type: string
 *                       description: S3 object key for the file
 *                       example: "workflows/507f1f77bcf86cd799439011/1234567890-workflow-document.pdf"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the URL expires
 *                       example: "2025-08-01T12:30:00Z"
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
 *                   examples:
 *                     invalidWorkflowId:
 *                       value: "Workflow ID must be a valid MongoDB ObjectId"
 *                     missingFileName:
 *                       value: "File name is required"
 *                     invalidContentType:
 *                       value: "Invalid content type"
 *       401:
 *         description: Unauthorized
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
 *                   example: "Access token is required"
 *       404:
 *         description: Workflow not found
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
 *                   example: "Workflow not found"
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
router.post('/:id/presigned-url', verifyUserToken, workflowController.generatePresignedUrl);

module.exports = router;