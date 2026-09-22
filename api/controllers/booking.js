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
 * Create Booking
 *
 * - Validates input minimally.
 * - Checks availability for selected roomNumbers before saving.
 * - Saves booking first inside a transaction, then marks roomNumbers unavailable.
 * - Payments are flexible: method can be "cash", "transfer", "pos", "paystack", etc.
 * - Down payment (if provided) is recorded as a payment with paidAt.
 *
 * Expected req.body shape (example):
 * {
 *   firstName, lastName, email, phone, address, identity,
 *   startDate, endDate,
 *   rooms: [
 *     { roomTitle, numberOfRooms, selectedRooms: [roomNumberId,...], pricePerRoom, lineTotal }
 *   ],
 *   registeredBy,
 *   downPayment: { amount, reference, method, note, paidAt },
 *   discount: { amount, note },
 *   notes
 * }
 */
export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      identity,
      startDate,
      endDate,
      rooms = [],
      registeredBy,
      downPayment,
      discount,
      notes,
    } = req.body;

    // Basic validation
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required." });
    }
    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ success: false, message: "At least one room category is required." });
    }

    // Normalize line items
    const roomLineItems = rooms.map((r) => ({
      roomTitle: r.roomTitle ?? "Room",
      numberOfRooms: Number(r.numberOfRooms ?? (Array.isArray(r.selectedRooms) ? r.selectedRooms.length : 1)),
      selectedRooms: Array.isArray(r.selectedRooms) ? r.selectedRooms : [],
      pricePerRoom: Number(r.pricePerRoom ?? 0),
      lineTotal: Number(r.lineTotal ?? 0),
    }));

    // Totals
    const subtotal = roomLineItems.reduce((s, it) => s + (Number(it.lineTotal) || 0), 0);
    const discountAmount = Number(discount?.amount ?? 0);
    const totalPrice = Math.max(0, subtotal - discountAmount);

    // Build initial payments array (down payment optional)
    const payments = [];
    if (downPayment && Number(downPayment.amount) > 0) {
      payments.push({
        amount: Number(downPayment.amount),
        reference: downPayment.reference ?? null,
        method: downPayment.method ?? "cash",
        type: downPayment.type ?? "deposit",
        note: downPayment.note ?? null,
        paidAt: downPayment.paidAt ? new Date(downPayment.paidAt) : new Date(),
      });
    }

    const amountPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const balanceDue = Math.max(0, totalPrice - amountPaid);
    const paymentStatus = balanceDue <= 0 ? "paid" : amountPaid > 0 ? "partial" : "unpaid";

    // Prepare dates to block (ISO date strings)
    const getDatesInRange = (s, e) => {
      const start = new Date(s);
      const end = new Date(e);
      const dates = [];
      const cur = new Date(start);
      while (cur <= end) {
        dates.push(new Date(cur).toISOString().split("T")[0]);
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    };
    const datesToBlock = getDatesInRange(startDate, endDate);

    // Collect all selected roomNumber ids
    const allSelectedRoomIds = roomLineItems.flatMap((r) => r.selectedRooms || []);

    // Pre-check availability: ensure none of the selected roomNumbers already have any of the dates
    if (allSelectedRoomIds.length > 0) {
      // Query rooms that contain any of the selected roomNumbers with conflicting unavailableDates
      const conflictQuery = {
        "roomNumbers._id": { $in: allSelectedRoomIds },
        "roomNumbers.unavailableDates": { $in: datesToBlock },
      };

      const conflict = await Room.findOne(conflictQuery).lean();
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "One or more selected room numbers are no longer available for the requested dates.",
        });
      }
    }

    // Build booking document
    const booking = new Booking({
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      email: email ?? null,
      phone: phone ?? null,
      address: address ?? null,
      identity: identity ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rooms: roomLineItems,
      subtotal,
      discount: { amount: discountAmount, note: discount?.note ?? null },
      totalPrice,
      payments,
      registeredBy: registeredBy ?? "online",
      amountPaid,
      balanceDue,
      paymentStatus,
      notes: notes ?? null,
      cancelled: false,
      createdAt: new Date(),
    });

    // Use transaction to save booking and update rooms atomically when possible
    let savedBooking;
    await session.withTransaction(async () => {
      savedBooking = await booking.save({ session });

      // Only mark rooms unavailable after booking persisted
      if (allSelectedRoomIds.length > 0) {
        // Use $addToSet with $each to avoid duplicate dates
        const updates = allSelectedRoomIds.map((roomNumberId) =>
          Room.updateOne(
            { "roomNumbers._id": roomNumberId },
            { $addToSet: { "roomNumbers.$.unavailableDates": { $each: datesToBlock } } },
            { session }
          )
        );
        await Promise.all(updates);
      }
    });

    session.endSession();
    return res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) {}
    session.endSession();
    return next(err);
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
/**
 * GET MONTHLY INCOME (Unified for old + new schema)
 */
