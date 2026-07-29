import React, { useEffect, useState, useContext } from "react";
import api from "../hooks/api";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { bookingInputs } from "../Data/formsource";
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../context/AuthContextProvider";
import { useStateContext } from "../context/ContextProvider";

// NOTE: assumes each room category document exposes a nightly `price` field
// and a `roomNumbers` array — same shape as everywhere else in the app.
const PRICE_FIELD = "price";

let extraCategoryKey = 0;

const NewBooking = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === "Dark";

  const c = {
    bg:      isDark ? "#2d3139" : "#ffffff",
    border:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#f3f4f6" : "#1f2937",
    muted:   isDark ? "#9ca3af" : "#6b7280",
    inputBg: isDark ? "#383c44" : "#f9fafb",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    summary: isDark ? "#383c44" : "#f8fafc",
  };

  const [info, setInfo]                               = useState({});
  const [dates, setDates]                             = useState([{
    startDate: new Date(),
    endDate:   new Date(new Date().getTime() + 86400000),
    key:       "selection",
  }]);
  const [options, setOptions]                         = useState({ adults: 1, children: 0, rooms: 1 });
  const [rooms, setRooms]                             = useState([]);
  const [room, setRoom]                               = useState(null);
  const [selectedRooms, setSelectedRooms]             = useState([]);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
  const [checkedIn, setCheckedIn]                     = useState(false);
  const [datePickerOpen, setDatePickerOpen]           = useState(false);
  const [error, setError]                             = useState(false);
  const [msg, setMsg]                                 = useState("");
  const [isProcessing, setIsProcessing]               = useState(false);

  // Extra room categories added to this single booking. Each entry:
  // { key, roomId, roomData, quantity, selectedRooms, selectedRoomNumbers }
  const [extraCategories, setExtraCategories]         = useState([]);

  // Admin-only discount
  const [discount, setDiscount]                       = useState({ type: "none", value: "", reason: "" });

  // Admin-only down payment — defaults to fully paid; toggle off to record a partial deposit
  const [fullyPaid, setFullyPaid]                     = useState(true);
  const [amountPaidInput, setAmountPaidInput]         = useState("");

  const { data } = useFetch("/rooms");

  useEffect(() => { if (data?.rooms) setRooms(data.rooms); }, [data]);
  useEffect(() => { if (error) toast.error(msg); }, [error, msg]);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate), end = new Date(endDate);
    const list = [];
    let current = new Date(start);
    while (current <= end) {
      list.push(new Date(current).getTime());
      current.setDate(current.getDate() + 1);
    }
    return list;
  };

  const handleChange     = (e) => setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleDateChange = (item) => setDates([{
    startDate: item.selection.startDate,
    endDate:   item.selection.endDate,
    key:       "selection",
  }]);
  const handleRoomSelect = (e) => {
    const selected = rooms.find((r) => r._id === e.target.value);
    setRoom(selected); setSelectedRooms([]); setSelectedRoomNumbers([]);
  };
  // Rooms needs a much higher ceiling than adults/children — a booking can
