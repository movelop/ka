import Facility from "../models/Facility.js";
import mongoose from "mongoose";
import { createError } from "../utils/error.js";

/**
 * CREATE FACILITY (ADMIN)
 */
export const createFacility = async (req, res, next) => {
  try {
    const { title, image } = req.body;

    console.log({ title, image });

    if (!title || !image) {
      return next(createError(400, "Title and image are required"));
    }

    const facility = await Facility.create({ title, image });

    res.status(201).json({
      success: true,
      facility,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * UPDATE FACILITY (ADMIN)
 */
export const updateFacility = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid facility ID"));
    }

    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!facility) {
      return next(createError(404, "Facility not found"));
    }

    res.status(200).json({
      success: true,
      facility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE FACILITY (ADMIN)
 */
export const deleteFacility = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid facility ID"));
    }

    const facility = await Facility.findByIdAndDelete(req.params.id);

    if (!facility) {
      return next(createError(404, "Facility not found"));
    }

    res.status(200).json({
      success: true,
      message: "Facility deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE FACILITY (PUBLIC)
 */
export const getFacility = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid facility ID"));
    }

    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return next(createError(404, "Facility not found"));
    }

    res.status(200).json({
      success: true,
      facility,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL FACILITIES (PUBLIC)
 */
export const getAllFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: facilities.length,
      facilities,
    });
  } catch (error) {
    next(error);
  }
};
