import express from "express";
import { register, login } from "../controllers/auth.js";

const router = express.Router();

/**
 * AUTHENTICATION
 */

// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

export default router;
