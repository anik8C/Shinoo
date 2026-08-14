import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


export default protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // if (!decoded) return res.status(401).json({ message: "Unauthenticated access. Please login to access this resource." });

            const user = await userModel.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Unauthenticated access. Please login to access this resource." });
            }

            req.user = user;
            return next();
        }

        return res.status(401).json({ message: "Unauthenticated access. Please login to access this resource." });

    } catch (error) {

        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Invalid or expired token. Please login again." });
        }

        console.error("Error in protectRoute middleware:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}