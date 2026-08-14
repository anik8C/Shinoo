import express from "express";
import { updateProfilePictureController } from "../controllers/userController.js";
import {protectRoute} from "../middlewares/protectRouteMiddleware.js";
import { arcjetProtection } from "../middlewares/arcjetMiddleware.js";

const router = express.Router();

router.put("/update-profile", arcjetProtection, protectRoute, updateProfilePictureController);

export default router;