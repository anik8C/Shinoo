import express from "express";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on PORT: " + (process.env.PORT || 3000));
})