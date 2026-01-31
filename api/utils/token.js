import jwt from "jsonwebtoken";
import axios from "axios";
import { createError } from "./error.js";

/**
 * VERIFY JWT TOKEN
 * Expected header format:
 * token: Bearer <JWT_TOKEN>
 */
export const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers.token;


  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return next(createError(401, "Access denied. No token provided"));
  }

  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(createError(403, "Invalid or expired token"));
    }

    req.user = decoded; // { id, isAdmin }
    next();
  });
};

/**
 * VERIFY USER (SELF OR ADMIN)
 */
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(
        createError(403, "You are not authorized to perform this action")
      );
    }
  });
};

/**
 * VERIFY ADMIN
 */
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user) {
      return next(createError(401, "Authentication required"));
    }

    if (req.user.isAdmin) {
      next();
    } else {
      return next(createError(403, "Admin access required"));
    }
  });
};


/**
 * VERIFY PAYSTACK PAYMENT
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return next(createError(400, "Payment reference is required"));
    }

    if (!process.env.PAYSTACK_SECRET) {
      return next(createError(500, "Paystack secret key not configured"));
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const paystackData = response.data;

    if (!paystackData.status) {
      return next(createError(400, "Payment verification failed"));
    }

    if (paystackData.data.status !== "success") {
      return next(createError(400, "Payment not successful"));
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: paystackData.data,
    });
  } catch (error) {
    if (error.response) {
      return next(
        createError(
          error.response.status,
          error.response.data?.message || "Payment verification error"
        )
      );
    }
    next(error);
  }
};

