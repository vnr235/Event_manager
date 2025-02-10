const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // Attach the full decoded token to req.user
        req.user = decoded;
        // Optionally, set req.id for convenience
        req.id = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ msg: "Invalid token", error: error.message });
    }
}

module.exports = authMiddleware;
