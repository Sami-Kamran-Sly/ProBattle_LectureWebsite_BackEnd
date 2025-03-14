import { hashedPassword, comparePassword } from "../helper/hashPassword.js";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerController = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Name is Required" });
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is Required" });
    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password is Required" });

    if (!answer)
      return res
        .status(400)
        .json({ success: false, message: "Answer is Required" });

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "Already Registered, please login",
      });
    }

    const hashPassword = await hashedPassword(password);

    const user = await userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      answer,
    });
    // token :
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2IwOTZjNDAzYzIzYjkxNTliZDdkODQiLCJpYXQiOjE3Mzk2MjcwNjIsImV4cCI6MTc0MjIxOTA2Mn0.gpvgvNnhtmjmvP2X2jeGUVlxlklIIVEsnKruRj5Z9J4
    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email, answer, currentPassword, newPassword, confirmPassword } =
      req.body;

    // Validations
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    if (!newPassword)
      return res
        .status(400)
        .json({ success: false, message: "New password is required" });
    if (!currentPassword)
      return res
        .status(400)
        .json({ success: false, message: "Current password is required" });
    if (!answer)
      return res
        .status(400)
        .json({ success: false, message: "Security answer is required" });
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }

    // Check if user exists with the given email and security answer
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or security answer" });
    }

    // Validate current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await hashedPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
    });

    // Send response
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error); // Pass error to global error handler middleware
  }
};
