const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');
const multer = require('multer');

// Configure multer for avatar uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Organization ID
 *         name:
 *           type: string
 *           description: Organization name
 *         slug:
 *           type: string
 *           description: Organization slug
 *         ownerId:
 *           type: string
 *           description: Owner user ID
 *         subscription:
 *           type: object
 *           properties:
 *             plan:
 *               type: string
 *               enum: [free, starter, pro, enterprise]
 *               description: Subscription plan
 *             status:
 *               type: string
 *               enum: [active, past_due, canceled]
 *               description: Subscription status
 *             currentPeriodEnd:
 *               type: string
 *               format: date-time
 *               description: Current period end date
 *             seats:
 *               type: number
 *               description: Number of seats
 *         settings:
 *           type: object
 *           properties:
 *             branding:
 *               type: object
 *               properties:
 *                 logo:
 *                   type: string
 *                   description: Logo URL
 *                 primaryColor:
 *                   type: string
 *                   description: Primary color hex code
 *                 secondaryColor:
 *                   type: string
 *                   description: Secondary color hex code
 *             features:
 *               type: object
 *               properties:
 *                 maxContacts:
 *                   type: number
 *                   description: Maximum contacts allowed
 *                 maxWorkflows:
 *                   type: number
 *                   description: Maximum workflows allowed
 *                 maxPortals:
 *                   type: number
 *                   description: Maximum portals allowed
 *                 customDomain:
 *                   type: boolean
 *                   description: Custom domain enabled
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
 * /settings/organization:
 *   get:
 *     summary: Get organization settings and profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.get('/organization', verifyUserToken, settingsController.getOrganization);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationProfile:
 *       type: object
 *       properties:
 *         organizationId:
 *           type: string
 *           description: Organization ID
 *           example: "org_123"
 *         name:
 *           type: string
 *           description: Organization name
 *           example: "Acme Corporation"
 *         slug:
 *           type: string
 *           description: Organization slug
 *           example: "acme-corp"
 *         description:
 *           type: string
 *           description: Organization description
 *           example: "Leading provider of innovative solutions"
 *         website:
 *           type: string
 *           format: uri
 *           description: Organization website
 *           example: "https://acme.com"
 *         industry:
 *           type: string
 *           description: Industry sector
 *           example: "Technology"
 *         size:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *           description: Organization size
 *           example: "51-200"
 *         founded:
 *           type: string
 *           description: Year founded
 *           example: "2010"
 *         headquarters:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: "123 Main St"
 *             city:
 *               type: string
 *               example: "San Francisco"
 *             state:
 *               type: string
 *               example: "CA"
 *             country:
 *               type: string
 *               example: "US"
 *             postalCode:
 *               type: string
 *               example: "94105"
 *         owner:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               example: "user_456"
 *             name:
 *               type: string
 *               example: "Jane Smith"
 *             email:
 *               type: string
 *               format: email
 *               example: "jane@acme.com"
 *         subscription:
 *           type: object
 *           properties:
 *             plan:
 *               type: string
 *               enum: [free, starter, pro, enterprise]
 *               example: "pro"
 *             status:
 *               type: string
 *               enum: [active, past_due, canceled]
 *               example: "active"
 *             seats:
 *               type: number
 *               example: 50
 *             usedSeats:
 *               type: number
 *               example: 35
 *             currentPeriodEnd:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /settings/organization/profile:
 *   get:
 *     summary: Get organization details
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *         description: Include related data (e.g., "owner,subscription,stats")
 *         example: "owner,subscription,stats"
 *     responses:
 *       200:
 *         description: Organization profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrganizationProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.get('/organization/profile', verifyUserToken, settingsController.getOrganizationProfile);

/**
 * @swagger
 * /settings/organization/profile:
 *   put:
 *     summary: Update organization profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
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
 *                 maxLength: 100
 *                 description: Organization name
 *                 example: "Acme Corporation Inc."
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Organization description
 *                 example: "Updated description"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Organization website URL
 *                 example: "https://acme-corp.com"
 *               industry:
 *                 type: string
 *                 maxLength: 100
 *                 description: Industry sector
 *                 example: "Software"
 *               size:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *                 description: Organization size
 *                 example: "201-500"
 *               founded:
 *                 type: string
 *                 pattern: '^\d{4}$'
 *                 description: Year founded (4-digit year)
 *                 example: "2010"
 *               headquarters:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     maxLength: 200
 *                     description: Street address
 *                     example: "456 Tech Blvd"
 *                   city:
 *                     type: string
 *                     maxLength: 100
 *                     description: City
 *                     example: "San Jose"
 *                   state:
 *                     type: string
 *                     maxLength: 100
 *                     description: State/Province
 *                     example: "CA"
 *                   country:
 *                     type: string
 *                     length: 2
 *                     description: Country code (2-letter ISO)
 *                     example: "US"
 *                   postalCode:
 *                     type: string
 *                     maxLength: 20
 *                     description: Postal/ZIP code
 *                     example: "95110"
 *           example:
 *             name: "Acme Corporation Inc."
 *             description: "Updated description"
 *             website: "https://acme-corp.com"
 *             industry: "Software"
 *             size: "201-500"
 *             headquarters:
 *               address: "456 Tech Blvd"
 *               city: "San Jose"
 *               state: "CA"
 *               country: "US"
 *               postalCode: "95110"
 *     responses:
 *       200:
 *         description: Organization profile updated successfully
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
 *                   example: "Organization profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizationId:
 *                       type: string
 *                       example: "org_123"
 *                     name:
 *                       type: string
 *                       example: "Acme Corporation Inc."
 *                     slug:
 *                       type: string
 *                       example: "acme-corporation-inc"
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Organization name cannot be empty"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Only organization owner can update or user not linked
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
 *                   example: "Only organization owner can update profile"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.put('/organization/profile', verifyUserToken, settingsController.updateOrganizationProfile);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrganizationBranding:
 *       type: object
 *       properties:
 *         logo:
 *           type: string
 *           format: uri
 *           description: Organization logo URL
 *           example: "https://example.com/logos/org_123.png"
 *         favicon:
 *           type: string
 *           format: uri
 *           description: Organization favicon URL
 *           example: "https://example.com/favicons/org_123.ico"
 *         colors:
 *           type: object
 *           properties:
 *             primary:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Primary brand color
 *               example: "#FF6B6B"
 *             secondary:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Secondary brand color
 *               example: "#4ECDC4"
 *             accent:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Accent color
 *               example: "#FFD93D"
 *             text:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Text color
 *               example: "#2D3436"
 *             background:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Background color
 *               example: "#FFFFFF"
 *         fonts:
 *           type: object
 *           properties:
 *             heading:
 *               type: string
 *               description: Font family for headings
 *               example: "Inter"
 *             body:
 *               type: string
 *               description: Font family for body text
 *               example: "Open Sans"
 *         customCSS:
 *           type: string
 *           description: Custom CSS styles
 *           example: "body { font-family: Arial; }"
 *         emailTemplate:
 *           type: object
 *           properties:
 *             headerColor:
 *               type: string
 *               pattern: '^#[0-9A-F]{6}$'
 *               description: Email template header color
 *               example: "#FF6B6B"
 *             footerText:
 *               type: string
 *               description: Email template footer text
 *               example: "© 2024 Acme Corporation"
 */

