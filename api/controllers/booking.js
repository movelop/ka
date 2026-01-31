import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { generateId, getDatesInRange } from "../utils/helpers.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

/**
 * CREATE BOOKING (PUBLIC)
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      identity,
      roomTitle,
      startDate,
      endDate,
      price,
      numberOfRooms,
      selectedRooms, // _id of selected roomNumbers
      roomNumbers, // room numbers (strings)
      adults,
      children,
      paymentReference,
      registeredBy
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !identity ||
      !roomTitle ||
      !startDate ||
      !endDate ||
      !price ||
      !selectedRooms?.length
    ) {
      return next(createError(400, "Missing required booking fields"));
    }

    // Generate unique confirmation code
    let confirmation;
    const existingCodes = await Booking.distinct("confirmation");
    do {
      confirmation = generateId(12);
    } while (existingCodes.includes(confirmation));

    // Convert dates to timestamps
    const dates = getDatesInRange(startDate, endDate);

    // Reserve room availability
    await Promise.all(
      selectedRooms.map((roomNumberId) =>
        Room.updateOne(
          { "roomNumbers._id": roomNumberId },
          { $push: { "roomNumbers.$.unavailableDates": { $each: dates } } }
        )
      )
    );

    // Create booking
    const booking = await Booking.create({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone,
      identity,
      roomTitle,
      startDate,
      endDate,
      price,
      numberOfRooms,
      selectedRooms,
      roomNumbers,
      adults,
      children,
      paymentReference,
      confirmation,
      registeredBy,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * SEARCH BOOKING (PUBLIC)
 */
export const getBooking = async (req, res, next) => {
  try {
    let { email, confirmation } = req.body;

    if (!email && !confirmation) {
      return next(createError(400, "Provide email or confirmation code"));
    }

    const query = { cancelled: false };

    if (confirmation) {
      query.confirmation = confirmation.trim().toUpperCase();
    }

    if (email) {
      query.email = email.trim().toLowerCase();
    }

    const bookings = await Booking.find(query).sort({ startDate: -1 });

    if (!bookings.length) {
      return next(createError(404, "Booking not found"));
    }

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET SINGLE BOOKING (ADMIN)
 */
export const getSingleBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE BOOKING (ADMIN)
 */
export const updateBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    const booking = await Booking.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!booking) return next(createError(404, "Booking not found"));

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * CANCEL BOOKING (PUBLIC)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));

    if (booking.cancelled)
      return next(createError(400, "Booking already cancelled"));

    const dates = getDatesInRange(booking.startDate, booking.endDate);

    // FREE ROOM AVAILABILITY
    await Promise.all(
      booking.selectedRooms.map((roomNumberId) =>
        Room.updateOne(
          { "roomNumbers._id": roomNumberId },
          {
            $pull: {
              "roomNumbers.$.unavailableDates": { $in: dates },
            },
          }
        )
      )
    );

    booking.cancelled = true;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled and rooms freed successfully",
    });
  } catch (error) {
    next(error);
  }
};


/**
 * DELETE BOOKING (ADMIN)
 */
export const deleteBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));

    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL BOOKINGS
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET LATEST BOOKINGS (ADMIN)
 */
export const getLatestBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MONTHLY INCOME (ADMIN)
 */
export const getIncome = async (req, res, next) => {
  try {
    const income = await Booking.aggregate([
      { $match: { cancelled: false } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    res.status(200).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

/**
 * GET YEARLY INCOME (ADMIN)
 */
export const getYearlyIncome = async (req, res, next) => {
  try {
    const income = await Booking.aggregate([
      { $match: { cancelled: false } },
      {
        $group: {
          _id: { $year: "$createdAt" },
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};
