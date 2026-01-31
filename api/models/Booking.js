import mongoose from "mongoose";

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

    roomTitle: {
      type: String,
      required: true,
      trim: true,
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

    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedRooms: {
      type: [String],
      default: [],
    },

    roomNumbers: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

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

    identity: {
      type: String,
      trim: true,
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
    registeredBy: {
      type: String,
      trim: true,
      index: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * INDEXES
 */
BookingSchema.index({ email: 1, startDate: -1 });
BookingSchema.index({ createdAt: -1 });

export default mongoose.model("Booking", BookingSchema);