/**
 * @swagger
 * /settings/organization/branding:
 *   get:
 *     summary: Get branding settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *     responses:
 *       200:
 *         description: Branding settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrganizationBranding'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.get('/organization/branding', verifyUserToken, settingsController.getOrganizationBranding);

/**
 * @swagger
 * /settings/organization/branding:
 *   put:
 *     summary: Update branding settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: Organization logo URL
 *                 example: "https://example.com/logos/new_logo.png"
 *               favicon:
 *                 type: string
 *                 format: uri
 *                 description: Organization favicon URL
 *                 example: "https://example.com/favicons/new_favicon.ico"
 *               colors:
 *                 type: object
 *                 properties:
 *                   primary:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Primary brand color (hex format)
 *                     example: "#FF6B6B"
 *                   secondary:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Secondary brand color (hex format)
 *                     example: "#4ECDC4"
 *                   accent:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Accent color (hex format)
 *                     example: "#FFD93D"
 *                   text:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Text color (hex format)
 *                     example: "#2D3436"
 *                   background:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Background color (hex format)
 *                     example: "#FFFFFF"
 *               fonts:
 *                 type: object
 *                 properties:
 *                   heading:
 *                     type: string
 *                     enum: [Arial, Helvetica, Times New Roman, Georgia, Verdana, Trebuchet MS, Inter, Open Sans, Roboto, Lato, Montserrat, Source Sans Pro, Poppins, Nunito, Ubuntu, PT Sans, Merriweather, Playfair Display]
 *                     description: Font family for headings
 *                     example: "Roboto"
 *                   body:
 *                     type: string
 *                     enum: [Arial, Helvetica, Times New Roman, Georgia, Verdana, Trebuchet MS, Inter, Open Sans, Roboto, Lato, Montserrat, Source Sans Pro, Poppins, Nunito, Ubuntu, PT Sans, Merriweather, Playfair Display]
 *                     description: Font family for body text
 *                     example: "Lato"
 *               customCSS:
 *                 type: string
 *                 maxLength: 10240
 *                 description: Custom CSS styles (max 10KB)
 *                 example: "body { font-family: Arial; }"
 *               emailTemplate:
 *                 type: object
 *                 properties:
 *                   headerColor:
 *                     type: string
 *                     pattern: '^#[0-9A-F]{6}$'
 *                     description: Email template header color (hex format)
 *                     example: "#FF6B6B"
 *                   footerText:
 *                     type: string
 *                     maxLength: 500
 *                     description: Email template footer text
 *                     example: "© 2024 Acme Corporation - All rights reserved"
 *           example:
 *             colors:
 *               primary: "#FF6B6B"
 *               secondary: "#4ECDC4"
 *             fonts:
 *               heading: "Roboto"
 *               body: "Lato"
 *             emailTemplate:
 *               headerColor: "#FF6B6B"
 *               footerText: "© 2024 Acme Corporation - All rights reserved"
 *     responses:
 *       200:
 *         description: Branding updated successfully
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
 *                   example: "Branding updated successfully"
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Primary color must be a valid hex color (e.g., #FF6B6B)"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Only organization owner can update or user not linked
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
 *                   example: "Only organization owner can update branding"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.put('/organization/branding', verifyUserToken, settingsController.updateOrganizationBranding);

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         fullName:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         mobile:
 *           type: string
 *           description: User's mobile number
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         organizationName:
 *           type: string
 *           description: Organization name
 *         personName:
 *           type: string
 *           description: Person name
 *         role:
 *           type: string
 *           enum: [admin, user, viewer]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: User status
 *         organizationId:
 *           type: string
 *           description: Organization ID
 *         avatar:
 *           type: string
 *           description: User's avatar URL
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         preferences:
 *           type: object
 *           properties:
 *             language:
 *               type: string
 *               description: Preferred language
 *             timezone:
 *               type: string
 *               description: Preferred timezone
 *             notifications:
 *               type: object
 *               properties:
 *                 email:
 *                   type: boolean
 *                   description: Email notifications enabled
 *                 inApp:
 *                   type: boolean
 *                   description: In-app notifications enabled
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
 * /settings/user:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.get('/user', verifyUserToken, settingsController.getUserProfile);

/**
 * @swagger
 * /settings/user/profile:
 *   get:
 *     summary: Get current user's profile information
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: Comma-separated fields to include (e.g., "firstName,lastName,email")
 *         example: "firstName,lastName,email"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     userId:
 *                       type: string
 *                       example: "user_123"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     fullName:
 *                       type: string
 *                       example: "John Doe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/avatars/user_123.jpg"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-22T10:00:00Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.get('/user/profile', verifyUserToken, settingsController.getUserProfile);

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPreferences:
 *       type: object
 *       properties:
 *         language:
 *           type: string
 *           enum: [en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko]
 *           description: User's preferred language
 *           example: "en"
 *         timezone:
 *           type: string
 *           description: User's preferred timezone
 *           example: "America/New_York"
 *         dateFormat:
 *           type: string
 *           enum: [MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY]
 *           description: User's preferred date format
 *           example: "MM/DD/YYYY"
 *         timeFormat:
 *           type: string
 *           enum: [12h, 24h]
 *           description: User's preferred time format
 *           example: "12h"
 *         currency:
 *           type: string
 *           description: User's preferred currency
 *           example: "USD"
 *         notifications:
 *           type: object
 *           properties:
 *             email:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *                 frequency:
 *                   type: string
 *                   enum: [instant, daily, weekly, never]
 *                   example: "instant"
 *                 types:
 *                   type: object
 *                   properties:
 *                     documentShared:
 *                       type: boolean
 *                       example: true
 *                     documentSigned:
 *                       type: boolean
 *                       example: true
 *                     workflowCompleted:
 *                       type: boolean
 *                       example: true
 *             inApp:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *                 sound:
 *                   type: boolean
 *                   example: true
 *                 desktop:
 *                   type: boolean
 *                   example: true
 *             sms:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: false
 */

