import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";

/**
 * UPDATE USER (SELF OR ADMIN)
 */
export const updateUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid user ID"));
    }

    // Prevent role escalation
    if ("isAdmin" in req.body) {
      return next(createError(403, "You cannot change admin status"));
    }

    // Hash password if being updated
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, select: "-password" }
    );

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE USER (SELF OR ADMIN)
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid user ID"));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE USER (SELF OR ADMIN)
 */
export const getUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid user ID"));
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL USERS (ADMIN)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};
