const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/validate-token', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized: No token provided or invalid format.' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if the token contains userId (user token)
        if (!decoded.userId) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized: Invalid token type.' 
            });
        }

        // Return success with user information
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                userId: decoded.userId,
                mobile: decoded.mobile,
                organizationId: decoded.organizationId
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized: Token expired.' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized: Invalid token.' 
            });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during token verification.' 
        });
    }
});

module.exports = router;