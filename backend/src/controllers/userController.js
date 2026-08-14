import userModel from "../models/userModel.js";
import cloudinary from "../lib/cloudinary.js";

export const updateProfilePictureController = async (req, res) => {
    try {
        const { profilePic } = req.file;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        const result = await cloudinary.uploader.upload(profilePic);

        const user = await userModel.findById(req.user._id);

        const updatedUser = await userModel.findByIdAndUpdate(user._id,
            {
                profilePic: result.secure_url
            },
            { new: true }
        ).select("-password");

        return res.status(200).json({ message: "Profile picture updated successfully", user: updatedUser });

    } catch (error) {
        console.error("Error updating profile picture:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}