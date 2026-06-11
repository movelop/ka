import express from "express";

import {
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getAllBookings,
  getBooking,
  getSingleBooking,
  getLatestBookings,
  getIncome,
  getYearlyIncome,
  getCustomers
} from "../controllers/booking.js";

import { verifyAdmin, verifyPayment } from "../utils/token.js";

const router = express.Router();

/**
 * PAYMENTS
 * (Static routes first)
 */
router.get("/verify-payment/:reference", verifyPayment);

/**
 * INCOME / ANALYTICS
 */
router.get("/income/month", verifyAdmin, getIncome);
router.get("/income/year", verifyAdmin, getYearlyIncome);

/**
 * BOOKINGS
 */

// Create booking (public)
router.post("/", createBooking);

// Search booking by email or confirmation (public)
router.post("/search", getBooking);

// Get all bookings (admin)
router.get("/", verifyAdmin, getAllBookings);

// Get latest bookings (admin)
router.get("/latest", verifyAdmin, getLatestBookings);

// add alongside your other booking routes
router.get("/customers", verifyAdmin, getCustomers);

// Update booking (admin)
router.put("/:id", verifyAdmin, updateBooking);

// Cancel booking (admin)
router.put("/:id/cancel", cancelBooking);

// Delete booking (admin)
router.delete("/:id", verifyAdmin, deleteBooking);

// Get single booking by ID (admin) — MUST BE LAST
router.get("/:id", verifyAdmin, getSingleBooking);


export default router;