// reasonably span far more than 5 rooms, unlike guest counts.
const MAX_QUANTITIES = { adults: 20, children: 10, rooms: 12 };
const updateQuantity = (field, value) =>
    setOptions((prev) => ({ ...prev, [field]: Math.min(Math.max(prev[field] + value, 0), MAX_QUANTITIES[field]) }));
  const handleRoomNumberSelect = (e) => {
    const { checked, value, name } = e.target;
    setSelectedRooms((prev)       => checked ? [...prev, value] : prev.filter((id) => id !== value));
    setSelectedRoomNumbers((prev) => checked ? [...prev, name]  : prev.filter((n)  => n  !== name));
  };

  const isRoomAvailable = (roomNumber) => {
    const startTime    = dates[0].startDate.getTime();
    const endTime      = dates[0].endDate.getTime();
    const endtimeNoon  = new Date(endTime).setHours(12, 0, 0, 0);
    const endDateNoon  = new Date(endtimeNoon).getTime();

    const unavailable = roomNumber.unavailableDates.map((d) => {
      const unavailableTime = new Date(d).getTime();
      return new Date(unavailableTime).setHours(12, 0, 0, 0);
    });

    return !unavailable.some((checkoutTime) => {
      return (
        (checkoutTime >= startTime && checkoutTime < endTime) ||
        (checkoutTime >= endTime   && checkoutTime < endDateNoon)
      );
    });
  };

  const days = Math.ceil((dates[0].endDate - dates[0].startDate) / (1000 * 60 * 60 * 24));

  // ---- Extra room category handlers ----
  // Same model as the public checkout page: `options.rooms` is a FIXED pool
  // shared across every category — adding a category reallocates rooms away
  // from the primary type rather than adding more rooms on top of it.

  const addCategory = () => {
    setExtraCategories((prev) => [
      ...prev,
      {
        key: extraCategoryKey++,
        roomId: "",
        roomData: null,
        quantity: 1,
        selectedRooms: [],
        selectedRoomNumbers: [],
      },
    ]);
  };

  const removeCategory = (key) => {
    setExtraCategories((prev) => prev.filter((cat) => cat.key !== key));
  };

  const handleCategoryRoomChange = (key, roomId) => {
    const roomData = rooms.find((r) => r._id === roomId) || null;
    setExtraCategories((prev) =>
      prev.map((cat) =>
        cat.key === key
          ? { ...cat, roomId, roomData, selectedRooms: [], selectedRoomNumbers: [] }
          : cat
      )
    );
  };

  const handleCategoryQuantityChange = (key, quantity) => {
    setExtraCategories((prev) => {
      const otherTotal = prev
        .filter((cat) => cat.key !== key)
        .reduce((sum, cat) => sum + cat.quantity, 0);
      const maxAllowed = Math.max(1, options.rooms - otherTotal);
      const clamped = Math.min(maxAllowed, Math.max(1, Number(quantity) || 1));
      return prev.map((cat) =>
        cat.key === key
          ? { ...cat, quantity: clamped, selectedRooms: [], selectedRoomNumbers: [] }
          : cat
      );
    });
  };

  const handleCategoryRoomSelect = (key, e) => {
    const { checked, value, name } = e.target;
    setExtraCategories((prev) =>
      prev.map((cat) => {
        if (cat.key !== key) return cat;
        return {
          ...cat,
          selectedRooms: checked
            ? [...cat.selectedRooms, value]
            : cat.selectedRooms.filter((v) => v !== value),
          selectedRoomNumbers: checked
            ? [...cat.selectedRoomNumbers, name]
            : cat.selectedRoomNumbers.filter((v) => v !== name),
        };
      })
    );
  };

  // Reset extra categories entirely if the room count drops to 1
  useEffect(() => {
    if (options.rooms <= 1 && extraCategories.length > 0) {
      setExtraCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.rooms]);

  const extraCategoriesQuantityTotal = extraCategories.reduce((sum, cat) => sum + cat.quantity, 0);
  const rawPrimaryQuantity = options.rooms - extraCategoriesQuantityTotal;
  const isOverAllocated = rawPrimaryQuantity < 0;
  const primaryQuantity = Math.max(0, rawPrimaryQuantity);

  // You can't have more distinct room TYPES than rooms booked — each type
  // needs at least 1 room, so once (primary + extras) reaches options.rooms,
  // there's no room left to give a brand-new category.
  const maxCategoriesReached = extraCategories.length + 1 >= options.rooms;
  const addCategoryDisabled = primaryQuantity === 0 || maxCategoriesReached;

  // Reset primary room-number selection whenever the primary allocation shifts
  useEffect(() => {
    setSelectedRooms([]);
    setSelectedRoomNumbers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryQuantity]);

  const categoryLineTotal = (category) => {
    if (!category.roomData) return 0;
    const nightlyPrice = Number(category.roomData[PRICE_FIELD]) || 0;
    return nightlyPrice * days * category.quantity;
  };

  const primarySubtotal      = primaryQuantity * days * (Number(room?.[PRICE_FIELD]) || 0);
  const extraCategoriesTotal = extraCategories.reduce((sum, cat) => sum + categoryLineTotal(cat), 0);
  const subtotal             = primarySubtotal + extraCategoriesTotal;

  // ---- Discount ----
  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = (subtotal * (Number(discount.value) || 0)) / 100;
  } else if (discount.type === "fixed") {
    discountAmount = Number(discount.value) || 0;
  }
  discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);

  const totalPrice = Math.round((subtotal - discountAmount) * 100) / 100;

  // ---- Payment ----
  // Down payments / part payments are only allowed for bookings that check
  // in on a future date. If check-in is today, the balance must be settled
  // in full at booking time — there's no later point before check-in to
  // collect the rest.
  const isCheckInToday = (() => {
    const today = new Date();
    const checkIn = dates[0].startDate;
    return (
      checkIn.getFullYear() === today.getFullYear() &&
      checkIn.getMonth() === today.getMonth() &&
      checkIn.getDate() === today.getDate()
    );
  })();

  const effectiveAmountPaid = (fullyPaid || isCheckInToday)
    ? totalPrice
    : Math.min(Math.max(Number(amountPaidInput) || 0, 0), totalPrice);
  const balanceDue = Math.max(0, Math.round((totalPrice - effectiveAmountPaid) * 100) / 100);

  // If the guest was mid-way through recording a part payment and then
  // changed the check-in date to today, snap back to fully paid instead of
  // silently letting a same-day booking through with a balance.
  useEffect(() => {
    if (isCheckInToday && !fullyPaid) {
      setFullyPaid(true);
      setAmountPaidInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckInToday]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (isCheckInToday && balanceDue > 0) {
      setMsg("Full payment is required for bookings checking in today. Part payment is only available for future check-in dates.");
      return setError(true);
    }

    if (isOverAllocated) {
      setMsg(`You can only allocate ${options.rooms} room(s) in total across all room types`);
      return setError(true);
    }

    if (primaryQuantity > 0 && selectedRooms.length !== primaryQuantity) {
      setMsg(`Please select exactly ${primaryQuantity} ${room?.title || ""} room(s).`);
      return setError(true);
    }

    for (const category of extraCategories) {
      if (!category.roomData) {
        setMsg("Choose a room type for every extra category you added, or remove it");
        return setError(true);
      }
      if (category.selectedRooms.length !== category.quantity) {
        setMsg(`Please select exactly ${category.quantity} ${category.roomData.title} room(s).`);
        return setError(true);
      }
    }

    if (discount.type !== "none" && (discount.value === "" || Number(discount.value) < 0)) {
      setMsg("Enter a valid discount value");
      return setError(true);
    }

    setIsProcessing(true);

    const roomsPayload = [
      ...(primaryQuantity > 0
        ? [
            {
              roomTitle: room.title,
              numberOfRooms: primaryQuantity,
              selectedRooms,
              roomNumbers: selectedRoomNumbers,
              pricePerRoom: (Number(room[PRICE_FIELD]) || 0) * days,
            },
          ]
        : []),
      ...extraCategories.map((cat) => ({
        roomTitle: cat.roomData.title,
        numberOfRooms: cat.quantity,
        selectedRooms: cat.selectedRooms,
        roomNumbers: cat.selectedRoomNumbers,
        pricePerRoom: (Number(cat.roomData[PRICE_FIELD]) || 0) * days,
      })),
    ];

    const bookingData = {
      ...info,
      rooms:         roomsPayload,
      adults:        options.adults,
      children:      options.children,
      startDate:     dates[0].startDate,
      endDate:       dates[0].endDate,
      email:         info.email || `janedoe@yahoo.com`,
      identity:      info.identity || "NIL",
      checkedIn,
      registeredBy:  `${user.firstName} ${user.lastName}`,
      ...(discount.type !== "none"
        ? {
            discount: {
              type: discount.type,
              value: Number(discount.value) || 0,
              reason: discount.reason,
              approvedBy: `${user.firstName} ${user.lastName}`,
            },
          }
        : {}),
      ...(effectiveAmountPaid > 0
        ? {
            downPayment: {
              amount: effectiveAmountPaid,
              method: "Transfer",
            },
          }
        : {}),
    };

    const allSelectedRoomIds = [
      ...selectedRooms,
      ...extraCategories.flatMap((cat) => cat.selectedRooms),
    ];

    try {
      await Promise.all(
        allSelectedRoomIds.map((roomId) =>
          api.put(`/rooms/availability/${roomId}`, {
            dates: getDatesInRange(dates[0].startDate, dates[0].endDate),
          })
        )
      );

      const res   = await api.post("/bookings", bookingData);
      const saved = res.data?.booking || res.data;

      navigate("/bookings/receipt", {
        state: {
          booking: {
            ...bookingData,
            _id:          saved?._id,
            confirmation: saved?.confirmation,
            totalPrice:   saved?.totalPrice   ?? totalPrice,
            amountPaid:   saved?.amountPaid   ?? effectiveAmountPaid,
            balanceDue:   saved?.balanceDue   ?? balanceDue,
            paymentStatus: saved?.paymentStatus,
            rooms:        saved?.rooms        || roomsPayload,
          },
        },
      });
    } catch (err) {
      setMsg("Error creating booking. Please try again.");
      setError(true);
      setIsProcessing(false);
    }
  };

  const inputStyle = {
    height: "42px", padding: "0 14px",
    fontSize: "13px", borderRadius: "10px",
    border: `1px solid ${c.border}`,
    background: c.inputBg, color: c.text,
    outline: "none", width: "100%",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const focusInput = (e) => { e.target.style.borderColor = currentColor; e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`; };
  const blurInput  = (e) => { e.target.style.borderColor = c.border;     e.target.style.boxShadow = "none"; };
  const labelStyle = {
    fontSize: "10px", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: c.muted, display: "block", marginBottom: "6px",
  };

  return (
    <div style={{
      margin: "1.5rem", marginTop: "6rem",
      padding: "2rem",
      background: c.bg,
      borderRadius: "20px",
      border: `1px solid ${c.border}`,
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.muted, marginBottom: "4px" }}>
          Bookings
        </p>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: c.text, margin: 0 }}>
          Add New Booking
        </h1>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* Summary */}
        <div style={{
          width: "260px", flexShrink: 0, borderRadius: "16px",
          border: `1px solid ${c.border}`, background: c.summary,
          padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0",
        }}>
          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.muted, marginBottom: "1rem" }}>
            Summary
          </p>
          {[
            { label: "Check-in",  value: format(dates[0].startDate, "dd MMM yyyy") },
            { label: "Check-out", value: format(dates[0].endDate,   "dd MMM yyyy") },
            { label: "Night(s)",  value: days },
            { label: "Guests",    value: `${options.adults} adult${options.adults !== 1 ? "s" : ""}${options.children > 0 ? `, ${options.children} children` : ""}` },
            { label: "Rooms",     value: options.rooms },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontSize: "12px", color: c.muted }}>{label}</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: c.text }}>{value}</span>
            </div>
          ))}

          {room && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontSize: "12px", color: c.muted }}>{room.title} ({primaryQuantity})</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: c.text }}>₦{primarySubtotal.toLocaleString()}</span>
            </div>
          )}

          {extraCategories.map((cat) => (
            <div key={cat.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontSize: "12px", color: c.muted }}>{cat.roomData?.title || "Extra room"} ({cat.quantity})</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: c.text }}>₦{categoryLineTotal(cat).toLocaleString()}</span>
            </div>
          ))}

          {isOverAllocated && (
            <p style={{ fontSize: "11px", color: "#ef4444", margin: "8px 0 0" }}>
              ⚠ Allocated more than {options.rooms} room(s) — reduce a quantity above.
            </p>
          )}

          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontSize: "12px", color: c.muted }}>Discount</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#ef4444" }}>-₦{discountAmount.toLocaleString()}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>Total</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: currentColor }}>₦{totalPrice.toLocaleString()}</span>
          </div>

          {!fullyPaid && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0" }}>
                <span style={{ fontSize: "12px", color: c.muted }}>Paid now</span>
                <span style={{ fontSize: "12px", fontWeight: 500, color: c.text }}>₦{effectiveAmountPaid.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 0" }}>
                <span style={{ fontSize: "12px", color: c.muted }}>Balance due</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444" }}>₦{balanceDue.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleBookingSubmit} style={{ flex: 1, minWidth: "280px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Dates */}
          <div style={{ position: "relative" }}>
            <label style={labelStyle}>Dates</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { label: "Check-in",  value: format(dates[0].startDate, "dd MMM yyyy") },
                { label: "Check-out", value: format(dates[0].endDate,   "dd MMM yyyy") },
              ].map(({ label, value }) => (
                <button key={label} type="button" onClick={() => setDatePickerOpen(!datePickerOpen)}
                  style={{ flex: 1, height: "42px", padding: "0 14px", borderRadius: "10px", cursor: "pointer", border: `1px solid ${datePickerOpen ? currentColor : c.border}`, background: c.inputBg, color: c.text, fontSize: "13px", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center", transition: "border-color 0.15s" }}>
                  <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: c.muted }}>{label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: c.text }}>{value}</span>
                </button>
              ))}
            </div>
            {datePickerOpen && (
              <div style={{ position: "absolute", zIndex: 50, marginTop: "8px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: `1px solid ${c.border}` }}>
                <DateRange editableDateInputs={true} onChange={handleDateChange} moveRangeOnFirstSelection={false} ranges={dates} minDate={new Date()} months={2} direction="horizontal" />
                <div style={{ padding: "10px", background: c.bg, borderTop: `1px solid ${c.border}`, display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setDatePickerOpen(false)} style={{ padding: "7px 20px", borderRadius: "8px", background: currentColor, color: "#fff", fontSize: "12px", fontWeight: 600, border: "none", cursor: "pointer" }}>Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* Counters */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            {["adults", "children", "rooms"].map((field) => (
              <div key={field} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={labelStyle}>{field}</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button type="button" onClick={() => updateQuantity(field, -1)}
                    style={{ width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${c.border}`, background: c.surface, color: c.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${currentColor}15`}
                    onMouseLeave={(e) => e.currentTarget.style.background = c.surface}>
                    <RemoveIcon style={{ fontSize: "14px" }} />
                  </button>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: c.text, minWidth: "20px", textAlign: "center" }}>{options[field]}</span>
                  <button type="button" onClick={() => updateQuantity(field, 1)}
                    style={{ width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${c.border}`, background: c.surface, color: c.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = `${currentColor}15`}
                    onMouseLeave={(e) => e.currentTarget.style.background = c.surface}>
                    <AddIcon style={{ fontSize: "14px" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Room type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>Room Type</label>
            <select value={room?._id || ""} onChange={handleRoomSelect} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusInput} onBlur={blurInput}>
              <option value="" disabled>Select preferred room</option>
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>

          {/* Room numbers */}
          {room && primaryQuantity > 0 && (
            <div>
              <label style={labelStyle}>Room Numbers — {room.title} (choose {primaryQuantity})</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {room.roomNumbers.map((rNum) => {
                  const available = isRoomAvailable(rNum);
                  const selected  = selectedRooms.includes(rNum._id);
                  return (
                    <label key={rNum._id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", cursor: available ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 600, border: `1px solid ${selected ? currentColor : c.border}`, background: selected ? `${currentColor}15` : c.surface, color: !available ? c.muted : selected ? currentColor : c.text, opacity: available ? 1 : 0.45, transition: "all 0.15s" }}>
                      <input type="checkbox" value={rNum._id} name={rNum.number.toString()} checked={selected} onChange={handleRoomNumberSelect} disabled={!available} style={{ display: "none" }} />
                      {rNum.number}
                      {!available && <span style={{ fontSize: "9px" }}>Unavail.</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra room categories */}
          {options.rooms > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {extraCategories.map((cat) => (
                <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "1rem", borderRadius: "12px", border: `1px solid ${c.border}`, background: c.surface }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={labelStyle}>Extra Room Type</label>
                    <button type="button" onClick={() => removeCategory(cat.key)}
                      style={{ fontSize: "11px", fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      Remove
                    </button>
                  </div>

                  <select value={cat.roomId} onChange={(e) => handleCategoryRoomChange(cat.key, e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusInput} onBlur={blurInput}>
                    <option value="">Select room type</option>
                    {rooms.filter((r) => r._id !== room?._id).map((r) => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>

                  {cat.roomData && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label style={labelStyle}>Number of {cat.roomData.title} rooms</label>
                        <input type="number" min={1} value={cat.quantity}
                          onChange={(e) => handleCategoryQuantityChange(cat.key, e.target.value)}
                          style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                      </div>

                      <label style={labelStyle}>Room Numbers — {cat.roomData.title} (choose {cat.quantity})</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {cat.roomData.roomNumbers.map((rNum) => {
                          const available = isRoomAvailable(rNum);
                          const selected  = cat.selectedRooms.includes(rNum._id);
                          return (
                            <label key={rNum._id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", cursor: available ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 600, border: `1px solid ${selected ? currentColor : c.border}`, background: selected ? `${currentColor}15` : c.bg, color: !available ? c.muted : selected ? currentColor : c.text, opacity: available ? 1 : 0.45, transition: "all 0.15s" }}>
                              <input type="checkbox" value={rNum._id} name={rNum.number.toString()} checked={selected} onChange={(e) => handleCategoryRoomSelect(cat.key, e)} disabled={!available} style={{ display: "none" }} />
                              {rNum.number}
                              {!available && <span style={{ fontSize: "9px" }}>Unavail.</span>}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button type="button" onClick={addCategory} disabled={addCategoryDisabled}
                style={{ alignSelf: "flex-start", padding: "8px 16px", borderRadius: "8px", border: `1px dashed ${c.border}`, background: "transparent", color: currentColor, fontSize: "12px", fontWeight: 600, cursor: addCategoryDisabled ? "not-allowed" : "pointer", opacity: addCategoryDisabled ? 0.5 : 1 }}>
                + Add another room type
              </button>
              {addCategoryDisabled && (
                <p style={{ fontSize: "11px", color: c.muted, margin: 0 }}>
                  {maxCategoriesReached
                    ? `You can't have more room types than rooms booked (${options.rooms}). Remove one to add a different type.`
                    : `All ${options.rooms} room(s) are allocated. Reduce a quantity above to free one up.`}
                </p>
              )}
            </div>
          )}

          {/* Guest inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {bookingInputs.map((input) => (
              <div key={input.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor={input.id} style={labelStyle}>{input.label}</label>
                <input id={input.id} type={input.type} placeholder={input.placeholder} onChange={handleChange} style={inputStyle} onFocus={focusInput} onBlur={blurInput} disabled={isProcessing} />
              </div>
            ))}
          </div>

          {/* Discount */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "1rem", borderRadius: "12px", border: `1px solid ${c.border}`, background: c.surface }}>
            <label style={labelStyle}>Discount</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <select value={discount.type} onChange={(e) => setDiscount((prev) => ({ ...prev, type: e.target.value, value: e.target.value === "none" ? "" : prev.value }))}
                style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusInput} onBlur={blurInput}>
                <option value="none">No discount</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (₦)</option>
              </select>
              <input type="number" min={0} max={discount.type === "percentage" ? 100 : undefined}
                placeholder={discount.type === "percentage" ? "e.g. 10" : "e.g. 5000"}
                value={discount.value} disabled={discount.type === "none"}
                onChange={(e) => setDiscount((prev) => ({ ...prev, value: e.target.value }))}
                style={{ ...inputStyle, opacity: discount.type === "none" ? 0.5 : 1 }} onFocus={focusInput} onBlur={blurInput} />
            </div>
            {discount.type !== "none" && (
              <input type="text" placeholder="Reason (optional)" value={discount.reason}
                onChange={(e) => setDiscount((prev) => ({ ...prev, reason: e.target.value }))}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            )}
          </div>

          {/* Payment */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "1rem", borderRadius: "12px", border: `1px solid ${c.border}`, background: c.surface }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: c.text, margin: 0 }}>Paid in Full</p>
                <p style={{ fontSize: "11px", color: c.muted, margin: "2px 0 0" }}>
                  {isCheckInToday
                    ? "Full payment required — part payment is only available for future check-in dates."
                    : "Turn off to record a down payment / deposit instead"}
                </p>
              </div>
              <button type="button" onClick={() => setFullyPaid((prev) => !prev)} role="switch" aria-checked={fullyPaid} disabled={isProcessing || isCheckInToday}
                style={{ width: "44px", height: "24px", borderRadius: "99px", border: "none", cursor: (isProcessing || isCheckInToday) ? "not-allowed" : "pointer", flexShrink: 0, background: fullyPaid ? currentColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", position: "relative", transition: "background 0.2s", opacity: (isProcessing || isCheckInToday) ? 0.6 : 1 }}>
                <span style={{ position: "absolute", top: "3px", left: fullyPaid ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
            {!fullyPaid && !isCheckInToday && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={labelStyle}>Amount Paid Now (₦)</label>
                <input type="number" min={0} max={totalPrice} placeholder="0"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
            )}
          </div>

          {/* Checked in */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", border: `1px solid ${c.border}`, background: c.surface }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: c.text, margin: 0 }}>Checked In</p>
              <p style={{ fontSize: "11px", color: c.muted, margin: "2px 0 0" }}>Mark guest as already checked in</p>
            </div>
            <button type="button" onClick={() => setCheckedIn((prev) => !prev)} role="switch" aria-checked={checkedIn} disabled={isProcessing}
              style={{ width: "44px", height: "24px", borderRadius: "99px", border: "none", cursor: isProcessing ? "not-allowed" : "pointer", flexShrink: 0, background: checkedIn ? currentColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", position: "relative", transition: "background 0.2s", opacity: isProcessing ? 0.6 : 1 }}>
              <span style={{ position: "absolute", top: "3px", left: checkedIn ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </button>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={isProcessing}
              style={{ padding: "10px 32px", borderRadius: "10px", background: currentColor, color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: isProcessing ? "not-allowed" : "pointer", boxShadow: `0 4px 14px ${currentColor}40`, transition: "opacity 0.15s, transform 0.15s", opacity: isProcessing ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.opacity = "1")}
              onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e)   => !isProcessing && (e.currentTarget.style.transform = "scale(1)")}>
              {isProcessing ? (
                <>
                  <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Processing...
                </>
              ) : (
                "Book Now"
              )}
            </button>
            {isProcessing && (
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewBooking;