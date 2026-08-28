const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
console.log("Authorization header:", req.headers.authorization);


const token = req.headers.authorization;

if (!token) {
    return res.status(401).json({
        message: "No authentication token provided"
    });
}

try {
    const cleanToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
} catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(403).json({
        message: "Invalid or expired token"
    });
}


};

module.exports = authenticateToken;
