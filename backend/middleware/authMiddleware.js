import jwt from "jsonwebtoken";

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Missing or invalid token." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

export { verifyAdmin };
