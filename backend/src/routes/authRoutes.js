import express from "express";
import { signupController, loginController, logoutController } from "../controllers/authController.js";
import { arcjetProtection } from "../middlewares/arcjetProtection.js";

const router = express.Router();

router.use(arcjetProtection);

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Arcjet protection is working!" });
});
router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);


export default router;