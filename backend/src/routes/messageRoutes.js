import { Router } from "express";
import { messageController } from "../controllers/messageController.js";

const router = Router();

router.get("/send", messageController);

export default router;