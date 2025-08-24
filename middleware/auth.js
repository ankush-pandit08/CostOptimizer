const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const bearerToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;
        const headerToken = req.header('x-auth-token');
        const token = bearerToken || headerToken || '';

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication required' });
    }
};
