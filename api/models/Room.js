import mongoose from "mongoose";

const RoomNumberSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true,
    },

    unavailableDates: {
      type: [Date],
      default: [],
    },
  },
  { _id: true }
);

const RoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      index: true, // ✅ keep
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true, // ✅ keep
    },

    images: {
      type: [String],
      default: [],
    },

    maxPeople: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      required: true,
      trim: true,
    },

    bedding: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    roomNumbers: {
      type: [RoomNumberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Room", RoomSchema);
