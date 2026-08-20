import express from "express";
import { signupController, loginController, logoutController } from "../controllers/authController.js";
import { arcjetProtection } from "../middlewares/arcjetProtection.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

router.use(arcjetProtection);

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Arcjet protection is working!" });
});
router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));


export default router;