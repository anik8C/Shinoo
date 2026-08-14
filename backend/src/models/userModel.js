import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    profilePic: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const userModel = mongoose.model("User", userSchema);
export default userModel;