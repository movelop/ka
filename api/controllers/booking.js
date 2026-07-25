import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import { generateId, getDatesInRange } from "../utils/helpers.js";
import { createError } from "../utils/error.js";
import mongoose from "mongoose";

/**
 * Build + validate the `rooms` line items sent from the client.
 * Expects: rooms = [{ roomTitle, numberOfRooms, selectedRooms, roomNumbers, pricePerRoom }]
 */
const buildRoomLineItems = (rooms) => {
  if (!Array.isArray(rooms) || !rooms.length) {
    throw createError(400, "At least one room category must be selected");
  }

  return rooms.map((r, i) => {
    const { roomTitle, numberOfRooms, selectedRooms, roomNumbers, pricePerRoom } = r;

    if (!roomTitle || !numberOfRooms || !selectedRooms?.length || pricePerRoom == null) {
      throw createError(400, `Missing fields in room selection #${i + 1}`);
    }

    if (selectedRooms.length !== Number(numberOfRooms)) {
      throw createError(
        400,
        `Room selection #${i + 1}: numberOfRooms (${numberOfRooms}) does not match selectedRooms count (${selectedRooms.length})`
      );
    }

    return {
      roomTitle,
      numberOfRooms: Number(numberOfRooms),
      selectedRooms,
      roomNumbers: roomNumbers || [],
      pricePerRoom: Number(pricePerRoom),
      lineTotal: Number(pricePerRoom) * Number(numberOfRooms),
    };
  });
};

/**
 * CREATE BOOKING (PUBLIC)
 * Now accepts multiple room categories in one reservation, an optional
 * discount, and an optional down payment made at booking time.
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      identity,
      rooms, // [{ roomTitle, numberOfRooms, selectedRooms, roomNumbers, pricePerRoom }]
      startDate,
      endDate,
      adults,
      children,
      registeredBy,
      address,
      discount, // optional: { type: 'percentage' | 'fixed', value, reason, approvedBy }
      downPayment, // optional: { amount, reference, method }
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !identity ||
      !startDate ||
      !endDate
    ) {
      return next(createError(400, "Missing required booking fields"));
    }

    const roomLineItems = buildRoomLineItems(rooms);

    // Generate unique confirmation code
    let confirmation;
    const existingCodes = await Booking.distinct("confirmation");
    do {
      confirmation = generateId(12);
    } while (existingCodes.includes(confirmation));

    // Convert dates to timestamps
    const dates = getDatesInRange(startDate, endDate);

    // Flatten selectedRooms across every category to reserve availability
    const allSelectedRoomIds = roomLineItems.flatMap((r) => r.selectedRooms);

    await Promise.all(
      allSelectedRoomIds.map((roomNumberId) =>
        Room.updateOne(
          { "roomNumbers._id": roomNumberId },
          { $push: { "roomNumbers.$.unavailableDates": { $each: dates } } }
        )
      )
    );

    // Build the booking document, then use .save() (not .create() with
    // pre-computed totals) so the pre-save hook derives subtotal,
    // discount.amount, totalPrice, amountPaid, balanceDue & paymentStatus.
    const booking = new Booking({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone,
      identity,
      rooms: roomLineItems,
      startDate,
      endDate,
      adults,
      children,
      confirmation,
      registeredBy,
      address,
      discount: discount?.type
        ? {
            type: discount.type,
            value: Number(discount.value) || 0,
            reason: discount.reason,
            approvedBy: discount.approvedBy,
          }
        : undefined,
      payments: downPayment?.amount
        ? [
            {
              amount: Number(downPayment.amount),
              reference: downPayment.reference,
              method: downPayment.method || "paystack",
              type: "deposit",
            },
          ]
        : [],
      paymentReference: downPayment?.reference,
    });

    await booking.save();

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * ADD PAYMENT (settle balance, or record any further payment against a booking)
 * PUBLIC/ADMIN — e.g. guest pays the remaining balance at check-in/checkout,
 * or admin logs a cash payment.
 */
export const addPayment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    const { amount, reference, method, type, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return next(createError(400, "Payment amount must be greater than 0"));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));
    if (booking.cancelled) return next(createError(400, "Cannot add payment to a cancelled booking"));

    if (type !== "refund" && Number(amount) > booking.balanceDue) {
      return next(
        createError(
          400,
          `Payment of ${amount} exceeds outstanding balance of ${booking.balanceDue}`
        )
      );
    }

    booking.payments.push({
      amount: Number(amount),
      reference,
      method: method || "paystack",
      type: type || "balance",
      note,
    });

    // Keep the headline paymentReference pointing at the latest reference
    if (reference) booking.paymentReference = reference;

    await booking.save(); // pre-save hook recalculates amountPaid/balanceDue/paymentStatus

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE / EDIT DISCOUNT (ADMIN)
 * Separate from generic updateBooking because it must go through .save()
 * for the derived totals to recompute.
 */
