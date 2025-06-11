import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js";

const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Route for user login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User doesn't exist" });
        }

        // Compare password
        const isMatchedPassword = await bcrypt.compare(password, user.password);
        if (!isMatchedPassword) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Issue JWT token
        const token = createToken(user._id);

        // Send via HTTP-only cookie
        res.cookie("user_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({ success: true, user: user._id, message: "Successfully LoggedIn" });

    } catch (error) {
        console.error("User Login error:", error);
        return res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
    }
};


// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email' });
        }

        if (!validator.isStrongPassword(password)) {
            return res.status(400).json({ success: false, message: 'Please enter a strong password' });
        }

        // Check for existing user
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();

        // Generate token
        const token = createToken(user._id);

        // Send via HTTP-only cookie
        res.cookie("user_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });


        return res.status(200).json({ success: true, user: user._id, message: "Registration Success" });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};

const getUserData = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({
        success: true,
        message: "User is authenticated",
        user: req.user._id,
    });
};

const userLogout = (req, res) => {
    res.clearCookie("user_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export { userLogin, registerUser, getUserData, userLogout };