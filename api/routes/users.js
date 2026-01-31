import express from "express";

import {
  updateUser,
  deleteUser,
  getAllUsers,
  getUser,
} from "../controllers/users.js";

import { verifyUser, verifyAdmin } from "../utils/token.js";

const router = express.Router();

/**
 * USERS
 */

// Get all users (admin)
router.get("/", verifyAdmin, getAllUsers);

// Get single user (self or admin)
router.get("/:id", verifyUser, getUser);

// Update user (self or admin)
router.put("/:id", verifyUser, updateUser);

// Delete user (self or admin)
router.delete("/:id", verifyUser, deleteUser);

export default router;
