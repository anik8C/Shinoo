import express from "express";
import { updateProfilePictureController } from "../controllers/userController.js";
import { protectRoute } from "../middlewares/protectRoute.js";
import { arcjetProtection } from "../middlewares/arcjetProtection.js";

const router = express.Router();

router.put("/update-profile", arcjetProtection, protectRoute, updateProfilePictureController);

export default router;