/**
 * @swagger
 * /settings/user/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expand
 *         schema:
 *           type: string
 *         description: Expand nested objects (e.g., "notifications,privacy")
 *         example: "notifications,privacy"
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.get('/user/preferences', verifyUserToken, settingsController.getUserPreferences);

/**
 * @swagger
 * /settings/user/preferences:
 *   patch:
 *     summary: Update specific preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko]
 *                 description: User's preferred language
 *                 example: "es"
 *               timezone:
 *                 type: string
 *                 description: User's preferred timezone
 *                 example: "Europe/Madrid"
 *               dateFormat:
 *                 type: string
 *                 enum: [MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY]
 *                 description: User's preferred date format
 *                 example: "DD/MM/YYYY"
 *               timeFormat:
 *                 type: string
 *                 enum: [12h, 24h]
 *                 description: User's preferred time format
 *                 example: "24h"
 *               currency:
 *                 type: string
 *                 description: User's preferred currency (3-letter ISO code)
 *                 example: "EUR"
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *                       frequency:
 *                         type: string
 *                         enum: [instant, daily, weekly, never]
 *                         example: "daily"
 *                       types:
 *                         type: object
 *                         properties:
 *                           documentShared:
 *                             type: boolean
 *                             example: true
 *                           documentSigned:
 *                             type: boolean
 *                             example: false
 *                           workflowCompleted:
 *                             type: boolean
 *                             example: true
 *                   inApp:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *                       sound:
 *                         type: boolean
 *                         example: false
 *                       desktop:
 *                         type: boolean
 *                         example: true
 *                   sms:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         example: false
 *             example:
 *               language: "es"
 *               timezone: "Europe/Madrid"
 *               notifications:
 *                 email:
 *                   frequency: "daily"
 *     responses:
 *       200:
 *         description: Preferences updated successfully
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
 *                   example: "Preferences updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["language", "timezone", "notifications.email.frequency"]
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Language must be one of: en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.patch('/user/preferences', verifyUserToken, settingsController.updateUserPreferences);

/**
 * @swagger
 * /settings/user/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Upload a new avatar image for the authenticated user
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *                   example: "Avatar uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/avatars/user_123.jpg"
 *                     thumbnailUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com/avatars/user_123_thumb.jpg"
 *       400:
 *         description: Bad request - Invalid file format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Invalid file format. Supported formats: JPEG, PNG, GIF"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
 *       413:
 *         description: Payload Too Large - File size exceeds limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "FILE_TOO_LARGE"
 *                     message:
 *                       type: string
 *                       example: "File size exceeds 5MB limit"
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
router.post('/user/avatar', verifyUserToken, upload.single('avatar'), settingsController.uploadUserAvatar);

/**
 * @swagger
 * /settings/user/avatar:
 *   delete:
 *     summary: Remove user avatar
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
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
 *                   example: "Avatar removed successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.delete('/user/avatar', verifyUserToken, settingsController.removeUserAvatar);

/**
 * @swagger
 * /settings/user:
 *   put:
 *     summary: Update authenticated user profile
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's last name
 *                 example: "Doe"
 *               preferences:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     enum: [en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko]
 *                     description: Preferred language
 *                     example: "en"
 *                   timezone:
 *                     type: string
 *                     description: Preferred timezone
 *                     example: "America/New_York"
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                         description: Email notifications enabled
 *                       inApp:
 *                         type: boolean
 *                         description: In-app notifications enabled
 *     responses:
 *       200:
 *         description: User profile updated successfully
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
 *                   example: "User profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         language:
 *                           type: string
 *                           example: "en"
 *                         timezone:
 *                           type: string
 *                           example: "America/New_York"
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             inApp:
 *                               type: boolean
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Language must be one of: en, es, fr, de, it, pt, nl, pl, ru, zh, ja, ko"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.put('/user', verifyUserToken, settingsController.updateUserProfile);

/**
 * @swagger
 * /settings/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information including name and phone number
 *     tags: [Settings]
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
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: User's last name
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *                 description: Phone number in international format (optional)
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user_123"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
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
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Invalid input data"
 *                     details:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: "First name is required"
 *                         phone:
 *                           type: string
 *                           example: "Invalid phone number format"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found
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
 *                   example: "User not found"
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
router.put('/user/profile', verifyUserToken, settingsController.updateUserProfile);

/**
 * @swagger
 * /settings/organization:
 *   put:
 *     summary: Update organization name and branding settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
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
 *                 maxLength: 100
 *                 description: Organization name
 *                 example: "Updated Company Name"
 *               branding:
 *                 type: object
 *                 properties:
 *                   logo:
 *                     type: string
 *                     format: uri
 *                     description: Logo URL
 *                     example: "https://example.com/logo.png"
 *                   primaryColor:
 *                     type: string
 *                     pattern: "^#[0-9A-F]{6}$"
 *                     description: Primary color hex code
 *                     example: "#FF6B6B"
 *                   secondaryColor:
 *                     type: string
 *                     pattern: "^#[0-9A-F]{6}$"
 *                     description: Secondary color hex code
 *                     example: "#FCAB10"
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Organization name cannot be empty"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Only organization owner can update
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
 *                   example: "Only organization owner can update settings"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.put('/organization', verifyUserToken, settingsController.updateOrganization);

/**
 * @swagger
 * components:
 *   schemas:
 *     SmtpConfiguration:
 *       type: object
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Whether SMTP is enabled
 *           example: true
 *         host:
 *           type: string
 *           description: SMTP server host
 *           example: "smtp.gmail.com"
 *         port:
 *           type: number
 *           description: SMTP server port
 *           example: 587
 *         secure:
 *           type: boolean
 *           description: Use secure connection (TLS/SSL)
 *           example: true
 *         username:
 *           type: string
 *           description: SMTP username
 *           example: "noreply@acme.com"
 *         passwordSet:
 *           type: boolean
 *           description: Indicates if password is configured (password is never returned)
 *           example: true
 *         fromName:
 *           type: string
 *           description: Sender display name
 *           example: "Acme Corporation"
 *         fromEmail:
 *           type: string
 *           format: email
 *           description: Sender email address
 *           example: "noreply@acme.com"
 *         replyTo:
 *           type: string
 *           format: email
 *           description: Reply-to email address
 *           example: "support@acme.com"
 *         testEmailSent:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last test email sent
 *           example: "2024-01-20T10:00:00Z"
 */

