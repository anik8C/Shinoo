import jwt from "jsonwebtoken";

export function generateToken(userId, res) {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });


    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httplOnly: true,    //prevent XSS attacks: cross site scripting
        sameSite: "strict",   //prevent CSRF attacks
        secure: (process.env.NODE_ENV === "production") ? true : false
    })

    return token;
}