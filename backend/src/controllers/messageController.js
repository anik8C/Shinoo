import cloudinary from "../lib/cloudinary.js";
import messageModel from "../models/messageModel.js"
import userModel from "../models/userModel.js"


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
        const getMessagesByUserId = await messageModel.find({
            $or:
                [
                    { senderId: myId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: myId }
                ]
        })

        return res.status(200).json(getMessagesByUserId);

    } catch (error) {
        console.error("Error in getMessageByUser:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const { text, image } = req.body;

        // if (!text && !image) {
        //     return res.status()wwwwwwronqeeeeeeeeeeeee
        // }

        let imageURL;
        if (image) {
            imageURL = await cloudinary.uploader.upload(image).secure_url;
        }

        const message = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageURL
        });

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