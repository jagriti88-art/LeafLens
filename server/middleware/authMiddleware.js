const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    // Check if header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user ID to the request object
            req.user = decoded.id;
            
            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};