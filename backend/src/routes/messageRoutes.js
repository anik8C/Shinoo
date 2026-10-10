import { Router } from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { arcjetProtection } from "../middlewares/arcjetProtection.js";
import { getAllChatPartners, getAllContacts, getMessageByUser, markMessagesRead, sendMessage, deleteMessage } from "../controllers/messageController.js";

const router = Router();
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getAllChatPartners);
router.get("/:id", getMessageByUser);
router.patch("/:id/read", markMessagesRead);
router.post("/send/:id", sendMessage);
router.delete("/delete/:messageId", deleteMessage);

export default router;