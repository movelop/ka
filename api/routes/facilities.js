import express from "express";

import {
  createFacility,
  updateFacility,
  deleteFacility,
  getFacility,
  getAllFacilities,
} from "../controllers/facilities.js";

import { verifyAdmin } from "../utils/token.js";

const router = express.Router();

/**
 * FACILITIES
 */

// Create facility (admin)
router.post("/", verifyAdmin, createFacility);

// Get all facilities (public)
router.get("/", getAllFacilities);

// Get single facility by ID (public)
router.get("/:id", getFacility);

// Update facility (admin)
router.put("/:id", verifyAdmin, updateFacility);

// Delete facility (admin)
router.delete("/:id", verifyAdmin, deleteFacility);

export default router;
