import express from "express";
import "dotenv/config";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { connectDB } from "./lib/db.js";


// console.log("Environment Variables:", {
//     PORT: process.env.PORT,
//     MONGO_URI: process.env.MONGO_URI,
//     NODE_ENV: process.env.NODE_ENV
// });

const app = express();
const __dirname = path.resolve();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (process.env.NODE_ENV === "development") {
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));
    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
    });
}

app.listen(process.env.PORT || 3000, () => {
    connectDB();
    console.log("Server is running on PORT: " + (process.env.PORT || 3000));
})