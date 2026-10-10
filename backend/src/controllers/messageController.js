import cloudinary from "../lib/cloudinary.js";
import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js"
import { getReceiverSocketIds, io } from "../lib/socket.js";


export async function getAllContacts(req, res) {

    try {
        const logggedInUserId = req.user._id;
        const contacts = await userModel.find({ _id: { $ne: logggedInUserId } }).select("-password");

        return res.status(200).json(contacts);

    } catch (error) {
        console.error("Error in getAllContacts: ", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getMessageByUser = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;
        const conversationFilter = {
            $or:
                [
                    { senderId: myId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: myId }
                ]
        };
        const unreadMessages = await messageModel.find({
            senderId: userToChatId,
            receiverId: myId,
            readAt: null
        }).select("_id");
        const readAt = new Date();
        if (unreadMessages.length) {
            const updateResult = await messageModel.updateMany(
                { _id: { $in: unreadMessages.map(({ _id }) => _id) }, readAt: null },
                { $set: { readAt } }
            );
            if (updateResult.modifiedCount) {
                const senderSocketIds = getReceiverSocketIds(userToChatId);
                senderSocketIds?.forEach((socketId) => {
                    io.to(socketId).emit("messagesRead", {
                        readerId: myId.toString(),
                        messageIds: unreadMessages.map(({ _id }) => _id.toString()),
                        readAt
                    });
                });
            }
        }
        const getMessagesByUserId = await messageModel.find(conversationFilter);

        return res.status(200).json(getMessagesByUserId);

    } catch (error) {
        console.error("Error in getMessageByUser:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const markMessagesRead = async (req, res) => {
    try {
        const readerId = req.user._id;
        const { id: senderId } = req.params;
        const unreadMessages = await messageModel.find({
            senderId,
            receiverId: readerId,
            readAt: null
        }).select("_id");
        if (!unreadMessages.length) return res.status(200).json({ messageIds: [] });

        const readAt = new Date();
        const updateResult = await messageModel.updateMany(
            { _id: { $in: unreadMessages.map(({ _id }) => _id) }, readAt: null },
            { $set: { readAt } }
        );
        if (updateResult.modifiedCount) {
            const senderSocketIds = getReceiverSocketIds(senderId);
            senderSocketIds?.forEach((socketId) => {
                io.to(socketId).emit("messagesRead", {
                    readerId: readerId.toString(),
                    messageIds: unreadMessages.map(({ _id }) => _id.toString()),
                    readAt
                });
            });
        }
        return res.status(200).json({ messageIds: unreadMessages.map(({ _id }) => _id.toString()), readAt });
    } catch (error) {
        console.error("Error in markMessagesRead:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const { text, image } = req.body;

        // if (!text && !image) {
        //     return res.status()
        // }

        let imageURL;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageURL = uploadResponse.secure_url;
        }

        const message = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageURL
        });

        // Emit the message to the receiver if they are online
        const receiverSocketIds = getReceiverSocketIds(receiverId);
        if (receiverSocketIds) {
            receiverSocketIds.forEach((socketId) => {
                io.to(socketId).emit("newMessage", message)
            });
        }

        return res.status(201).json(message);

    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export async function getAllChatPartners(req, res) {
    try {
        const loggedInUserId = req.user._id;

        const messages = await messageModel.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
        });

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) => {
                    return loggedInUserId.toString() === msg.senderId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                })
            )
        ];

        const chatPartners = await userModel.find({ _id: { $in: chatPartnerIds } }).select("-password");

        return res.status(200).json(chatPartners);
    }

    catch (error) {
        console.error("Error in getAllChatPartners: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteMessage(req, res) {

    try {
        const { messageId } = req.params;
        const deletedMessage = await messageModel.findOneAndDelete({ _id: messageId, senderId: req.user._id });

        if (!deletedMessage) return res.status(404).json({ message: "Message not found or unauthorized" });

        const messageDeletedEvent = {
            messageId: deletedMessage._id.toString(),
            senderId: deletedMessage.senderId.toString(),
            receiverId: deletedMessage.receiverId.toString()
        };
        const socketIds = new Set([
            ...(getReceiverSocketIds(deletedMessage.senderId.toString()) || []),
            ...(getReceiverSocketIds(deletedMessage.receiverId.toString()) || [])
        ]);
        socketIds.forEach((socketId) => {
            io.to(socketId).emit("messageDeleted", messageDeletedEvent);
        });

        return res.status(200).json({ message: "Message deleted successfully", deletedMessage });


    } catch (error) {
        console.error("Error in deleteMessage: ", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid message ID"
            });
        }

        return res.status(500).json({ error: "Internal server error" });
    }

}