export const updateDiscount = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    const { type, value, reason, approvedBy } = req.body;

    if (type && !["none", "percentage", "fixed"].includes(type)) {
      return next(createError(400, "Invalid discount type"));
    }
    if (type === "percentage" && (value < 0 || value > 100)) {
      return next(createError(400, "Percentage discount must be between 0 and 100"));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));

    booking.discount = {
      type: type || "none",
      value: Number(value) || 0,
      reason,
      approvedBy,
    };

    await booking.save(); // recomputes discount.amount, totalPrice, balanceDue, paymentStatus

    res.status(200).json({ success: true, booking });
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
 * For general, non-pricing fields (guest details, dates, status flags etc).
 * Pricing-affecting changes (rooms, discount, payments) should go through
 * addPayment / updateDiscount, or a dedicated endpoint if room composition
 * itself needs to change — those all use .save() so totals stay correct.
 */
export const updateBooking = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return next(createError(400, "Invalid booking ID"));

    // Strip out fields with derived/computed totals — these must never be
    // set directly through a blanket update.
    const {
      subtotal,
      totalPrice,
      amountPaid,
      balanceDue,
      paymentStatus,
      payments,
      discount,
      rooms,
      ...safeUpdates
    } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(createError(404, "Booking not found"));

    Object.assign(booking, safeUpdates);

    // Allow replacing room composition through this endpoint too, if sent —
    // recomputed line totals still flow through the pre-save hook.
    if (rooms) {
      booking.rooms = buildRoomLineItems(rooms);
    }

    await booking.save();

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

    // FREE ROOM AVAILABILITY across every category in the booking
    const allSelectedRoomIds = booking.rooms.flatMap((r) => r.selectedRooms);

    await Promise.all(
      allSelectedRoomIds.map((roomNumberId) =>
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
 * Reports both invoiced revenue (totalPrice, after discount) and cash
 * actually collected (amountPaid) — these can diverge now that partial /
 * down payments exist.
 */
export const getIncome = async (req, res, next) => {
  try {
    const income = await Booking.aggregate([
      { $match: { cancelled: false } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$totalPrice" },
          totalCollected: { $sum: "$amountPaid" },
          totalOutstanding: { $sum: "$balanceDue" },
          totalDiscountGiven: { $sum: "$discount.amount" },
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
          totalRevenue: { $sum: "$totalPrice" },
          totalCollected: { $sum: "$amountPaid" },
          totalOutstanding: { $sum: "$balanceDue" },
          totalDiscountGiven: { $sum: "$discount.amount" },
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

/**
 * GET BOOKINGS WITH OUTSTANDING BALANCE (ADMIN)
 * Useful new view now that down payments/partial payments exist.
 */
export const getOutstandingBalances = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      cancelled: false,
      paymentStatus: { $in: ["unpaid", "partial"] },
    }).sort({ startDate: 1 });

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
 * GET ALL CUSTOMERS (deduplicated by phone)
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Booking.aggregate([
      // Only non-cancelled bookings
      { $match: { cancelled: false } },

      // Sort by latest booking first so $first picks the most recent data
      { $sort: { createdAt: -1 } },

      // Group by phone — collate name, address, email from latest booking
      {
        $group: {
          _id: {
            // Normalize phone: strip spaces/dashes for dedup comparison
            phone: {
              $trim: {
                input: { $replaceAll: { input: "$phone", find: " ", replacement: "" } }
              }
            }
          },
          firstName:    { $first: "$firstName" },
          lastName:     { $first: "$lastName" },
          phone:        { $first: "$phone" },
          email:        { $first: "$email" },
          address:      { $first: "$address" },
          totalBookings: { $sum: 1 },
          totalSpent:   { $sum: "$totalPrice" },
          totalPaid:    { $sum: "$amountPaid" },
          lastBooking:  { $first: "$createdAt" },
        },
      },

      // Build clean output shape
      {
        $project: {
          _id: 0,
          firstName:     1,
          lastName:      1,
          phone:         1,
          email:         1,
          address:       1,
          totalBookings: 1,
          totalSpent:    1,
          totalPaid:     1,
          lastBooking:   1,
          fullName: {
            $concat: ["$firstName", " ", { $ifNull: ["$lastName", ""] }]
          },
        },
      },

      // Sort alphabetically by first name
      { $sort: { firstName: 1 } },
    ]);

    res.status(200).json({
      success: true,
      total: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};