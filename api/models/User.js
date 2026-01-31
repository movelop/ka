import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true, // ✅ single-field index
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true, // ✅ single-field index
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 never return password by default
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema);
