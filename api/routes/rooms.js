import express from "express";

import {
  createRoom,
  updateRoomAvailability,
  cancelRoomReservation,
  updateRoom,
  deleteRoom,
  getRoom,
  getAllRooms,
} from "../controllers/rooms.js";

import { verifyAdmin } from "../utils/token.js";

const router = express.Router();

/**
 * ROOMS
 */

// Create room (admin)
router.post("/", verifyAdmin, createRoom);

// Get all rooms (public)
router.get("/", getAllRooms);

// Update room availability (public – after booking)
router.put("/availability/:id", updateRoomAvailability);

// Cancel room reservation (public – with verification)
router.put("/availability/:id/cancel", cancelRoomReservation);

// Update room details (admin)
router.put("/:id", verifyAdmin, updateRoom);

// Delete room (admin)
router.delete("/:id", verifyAdmin, deleteRoom);

// Get single room (public) — MUST BE LAST
router.get("/:id", getRoom);

export default router;
