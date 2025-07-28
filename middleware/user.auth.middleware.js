const jwt = require('jsonwebtoken');

const verifyUserToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Attach the decoded payload to the request object
        req.user = decoded;
        
        // Ensure we have a user ID
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = {
    verifyUserToken,
};