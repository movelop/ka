import mongoose from "mongoose";

/**
 * One line item per room CATEGORY selected within a single booking.
 * e.g. a guest can book 2x "Deluxe" + 1x "Executive" in one reservation.
 */
const RoomSelectionSchema = new mongoose.Schema(
  {
    roomTitle: {
      type: String,
      required: true,
      trim: true,
    },
    // roomNumbers._id refs (Room subdocument ids) reserved for this category
    selectedRooms: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one room must be selected per category",
      },
    },
    // Human-readable room numbers, e.g. ["101", "102"]
    roomNumbers: {
      type: [String],
      default: [],
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    // Price per single room for the whole stay (nightly rate x nights, or flat — however pricing is computed upstream)
    pricePerRoom: {
      type: Number,
      required: true,
      min: 0,
    },
    // pricePerRoom * numberOfRooms
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Individual payment events against a booking — supports a down payment
 * at reservation time followed by one or more later settlements.
 */
const PaymentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      trim: true,
      default: "paystack",
    },
    type: {
      type: String,
      enum: ["deposit", "balance", "full", "refund"],
      default: "deposit",
    },
    note: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    identity: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // One or more room categories in this single reservation
    rooms: {
      type: [RoomSelectionSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one room category must be selected",
      },
    },

    adults: {
      type: Number,
      required: true,
      min: 1,
    },

    children: {
      type: Number,
      default: 0,
      min: 0,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    // ---- Pricing ----

    // Sum of rooms[].lineTotal, before discount
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: {
        type: String,
        enum: ["none", "percentage", "fixed"],
        default: "none",
      },
      value: {
        // percentage points (0-100) OR a flat naira amount, depending on `type`
        type: Number,
        default: 0,
        min: 0,
      },
      amount: {
        // computed naira amount actually deducted — always derived, never set directly by clients
        type: Number,
        default: 0,
        min: 0,
      },
      reason: {
        type: String,
        trim: true,
      },
      approvedBy: {
        type: String,
        trim: true,
      },
    },

    // subtotal - discount.amount — the amount the guest actually owes in total
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // ---- Payments / down payment tracking ----

    payments: {
      type: [PaymentSchema],
      default: [],
    },

    // Sum of payments[].amount (excluding refunds)
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // totalPrice - amountPaid, floored at 0
    balanceDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
      index: true,
    },

    // Kept for the initial/most recent Paystack reference used at checkout time
    paymentReference: {
      type: String,
      trim: true,
      index: true,
    },

    confirmation: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    registeredBy: {
      type: String,
      trim: true,
      index: true,
    },

    cancelled: {
      type: Boolean,
      default: false,
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkedOut: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Keep subtotal / totalPrice / amountPaid / balanceDue / paymentStatus
 * internally consistent any time a booking is saved via .save() —
 * whether it's a brand-new booking, a new payment being pushed, or a
 * discount being edited.
 *
 * Runs on "validate" rather than "save": subtotal/totalPrice are `required`
 * fields, and Mongoose runs schema validation BEFORE save hooks — so a
 * pre("save") hook would be too late to satisfy `required` on a brand-new
 * document. pre("validate") runs first, computing these fields in time.
 *
 * NOTE: this hook only runs on .save() (both `new Booking().save()` and
 * `doc.save()` after a fetch trigger validate/save). Controllers that need
 * these derived fields recomputed MUST fetch + mutate + save() rather than
 * using findByIdAndUpdate(), which bypasses document middleware entirely.
 */
BookingSchema.pre("validate", function () {
  // Recompute subtotal from room line items
  this.subtotal = this.rooms.reduce((sum, r) => sum + r.lineTotal, 0);

  // Recompute discount amount from subtotal + discount type/value
  const { type, value } = this.discount || {};
  let discountAmount = 0;
  if (type === "percentage") {
    discountAmount = (this.subtotal * (value || 0)) / 100;
  } else if (type === "fixed") {
    discountAmount = value || 0;
  }
  // Never let a discount exceed the subtotal
  discountAmount = Math.min(discountAmount, this.subtotal);
  this.discount.amount = Math.round(discountAmount * 100) / 100;

  this.totalPrice = Math.round((this.subtotal - this.discount.amount) * 100) / 100;

  // Recompute payment totals (refunds subtract from amountPaid)
  this.amountPaid = this.payments.reduce((sum, p) => {
    return p.type === "refund" ? sum - p.amount : sum + p.amount;
  }, 0);
  this.amountPaid = Math.max(0, Math.round(this.amountPaid * 100) / 100);

  this.balanceDue = Math.max(0, Math.round((this.totalPrice - this.amountPaid) * 100) / 100);

  if (this.amountPaid <= 0) {
    this.paymentStatus = "unpaid";
  } else if (this.amountPaid >= this.totalPrice) {
    this.paymentStatus = "paid";
  } else {
    this.paymentStatus = "partial";
  }

  // No next() call: this hook is fully synchronous (pure computation, no
  // async work), and declaring a `next` parameter here made Mongoose treat
  // it as callback-style — which, on this Mongoose version, doesn't
  // actually receive a real callback, causing "next is not a function".
  // A zero-argument function completes automatically when it returns.
});

/**
 * INDEXES
 */
BookingSchema.index({ email: 1, startDate: -1 });
BookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", BookingSchema);