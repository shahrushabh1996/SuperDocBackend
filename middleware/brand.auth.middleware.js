const jwt = require('jsonwebtoken');

const verifyBrandToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or invalid format.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('[BrandAuthMiddleware] Token decoded successfully:', { 
            id: decoded.id, 
            _id: decoded._id, 
            email: decoded.email 
        });
        
        // Attach the decoded payload to the request object
        req.user = decoded; 

        // Ensure we have a brand ID - prioritize _id from MongoDB, fallback to id
        const brandId = decoded._id || decoded.id;
        
        if (!brandId) { 
             console.error('[BrandAuthMiddleware] Token decoded, but brand ID (id or _id) missing in payload:', decoded);
             return res.status(401).json({ message: 'Unauthorized: Brand ID missing from token payload.' });
        }
        
        // Standardize to req.user.id for consistency, regardless of whether it came from _id or id
        req.user.id = brandId;
        req.user.role = 'brand';
        
        console.log(`[BrandAuthMiddleware] Brand ID extracted and set: ${req.user.id}`);

        next(); // Token is valid, proceed to the next middleware/controller
    } catch (error) {
        console.error('[BrandAuthMiddleware] Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
        return res.status(500).json({ message: 'Internal server error during token verification.' });
    }
};

module.exports = {
    verifyBrandToken,
}; 