import Room from "../models/Room.js";
import mongoose from "mongoose";
import { createError } from "../utils/error.js";

/**
 * CREATE ROOM (ADMIN)
 */
export const createRoom = async (req, res, next) => {
  try {
    const {
      title,
      price,
      maxPeople,
      size,
      bedding,
      description,
      roomNumbers,
    } = req.body;

    if (!title || !price || !maxPeople || !size || !bedding || !description) {
      return next(createError(400, "Missing required room fields"));
    }

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ROOM AVAILABILITY (BOOK – PUBLIC)
 */
export const updateRoomAvailability = async (req, res, next) => {
  try {
    const { dates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid room number ID"));
    }

    if (!Array.isArray(dates) || !dates.length) {
      return next(createError(400, "Dates array is required"));
    }

    const room = await Room.findOne({ "roomNumbers._id": req.params.id });

    if (!room) {
      return next(createError(404, "Room not found"));
    }

    const roomNumber = room.roomNumbers.find(
      (r) => r._id.toString() === req.params.id
    );

    const alreadyBooked = dates.some((date) =>
      roomNumber.unavailableDates.some(
        (d) => new Date(d).getTime() === new Date(date).getTime()
      )
    );

    if (alreadyBooked) {
      return next(createError(409, "One or more dates already booked"));
    }

    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $push: {
          "roomNumbers.$.unavailableDates": { $each: dates },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Room booked successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CANCEL ROOM RESERVATION (UNBOOK – PUBLIC)
 */
export const cancelRoomReservation = async (req, res, next) => {
  try {
    const { dates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid room number ID"));
    }

    if (!Array.isArray(dates) || !dates.length) {
      return next(createError(400, "Dates array is required"));
    }

    const room = await Room.findOne({ "roomNumbers._id": req.params.id });

    if (!room) {
      return next(createError(404, "Room not found"));
    }

    const roomNumber = room.roomNumbers.find(
      (r) => r._id.toString() === req.params.id
    );

    const removableDates = roomNumber.unavailableDates.filter((d) =>
      dates.some(
        (date) => new Date(date).getTime() === new Date(d).getTime()
      )
    );

    if (!removableDates.length) {
      return next(
        createError(400, "None of the selected dates are reserved")
      );
    }

    await Room.updateOne(
      { "roomNumbers._id": req.params.id },
      {
        $pull: {
          "roomNumbers.$.unavailableDates": { $in: removableDates },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Room reservation cancelled",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ROOM DETAILS (ADMIN)
 */
export const updateRoom = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid room ID"));
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!room) {
      return next(createError(404, "Room not found"));
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ROOM (ADMIN)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid room ID"));
    }

    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return next(createError(404, "Room not found"));
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE ROOM (PUBLIC)
 */
export const getRoom = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(createError(400, "Invalid room ID"));
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return next(createError(404, "Room not found"));
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL ROOMS (PUBLIC)
 */
export const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ price: 1 });

    res.status(200).json({
      success: true,
      total: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};