/**
 * @swagger
 * /settings/smtp:
 *   get:
 *     summary: Get SMTP configuration
 *     description: Get the SMTP email configuration for the organization
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *     responses:
 *       200:
 *         description: SMTP configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SmtpConfiguration'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.get('/smtp', verifyUserToken, settingsController.getSmtpConfiguration);

/**
 * @swagger
 * /settings/smtp/test:
 *   post:
 *     summary: Test SMTP configuration
 *     description: Send a test email using the configured SMTP settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testEmail
 *             properties:
 *               testEmail:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address for the test
 *                 example: "admin@acme.com"
 *               testSubject:
 *                 type: string
 *                 maxLength: 255
 *                 description: Subject line for the test email
 *                 example: "SMTP Test Email"
 *               testBody:
 *                 type: string
 *                 maxLength: 10000
 *                 description: Body content for the test email
 *                 example: "This is a test email to verify SMTP configuration."
 *           example:
 *             testEmail: "admin@acme.com"
 *             testSubject: "SMTP Test Email"
 *             testBody: "This is a test email to verify SMTP configuration."
 *     responses:
 *       200:
 *         description: Test email sent successfully
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
 *                   example: "Test email sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       description: Unique identifier for the sent message
 *                       example: "msg_123456"
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the email was sent
 *                       example: "2024-01-22T10:00:00Z"
 *       400:
 *         description: Bad request - Invalid input data or SMTP not configured
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
 *                   example: "SMTP configuration is incomplete. Please configure SMTP settings first."
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
 *       500:
 *         description: Internal server error or email sending failure
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
 *                   example: "Failed to send test email: Connection refused"
 */
router.post('/smtp/test', verifyUserToken, settingsController.testSmtpConfiguration);

/**
 * @swagger
 * /settings/smtp:
 *   put:
 *     summary: Update SMTP configuration
 *     description: Update the SMTP email configuration for the organization
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Whether SMTP is enabled
 *                 example: true
 *               host:
 *                 type: string
 *                 description: SMTP server hostname
 *                 example: "smtp.sendgrid.net"
 *               port:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 65535
 *                 description: SMTP server port
 *                 example: 587
 *               secure:
 *                 type: boolean
 *                 description: Use secure connection (TLS/SSL)
 *                 example: true
 *               username:
 *                 type: string
 *                 maxLength: 255
 *                 description: SMTP username
 *                 example: "apikey"
 *               password:
 *                 type: string
 *                 maxLength: 1000
 *                 description: SMTP password (only sent when changing)
 *                 example: "SG.actual-api-key-here"
 *               fromName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Sender display name
 *                 example: "Acme Notifications"
 *               fromEmail:
 *                 type: string
 *                 format: email
 *                 description: Sender email address
 *                 example: "notifications@acme.com"
 *               replyTo:
 *                 type: string
 *                 format: email
 *                 description: Reply-to email address
 *                 example: "no-reply@acme.com"
 *           example:
 *             enabled: true
 *             host: "smtp.sendgrid.net"
 *             port: 587
 *             secure: true
 *             username: "apikey"
 *             password: "SG.actual-api-key-here"
 *             fromName: "Acme Notifications"
 *             fromEmail: "notifications@acme.com"
 *             replyTo: "no-reply@acme.com"
 *     responses:
 *       200:
 *         description: SMTP configuration updated successfully
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
 *                   example: "SMTP configuration updated successfully"
 *       400:
 *         description: Bad request - Invalid input data
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
 *                   example: "Host must be a valid hostname"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - Only organization owner can update or user not linked
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
 *                   example: "Only organization owner can update SMTP configuration"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.put('/smtp', verifyUserToken, settingsController.updateSmtpConfiguration);

/**
 * @swagger
 * components:
 *   schemas:
 *     Webhook:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Webhook ID
 *           example: "webhook_123"
 *         name:
 *           type: string
 *           description: Webhook name
 *           example: "Document Signing Webhook"
 *         description:
 *           type: string
 *           description: Webhook description
 *           example: "Notifies when documents are signed"
 *         url:
 *           type: string
 *           format: uri
 *           description: Webhook endpoint URL
 *           example: "https://api.example.com/webhooks/document-signed"
 *         events:
 *           type: array
 *           items:
 *             type: string
 *             enum: [document.created, document.signed, document.completed, document.rejected, document.expired, workflow.started, workflow.completed, workflow.cancelled, contact.created, contact.updated, contact.deleted, user.created, user.updated, user.deleted]
 *           description: List of events this webhook subscribes to
 *           example: ["document.signed", "document.completed"]
 *         active:
 *           type: boolean
 *           description: Whether the webhook is active
 *           example: true
 *         statistics:
 *           type: object
 *           properties:
 *             totalCalls:
 *               type: number
 *               description: Total number of webhook calls made
 *               example: 150
 *             successfulCalls:
 *               type: number
 *               description: Number of successful webhook calls
 *               example: 145
 *             failedCalls:
 *               type: number
 *               description: Number of failed webhook calls
 *               example: 5
 *             averageResponseTime:
 *               type: number
 *               description: Average response time in milliseconds
 *               example: 250
 *         lastTriggered:
 *           type: string
 *           format: date-time
 *           description: Last time the webhook was triggered
 *           example: "2024-01-22T10:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2024-01-15T09:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2024-01-22T09:30:00Z"
 */

