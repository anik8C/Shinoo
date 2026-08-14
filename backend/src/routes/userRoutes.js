import express from "express";
import { updateProfileController } from "../controllers/userController.js";
import protectRouteMiddleware from "../middlewares/protectRouteMiddleware.js";

const router = express.Router();

router.put("/update-profile", protectRouteMiddleware, updateProfileController);

export default router;