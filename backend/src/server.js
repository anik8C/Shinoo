import express from "express";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./lib/db.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.join(__dirname, "../../frontend/dist");

app.set("trust proxy", 1);
app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);


// make ready for deployment
if (process.env.NODE_ENV === "production") {
    app.use(express.static(frontendDistPath));
    app.get("*", (_, res) => {
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
}

app.listen(process.env.PORT || 3000, () => {
    connectDB();
    console.log("Server is running on PORT: " + (process.env.PORT || 3000));
})