/**
 * @swagger
 * /settings/webhooks:
 *   get:
 *     summary: List organization webhooks
 *     description: Retrieve a paginated list of webhooks for the authenticated user's organization with optional filtering and sorting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of webhooks per page
 *         example: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, failed]
 *         description: Filter by webhook status
 *         example: "active"
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *           enum: [document.created, document.signed, document.completed, document.rejected, document.expired, workflow.started, workflow.completed, workflow.cancelled, contact.created, contact.updated, contact.deleted, user.created, user.updated, user.deleted]
 *         description: Filter by specific event type
 *         example: "document.signed"
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, name, lastTriggered]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Webhooks retrieved successfully
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
 *                     webhooks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Webhook'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                           example: 1
 *                         totalPages:
 *                           type: number
 *                           example: 5
 *                         totalItems:
 *                           type: number
 *                           example: 87
 *                         itemsPerPage:
 *                           type: number
 *                           example: 20
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                 filters:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     event:
 *                       type: string
 *                       example: "document.signed"
 *                 sorting:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "createdAt"
 *                     order:
 *                       type: string
 *                       example: "desc"
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Invalid query parameters"
 *                     details:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "Status must be one of: active, inactive, failed"
 *                         perPage:
 *                           type: string
 *                           example: "Per page cannot exceed 100"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization
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
 *                   example: "User not linked to any organization"
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
router.get('/webhooks', verifyUserToken, settingsController.listWebhooks);

/**
 * @swagger
 * /settings/webhooks:
 *   post:
 *     summary: Create a new webhook
 *     tags: [Settings]
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
 *               - url
 *               - events
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Name of the webhook
 *                 example: "Document Completion Webhook"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional description of the webhook
 *                 example: "Webhook to notify external system when documents are completed"
 *               url:
 *                 type: string
 *                 format: uri
 *                 pattern: "^https://"
 *                 description: HTTPS endpoint URL for the webhook
 *                 example: "https://api.example.com/webhooks/documents"
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [
 *                     "document.created",
 *                     "document.signed", 
 *                     "document.completed",
 *                     "document.rejected",
 *                     "document.expired",
 *                     "workflow.started",
 *                     "workflow.completed",
 *                     "workflow.cancelled",
 *                     "contact.created",
 *                     "contact.updated",
 *                     "contact.deleted",
 *                     "user.created",
 *                     "user.updated",
 *                     "user.deleted"
 *                   ]
 *                 minItems: 1
 *                 description: Array of events that will trigger this webhook
 *                 example: ["document.completed", "document.signed"]
 *               headers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Custom headers to include with webhook requests
 *                 example:
 *                   Authorization: "Bearer token123"
 *                   X-Custom-Header: "custom-value"
 *               secret:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 256
 *                 description: Secret key for webhook signature verification (optional, auto-generated if not provided)
 *                 example: "my-webhook-secret-key"
 *               active:
 *                 type: boolean
 *                 description: Whether the webhook is active
 *                 default: true
 *                 example: true
 *               retryPolicy:
 *                 type: object
 *                 properties:
 *                   maxAttempts:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 10
 *                     default: 3
 *                     description: Maximum number of retry attempts for failed webhooks
 *                     example: 3
 *                   backoffMultiplier:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     default: 2
 *                     description: Multiplier for exponential backoff between retries
 *                     example: 2
 *           example:
 *             name: "Document Completion Webhook"
 *             description: "Webhook to notify external system when documents are completed"
 *             url: "https://api.example.com/webhooks/documents"
 *             events: ["document.completed", "document.signed"]
 *             headers:
 *               Authorization: "Bearer token123"
 *               X-Custom-Header: "custom-value"
 *             secret: "my-webhook-secret-key"
 *             active: true
 *             retryPolicy:
 *               maxAttempts: 3
 *               backoffMultiplier: 2
 *     responses:
 *       201:
 *         description: Webhook created successfully
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
 *                   example: "Webhook created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique webhook identifier
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Document Completion Webhook"
 *                     description:
 *                       type: string
 *                       example: "Webhook to notify external system when documents are completed"
 *                     url:
 *                       type: string
 *                       example: "https://api.example.com/webhooks/documents"
 *                     events:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["document.completed", "document.signed"]
 *                     headers:
 *                       type: object
 *                       example:
 *                         Authorization: "Bearer token123"
 *                         X-Custom-Header: "custom-value"
 *                     secret:
 *                       type: string
 *                       description: Masked secret for security (first 8 characters + ...)
 *                       example: "my-webho..."
 *                     active:
 *                       type: boolean
 *                       example: true
 *                     retryPolicy:
 *                       type: object
 *                       properties:
 *                         maxAttempts:
 *                           type: integer
 *                           example: 3
 *                         backoffMultiplier:
 *                           type: number
 *                           example: 2
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalCalls:
 *                           type: integer
 *                           example: 0
 *                         successfulCalls:
 *                           type: integer
 *                           example: 0
 *                         failedCalls:
 *                           type: integer
 *                           example: 0
 *                         averageResponseTime:
 *                           type: number
 *                           example: 0
 *                     lastTriggered:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-22T10:00:00Z"
 *       400:
 *         description: Bad request - Invalid input data or webhook limit exceeded
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
 *                     validation_error:
 *                       summary: Validation error
 *                       value: "Webhook name is required"
 *                     limit_exceeded:
 *                       summary: Webhook limit exceeded
 *                       value: "Maximum webhook limit reached (20 webhooks per organization)"
 *                     invalid_url:
 *                       summary: Invalid URL format
 *                       value: "URL must be a valid HTTPS endpoint"
 *                     missing_events:
 *                       summary: No events specified
 *                       value: "At least one event must be specified"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.post('/webhooks', verifyUserToken, settingsController.createWebhook);

/**
 * @swagger
 * /settings/webhooks/{webhookId}:
 *   put:
 *     summary: Update webhook configuration
 *     description: Update an existing webhook's configuration including name, URL, events, headers, and other settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID to update
 *         example: "webhook_123"
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
 *                 maxLength: 100
 *                 description: Webhook name
 *                 example: "Updated Webhook Name"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Webhook description (optional)
 *                 example: "Updated description for document signing notifications"
 *               url:
 *                 type: string
 *                 format: uri
 *                 pattern: "^https://"
 *                 description: HTTPS webhook endpoint URL
 *                 example: "https://api.myapp.com/new-webhook-endpoint"
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [document.created, document.signed, document.completed, document.rejected, document.expired, workflow.started, workflow.completed, workflow.cancelled, contact.created, contact.updated, contact.deleted, user.created, user.updated, user.deleted]
 *                 minItems: 1
 *                 description: List of events this webhook subscribes to
 *                 example: ["document.signed", "document.completed"]
 *               headers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 description: Custom HTTP headers to include in webhook requests
 *                 example:
 *                   X-API-Key: "new-secret-key"
 *                   Authorization: "Bearer xyz123"
 *               secret:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 256
 *                 description: Secret key for webhook signature verification (optional)
 *                 example: "new_webhook_secret_key_2024"
 *               active:
 *                 type: boolean
 *                 description: Whether the webhook is active
 *                 example: false
 *               retryPolicy:
 *                 type: object
 *                 properties:
 *                   maxAttempts:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 10
 *                     description: Maximum retry attempts on failure
 *                     example: 3
 *                   backoffMultiplier:
 *                     type: number
 *                     minimum: 1
 *                     maximum: 5
 *                     description: Backoff multiplier for retry delays
 *                     example: 2
 *           example:
 *             name: "Updated Webhook Name"
 *             description: "Updated description"
 *             url: "https://api.myapp.com/new-webhook-endpoint"
 *             events: ["document.signed"]
 *             headers:
 *               X-API-Key: "new-secret-key"
 *             active: false
 *             retryPolicy:
 *               maxAttempts: 3
 *     responses:
 *       200:
 *         description: Webhook updated successfully
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
 *                   example: "Webhook updated successfully"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Invalid input data"
 *                     details:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Webhook name cannot be empty"
 *                         url:
 *                           type: string
 *                           example: "URL must be a valid HTTPS endpoint"
 *                         events:
 *                           type: string
 *                           example: "At least one event must be specified"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Webhook or organization not found
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
 *                   example: "Webhook not found"
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
router.put('/webhooks/:webhookId', verifyUserToken, settingsController.updateWebhook);

/**
 * @swagger
 * /settings/webhooks/{webhookId}:
 *   delete:
 *     summary: Delete a webhook
 *     description: Permanently delete an existing webhook. This action cannot be undone.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *       - in: path
 *         name: webhookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook ID to delete
 *         example: "webhook_123"
 *     responses:
 *       200:
 *         description: Webhook deleted successfully
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
 *                   example: "Webhook deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Webhook or organization not found
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
 *                   example: "Webhook not found"
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
router.delete('/webhooks/:webhookId', verifyUserToken, settingsController.deleteWebhook);

/**
 * @swagger
 * /settings/integrations:
 *   get:
 *     summary: List available integrations
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [connected, available, coming_soon]
 *         description: Filter integrations by connection status
 *         example: connected
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [automation, signatures, crm, accounting, storage, communication]
 *         description: Filter integrations by category
 *         example: crm
 *     responses:
 *       200:
 *         description: Integrations list retrieved successfully
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
 *                       id:
 *                         type: string
 *                         description: Unique integration identifier
 *                         example: "zapier"
 *                       name:
 *                         type: string
 *                         description: Integration display name
 *                         example: "Zapier"
 *                       description:
 *                         type: string
 *                         description: Integration description
 *                         example: "Connect with 5000+ apps through automated workflows"
 *                       category:
 *                         type: string
 *                         enum: [automation, signatures, crm, accounting, storage, communication]
 *                         description: Integration category
 *                         example: "automation"
 *                       icon:
 *                         type: string
 *                         format: uri
 *                         description: Integration icon URL
 *                         example: "https://cdn.zapier.com/storage/services/da3f4e7d4c90406680dcda5c6c07bc8d.png"
 *                       status:
 *                         type: string
 *                         enum: [connected, available, coming_soon]
 *                         description: Integration connection status
 *                         example: "connected"
 *                       connected:
 *                         type: boolean
 *                         description: Whether the integration is currently connected
 *                         example: true
 *                       connectedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp when the integration was connected (only for connected integrations)
 *                         example: "2024-01-10T10:00:00Z"
 *                       configuration:
 *                         type: object
 *                         description: Integration configuration status (only for connected integrations)
 *                         properties:
 *                           apiKeySet:
 *                             type: boolean
 *                             description: Whether API key is configured
 *                             example: true
 *                           webhooksEnabled:
 *                             type: boolean
 *                             description: Whether webhooks are enabled
 *                             example: true
 *                         example:
 *                           apiKeySet: true
 *                           webhooksEnabled: true
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of supported features
 *                         example: ["triggers", "actions", "instant_triggers"]
 *                       documentation:
 *                         type: string
 *                         format: uri
 *                         description: Link to integration documentation
 *                         example: "https://docs.example.com/integrations/zapier"
 *                       requiredScopes:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Required OAuth scopes (only for available integrations)
 *                         example: ["signature_read", "signature_write"]
 *                       setupUrl:
 *                         type: string
 *                         description: Setup URL for connecting the integration (only for available integrations)
 *                         example: "/settings/integrations/zapier/setup"
 *             examples:
 *               connected_integration:
 *                 summary: Connected integration example
 *                 value:
 *                   success: true
 *                   data: [
 *                     {
 *                       id: "zapier",
 *                       name: "Zapier",
 *                       description: "Connect with 5000+ apps through automated workflows",
 *                       category: "automation",
 *                       icon: "https://cdn.zapier.com/storage/services/da3f4e7d4c90406680dcda5c6c07bc8d.png",
 *                       status: "connected",
 *                       connected: true,
 *                       connectedAt: "2024-01-10T10:00:00Z",
 *                       configuration: {
 *                         apiKeySet: true,
 *                         webhooksEnabled: true
 *                       },
 *                       features: ["triggers", "actions", "instant_triggers"],
 *                       documentation: "https://docs.example.com/integrations/zapier"
 *                     }
 *                   ]
 *               available_integration:
 *                 summary: Available integration example
 *                 value:
 *                   success: true
 *                   data: [
 *                     {
 *                       id: "docusign",
 *                       name: "DocuSign",
 *                       description: "Electronic signature integration for seamless document signing",
 *                       category: "signatures",
 *                       icon: "https://www.docusign.com/sites/default/files/DS-Logo-Primary.png",
 *                       status: "available",
 *                       connected: false,
 *                       features: ["send_documents", "template_management", "status_updates"],
 *                       documentation: "https://docs.example.com/integrations/docusign",
 *                       requiredScopes: ["signature_read", "signature_write", "account_read"],
 *                       setupUrl: "/settings/integrations/docusign/setup"
 *                     }
 *                   ]
 *               coming_soon_integration:
 *                 summary: Coming soon integration example
 *                 value:
 *                   success: true
 *                   data: [
 *                     {
 *                       id: "microsoft365",
 *                       name: "Microsoft 365",
 *                       description: "Integration with Microsoft Office applications and OneDrive",
 *                       category: "storage",
 *                       icon: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4OZjZ",
 *                       status: "coming_soon",
 *                       connected: false,
 *                       features: ["document_storage", "outlook_integration", "teams_notifications"],
 *                       documentation: "https://docs.example.com/integrations/microsoft365"
 *                     }
 *                   ]
 *       400:
 *         description: Bad request - Invalid query parameters
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
 *                     invalid_status:
 *                       summary: Invalid status filter
 *                       value: "Status must be one of: connected, available, coming_soon"
 *                     invalid_category:
 *                       summary: Invalid category filter
 *                       value: "Category must be one of: automation, signatures, crm, accounting, storage, communication"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found or deleted
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
 *                   example: "Organization not found"
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
router.get('/integrations', verifyUserToken, settingsController.getIntegrations);

/**
 * @swagger
 * components:
 *   schemas:
 *     IntegrationConnection:
 *       type: object
 *       properties:
 *         integrationId:
 *           type: string
 *           description: Integration identifier
 *           example: "docusign"
 *         connected:
 *           type: boolean
 *           description: Whether the integration is connected
 *           example: true
 *         connectedAt:
 *           type: string
 *           format: date-time
 *           description: When the integration was connected
 *           example: "2024-01-22T10:00:00Z"
 *         configuration:
 *           type: object
 *           description: Integration configuration details
 *           properties:
 *             accountId:
 *               type: string
 *               description: Account ID for the integration
 *               example: "acc_123456789"
 *             environment:
 *               type: string
 *               enum: [sandbox, production]
 *               description: Integration environment
 *               example: "production"
 *             syncInterval:
 *               type: string
 *               enum: [realtime, hourly, daily, weekly, manual]
 *               description: Data sync frequency
 *               example: "hourly"
 *             syncDirection:
 *               type: string
 *               enum: [inbound, outbound, bidirectional]
 *               description: Data sync direction
 *               example: "bidirectional"
 */

