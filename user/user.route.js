const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyUserToken } = require('../middleware/user.auth.middleware');

/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     summary: Send OTP to user's mobile number
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: User's mobile number (10 digits)
 *                 example: "9999999999"
 *               isSignup:
 *                 type: boolean
 *                 description: Set to true if checking for signup flow
 *                 example: false
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *       400:
 *         description: Invalid mobile number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mobile number is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: User signup with organization creation
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - personName
 *               - mobile
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: Name of the organization
 *                 example: "Superdoc Technologies"
 *               personName:
 *                 type: string
 *                 description: Full name of the person
 *                 example: "John Doe"
 *               mobile:
 *                 type: string
 *                 description: Mobile number (10 digits)
 *                 example: "9999999999"
 *               email:
 *                 type: string
 *                 description: Email address (optional)
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signup successful"
 *                 userId:
 *                   type: string
 *                   example: "60d5ecb74f5b2f001c8e4b4a"
 *                 organizationId:
 *                   type: string
 *                   example: "60d5ecb74f5b2f001c8e4b4b"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Organization name, person name, and mobile number are required"
 *       409:
 *         description: Duplicate mobile number or email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mobile number already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/signup', userController.signup);

router.post('/send-otp', userController.sendOTP);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user with mobile number and OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - otp
 *             properties:
 *               mobile:
 *                 type: string
 *                 description: User's mobile number (10 digits)
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP sent to the mobile number
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Unauthorized - Invalid OTP or OTP expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
// POST /api/user/login
router.post('/login', userController.login);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [User]
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
 *                 _id:
 *                   type: string
 *                   example: "60d5ecb74f5b2f001c8e4b4a"
 *                 fullName:
 *                   type: string
 *                   example: "John Doe"
 *                 mobile:
 *                   type: string
 *                   example: "9999999999"
 *                 organizationId:
 *                   type: string
 *                   example: "60d5ecb74f5b2f001c8e4b4b"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-15T12:00:00.000Z"
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
// GET /api/user/me
router.get('/me', verifyUserToken, userController.getMe);

module.exports = router;