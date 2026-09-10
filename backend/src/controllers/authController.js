import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export async function signupController(req, res) {

    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (fullName.length < 3 || fullName.length > 20) {
            return res.status(400).json({ message: "FullName must be between 3 and 20 characters" });
        }

        if (password.length < 6 || password.length > 20) {
            return res.status(400).json({ message: "Password must be between 6 and 20 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const userExists = await userModel.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "Email already exists, please try logging in." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new userModel({
            fullName,
            email,
            password: hashedPassword
        });

        generateToken(user._id, res);
        await user.save();

        res.status(201).json({
            message: "User created successfully",
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function loginController(req, res) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
        message: "Login successful",
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
    });
}

export async function logoutController(req, res) {

    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successful" });

}