/**
 * @swagger
 * /settings/integrations/{integrationId}/connect:
 *   post:
 *     summary: Connect an integration
 *     description: Connect a third-party integration service to the organization. Supports both API key and OAuth authentication methods.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Organization-Id
 *         schema:
 *           type: string
 *         description: Organization ID (optional if user belongs to single org)
 *         example: "org_123"
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [docusign, salesforce, hubspot, zapier, slack, microsoft-teams, google-drive, dropbox, quickbooks, stripe, paypal, twilio, sendgrid, mailchimp, zoom, calendly]
 *         description: Integration service identifier
 *         example: "docusign"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               # API Key Authentication
 *               apiKey:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 500
 *                 description: API key for key-based authentication
 *                 example: "integration-api-key-123456"
 *               apiSecret:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 500
 *                 description: API secret for key-based authentication
 *                 example: "integration-api-secret-abcdef"
 *               # OAuth Authentication
 *               authorizationCode:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 1000
 *                 description: OAuth authorization code
 *                 example: "oauth-auth-code-xyz789"
 *               redirectUri:
 *                 type: string
 *                 format: uri
 *                 pattern: "^https://"
 *                 description: OAuth redirect URI (must be HTTPS)
 *                 example: "https://app.example.com/integrations/callback"
 *               clientId:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 200
 *                 description: OAuth client ID
 *                 example: "oauth-client-id-123"
 *               clientSecret:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 500
 *                 description: OAuth client secret
 *                 example: "oauth-client-secret-abc"
 *               # Integration Metadata
 *               environment:
 *                 type: string
 *                 enum: [sandbox, production]
 *                 default: production
 *                 description: Integration environment
 *                 example: "production"
 *               accountId:
 *                 type: string
 *                 maxLength: 100
 *                 description: Account ID for the integration service
 *                 example: "acc_demo_123"
 *               # Configuration Options
 *               config:
 *                 type: object
 *                 description: Integration-specific configuration
 *                 properties:
 *                   syncInterval:
 *                     type: string
 *                     enum: [realtime, hourly, daily, weekly, manual]
 *                     default: hourly
 *                     description: Data synchronization frequency
 *                     example: "hourly"
 *                   syncDirection:
 *                     type: string
 *                     enum: [inbound, outbound, bidirectional]
 *                     default: bidirectional
 *                     description: Direction of data synchronization
 *                     example: "bidirectional"
 *                   enabled:
 *                     type: boolean
 *                     default: true
 *                     description: Whether sync is enabled
 *                     example: true
 *                   region:
 *                     type: string
 *                     maxLength: 50
 *                     description: Integration service region
 *                     example: "us-west-2"
 *                   version:
 *                     type: string
 *                     maxLength: 20
 *                     description: API version to use
 *                     example: "v2.1"
 *                 additionalProperties: true
 *           examples:
 *             api-key-integration:
 *               summary: API Key Based Integration (Zapier)
 *               value:
 *                 apiKey: "integration-api-key"
 *                 apiSecret: "integration-api-secret"
 *                 config:
 *                   syncInterval: "hourly"
 *                   syncDirection: "bidirectional"
 *                   customField: "value"
 *             oauth-integration:
 *               summary: OAuth Integration (DocuSign)
 *               value:
 *                 authorizationCode: "oauth-auth-code"
 *                 redirectUri: "https://app.example.com/integrations/callback"
 *                 environment: "production"
 *                 config:
 *                   syncInterval: "realtime"
 *                   syncDirection: "outbound"
 *     responses:
 *       200:
 *         description: Integration connected successfully
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
 *                   example: "Integration connected successfully"
 *                 data:
 *                   $ref: '#/components/schemas/IntegrationConnection'
 *             examples:
 *               docusign-connection:
 *                 summary: DocuSign Integration Connected
 *                 value:
 *                   success: true
 *                   message: "Integration connected successfully"
 *                   data:
 *                     integrationId: "docusign"
 *                     connected: true
 *                     connectedAt: "2024-01-22T10:00:00Z"
 *                     configuration:
 *                       accountId: "acc_123456789"
 *                       environment: "production"
 *                       syncInterval: "hourly"
 *                       syncDirection: "bidirectional"
 *       400:
 *         description: Bad request - Invalid input data or unsupported integration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Invalid input data"
 *                     details:
 *                       type: object
 *                       properties:
 *                         apiKey:
 *                           type: string
 *                           example: "API key must be at least 8 characters long"
 *                         redirectUri:
 *                           type: string
 *                           example: "Redirect URI must be a valid HTTPS URL"
 *                 message:
 *                   type: string
 *                   example: "Invalid integration ID. Supported integrations: docusign, salesforce, hubspot..."
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User not linked to any organization or access denied
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
 *                   example: "User not linked to any organization"
 *       404:
 *         description: Not Found - Organization not found
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
 *                   example: "Organization not found"
 *       409:
 *         description: Conflict - Integration is already connected
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
 *                   example: "Integration is already connected"
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
router.post('/integrations/:integrationId/connect', verifyUserToken, settingsController.connectIntegration);

/**
 * @swagger
 * /settings/user/notifications:
 *   put:
 *     summary: Update notification preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channels:
 *                 type: object
 *                 description: Notification channel settings
 *                 properties:
 *                   email:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         description: Enable email notifications
 *                         example: true
 *                       frequency:
 *                         type: string
 *                         enum: [instant, daily, weekly, never]
 *                         description: Email notification frequency
 *                         example: "daily"
 *                       quietHours:
 *                         type: object
 *                         properties:
 *                           enabled:
 *                             type: boolean
 *                             description: Enable quiet hours for email notifications
 *                             example: true
 *                           start:
 *                             type: string
 *                             pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                             description: Quiet hours start time in HH:MM format
 *                             example: "20:00"
 *                           end:
 *                             type: string
 *                             pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                             description: Quiet hours end time in HH:MM format
 *                             example: "09:00"
 *                   sms:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         description: Enable SMS notifications
 *                         example: false
 *                       frequency:
 *                         type: string
 *                         enum: [instant, daily, weekly, never]
 *                         description: SMS notification frequency
 *                         example: "instant"
 *                   push:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         description: Enable push notifications
 *                         example: true
 *                       frequency:
 *                         type: string
 *                         enum: [instant, daily, weekly, never]
 *                         description: Push notification frequency
 *                         example: "instant"
 *                   inApp:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                         description: Enable in-app notifications
 *                         example: true
 *                       sound:
 *                         type: boolean
 *                         description: Enable notification sounds
 *                         example: true
 *                       desktop:
 *                         type: boolean
 *                         description: Enable desktop notifications
 *                         example: true
 *               preferences:
 *                 type: object
 *                 description: Specific notification preferences by category
 *                 properties:
 *                   documents:
 *                     type: object
 *                     properties:
 *                       created:
 *                         type: object
 *                         additionalProperties:
 *                           type: boolean
 *                         description: Document created notification preferences by channel
 *                         example:
 *                           email: true
 *                           push: false
 *                       signed:
 *                         type: object
 *                         additionalProperties:
 *                           type: boolean
 *                         description: Document signed notification preferences by channel
 *                         example:
 *                           sms: true
 *                           email: true
 *                       completed:
 *                         type: object
 *                         additionalProperties:
 *                           type: boolean
 *                         description: Document completed notification preferences by channel
 *                         example:
 *                           email: true
 *                           push: true
 *           examples:
 *             basic_update:
 *               summary: Basic notification settings update
 *               value:
 *                 channels:
 *                   email:
 *                     frequency: "daily"
 *                     quietHours:
 *                       enabled: true
 *                       start: "20:00"
 *                       end: "09:00"
 *                 preferences:
 *                   documents:
 *                     created:
 *                       email: false
 *                     signed:
 *                       sms: true
 *             comprehensive_update:
 *               summary: Comprehensive notification settings update
 *               value:
 *                 channels:
 *                   email:
 *                     enabled: true
 *                     frequency: "daily"
 *                     quietHours:
 *                       enabled: true
 *                       start: "20:00"
 *                       end: "09:00"
 *                   sms:
 *                     enabled: true
 *                     frequency: "instant"
 *                   push:
 *                     enabled: true
 *                     frequency: "instant"
 *                   inApp:
 *                     enabled: true
 *                     sound: true
 *                     desktop: true
 *                 preferences:
 *                   documents:
 *                     created:
 *                       email: true
 *                       push: false
 *                     signed:
 *                       email: true
 *                       sms: true
 *                       push: true
 *                     completed:
 *                       email: true
 *                       push: true
 *                   security:
 *                     alerts:
 *                       email: true
 *                       sms: true
 *                       push: true
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
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
 *                   example: "Notification preferences updated successfully"
 *       400:
 *         description: Bad request - Invalid input data
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
 *                     validation_error:
 *                       summary: Validation error
 *                       value: "Email frequency must be one of: instant, daily, weekly, never"
 *                     invalid_time_format:
 *                       summary: Invalid time format
 *                       value: "Quiet hours start time must be in HH:MM format (e.g., 20:00)"
 *                     invalid_channel:
 *                       summary: Invalid notification channel
 *                       value: "Document created notification channels must be one of: email, sms, push, inApp"
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - User not found or deleted
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
 *                   example: "User not found"
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
router.put('/user/notifications', verifyUserToken, settingsController.updateUserNotifications);

module.exports = router;