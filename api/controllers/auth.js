import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

/**
 * REGISTER USER
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(createError(400, "All required fields must be provided"));
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(
        createError(409, "User with this email or username already exists")
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN USER
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(createError(400, "Username and password are required"));
    }

    const user = await User.findOne({
      $or: [{ email: username }, { username }],
    }).select("+password"); // important because password is select:false

    if (!user) {
      return next(createError(404, "Invalid username or password"));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(createError(400, "Invalid username or password"));
    }

    if (!process.env.JWT_SECRET) {
      return next(createError(500, "JWT secret not configured"));
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};
