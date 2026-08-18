import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { arcjetProtection } from "../middlewares/arcjetProtection.js";
import { getAllChatPartners, getAllContacts, getMessageByUser, sendMessage } from "../controllers/messageController.js";

const router = Router();
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getAllChatPartners);
router.get("/:id", getMessageByUser);
router.post("/send/:id", sendMessage);

export default router;