export const getIncome = async (req, res, next) => {
  try {
    // Build payment events: legacy -> single event { amount: price, paidAt: createdAt }
    // new -> map payments[] to events (refunds negative), using paidAt (fallback to createdAt)
    const pipeline = [
      { $match: { cancelled: false } },
      {
        $addFields: {
          paymentEvents: {
            $cond: {
              // legacy if rooms is not an array
              if: { $not: [{ $isArray: "$rooms" }] },
              then: [{ amount: { $ifNull: ["$price", 0] }, paidAt: "$createdAt" }],
              else: {
                $map: {
                  input: { $ifNull: ["$payments", []] },
                  as: "p",
                  in: {
                    amount: {
                      $cond: [
                        { $eq: ["$$p.type", "refund"] },
                        { $multiply: ["$$p.amount", -1] },
                        { $ifNull: ["$$p.amount", 0] }
                      ]
                    },
                    paidAt: { $ifNull: ["$$p.paidAt", "$createdAt"] }
                  }
                }
              }
            }
          }
        }
      },
      { $unwind: "$paymentEvents" },
      {
        $group: {
          _id: { year: { $year: "$paymentEvents.paidAt" }, month: { $month: "$paymentEvents.paidAt" } },
          totalCollected: { $sum: "$paymentEvents.amount" },
          countPayments: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ];

    const income = await Booking.aggregate(pipeline);

    // Return monthly collected totals (legacy price events included)
    res.status(200).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};


/**
 * GET YEARLY INCOME (Unified for old + new schema)
 */
export const getYearlyIncome = async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { cancelled: false } },
      {
        $addFields: {
          paymentEvents: {
            $cond: {
              if: { $not: [{ $isArray: "$rooms" }] },
              then: [{ amount: { $ifNull: ["$price", 0] }, paidAt: "$createdAt" }],
              else: {
                $map: {
                  input: { $ifNull: ["$payments", []] },
                  as: "p",
                  in: {
                    amount: {
                      $cond: [
                        { $eq: ["$$p.type", "refund"] },
                        { $multiply: ["$$p.amount", -1] },
                        { $ifNull: ["$$p.amount", 0] }
                      ]
                    },
                    paidAt: { $ifNull: ["$$p.paidAt", "$createdAt"] }
                  }
                }
              }
            }
          }
        }
      },
      { $unwind: "$paymentEvents" },
      {
        $group: {
          _id: { year: { $year: "$paymentEvents.paidAt" } },
          totalCollected: { $sum: "$paymentEvents.amount" },
          countPayments: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1 } }
    ];

    const income = await Booking.aggregate(pipeline);

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
/**
 * GET ALL CUSTOMERS (deduplicated by phone)
 * Works across old + new schema formats.
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Booking.aggregate([
      // Only non-cancelled bookings (support both old + new flags)
      { $match: { cancelled: { $ne: true }, status: { $ne: "cancelled" } } },

      // Sort by latest booking first so $first picks the most recent data
      { $sort: { createdAt: -1 } },

      // Group by normalized phone
      {
        $group: {
          _id: {
            phone: {
              $trim: {
                input: { $replaceAll: { input: "$phone", find: " ", replacement: "" } }
              }
            }
          },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          phone: { $first: "$phone" },
          email: { $first: "$email" },
          address: { $first: "$address" },
          totalBookings: { $sum: 1 },
          // Use totalPrice if present, otherwise fallback to price
          totalSpent: {
            $sum: {
              $cond: [
                { $ifNull: ["$totalPrice", false] },
                "$totalPrice",
                "$price",
              ],
            },
          },
          // Use amountPaid if present, otherwise fallback to price
          totalPaid: {
            $sum: {
              $cond: [
                { $ifNull: ["$amountPaid", false] },
                "$amountPaid",
                "$price",
              ],
            },
          },
          lastBooking: { $first: "$createdAt" },
        },
      },

      // Build clean output shape
      {
        $project: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          phone: 1,
          email: 1,
          address: 1,
          totalBookings: 1,
          totalSpent: 1,
          totalPaid: 1,
          lastBooking: 1,
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
