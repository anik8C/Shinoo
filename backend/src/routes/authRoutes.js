import express from "express";
import { signupController, loginController, logoutController } from "../controllers/authController.js";

const router = express.Router();

router.get("/signup", signupController);
router.get("/login", loginController);
router.get("/logout", logoutController);

export default router;