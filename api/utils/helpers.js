import crypto from "crypto";

/**
 * Generate random alphanumeric ID
 * @param {number} length
 * @returns {string}
 */
export const generateId = (length = 12) => {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("ID length must be a positive integer");
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);

  return Array.from(bytes)
    .map((byte) => chars[byte % chars.length])
    .join("");
};

/**
 * Get all dates (timestamps) between two dates (inclusive)
 * @param {Date | string} startDate
 * @param {Date | string} endDate
 * @returns {number[]}
 */
export const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start > end) {
    throw new Error("Start date cannot be after end date");
  }

  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.getTime());
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
