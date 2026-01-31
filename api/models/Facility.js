import mongoose from "mongoose";

const FacilitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      index: true, // ✅ keep this
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Facility", FacilitySchema);
