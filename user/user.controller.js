const userService = require('./user.service');
const userValidation = require('./user.validation');
const userDAO = require('./user.dao');
const jwt = require('jsonwebtoken');

class UserController {
    constructor() {}

    async signup(req, res) {
        try {
            // Validate request data
            const { error, value } = await userValidation.signup(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.details[0].message
                });
            }
            
            const result = await userService.signup(value);
            
            return res.status(201).json({
                message: result.message,
                userId: result.userId,
                organizationId: result.organizationId
            });
            
        } catch (error) {
            if (error.message === 'Mobile number already exists') {
                return res.status(409).json({ 
                    error: 'Mobile number already exists' 
                });
            } else if (error.message === 'Email already exists') {
                return res.status(409).json({ 
                    error: 'Email already exists' 
                });
            } else {
                console.error('Error in signup:', error);
                return res.status(500).json({ 
                    error: 'Internal server error' 
                });
            }
        }
    }

    async sendOTP(req, res) {
        try {
            // Validate request data
            const { error, value } = await userValidation.sendOTP(req.body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message
                });
            }
            
            const result = await userService.sendOTP(value.mobile);
            
            return res.status(200).json({
                message: result.message
            });
            
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ 
                    message: 'User not found' 
                });
            } else {
                console.error('Error sending OTP:', error);
                return res.status(500).json({ 
                    message: 'Internal server error' 
                });
            }
        }
    }

    async login(req, res) {
        try {
            // Validate request data
            const { error, value } = await userValidation.login(req.body);
            if (error) {
                return res.status(400).json({
                    error: error.details[0].message
                });
            }
            
            const user = await userService.loginWithOTP(value.mobile, value.otp);
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    mobile: user.mobile,
                    organizationId: user.organizationId 
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
            
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token
            });
            
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            } else if (error.message === 'Invalid OTP') {
                return res.status(401).json({ error: 'Invalid OTP' });
            } else if (error.message === 'OTP has expired') {
                return res.status(401).json({ error: 'OTP has expired' });
            } else {
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async getMe(req, res) {
        try {
            const userId = req.user.userId;
            
            const user = await userDAO.findById(userId);
            
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            
            // Return user profile data
            const userProfile = {
                _id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                organizationId: user.organizationId,
                createdAt: user.createdAt
            };
            
            return res.status(200).json(userProfile);
            
        } catch (error) {
            console.error('Error in getMe:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new UserController();