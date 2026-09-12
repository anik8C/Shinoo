import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie?.split('; ').find((row) => row.startsWith('jwt='))?.split('=')[1];

        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error('Authentication error: No token provided'));
        }

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find the user in the database
        const user = await userModel.findById(decoded.userId).select("-password");
        if (!user) {
            console.log("Socket connection rejected: User not found");
            return next(new Error("Authentication Error: User not found"));
        }

        // attach the user to the socket object
        socket.user = user;
        socket.userId = user._id.toString(); // Attach userId to socket for easy access
        return next();
    }
    catch (error) {
        console.error("Error in socketAuthMiddleware:", error);
        next(new Error("Authentication Error: " + error.message));
    }
}