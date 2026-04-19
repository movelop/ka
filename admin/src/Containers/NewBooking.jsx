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
  const updateQuantity = (field, value) =>
    setOptions((prev) => ({ ...prev, [field]: Math.min(Math.max(prev[field] + value, 0), 5) }));
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

  const days       = Math.ceil((dates[0].endDate - dates[0].startDate) / (1000 * 60 * 60 * 24));
  const totalPrice = days * options.rooms * (room?.price || 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (selectedRooms.length !== options.rooms) {
      setMsg(`Please select exactly ${options.rooms} room(s).`);
      return setError(true);
    }

    setIsProcessing(true);
    const bookingData = {
      ...info,
      roomTitle:     room.title,
      adults:        options.adults,
      children:      options.children,
      startDate:     dates[0].startDate,
      endDate:       dates[0].endDate,
      numberOfRooms: options.rooms,
      selectedRooms,
      roomNumbers:   selectedRoomNumbers,
      price:         info.amount || totalPrice,
      email:         info.email || `janedoe@yahoo.com`,
      identity:      info.identity || 'NIL',
      checkedIn,
      registeredBy:  `${user.firstName} ${user.lastName}`,
    };

    try {
      await Promise.all(
        selectedRooms.map((roomId) =>
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
            roomNumbers:  saved?.roomNumbers || selectedRoomNumbers,
            price:        saved?.price       || bookingData.price,
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
            { label: "Room",      value: room?.title || "—" },
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>Total</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: currentColor }}>₦{totalPrice.toLocaleString()}</span>
          </div>
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
          {room && (
            <div>
              <label style={labelStyle}>Room Numbers</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {room.roomNumbers.map((rNum) => {
                  const available = isRoomAvailable(rNum);
                  const selected  = selectedRooms.includes(rNum._id);
                  return (
                    <label key={rNum._id} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", cursor: available ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 600, border: `1px solid ${selected ? currentColor : c.border}`, background: selected ? `${currentColor}15` : c.surface, color: !available ? c.muted : selected ? currentColor : c.text, opacity: available ? 1 : 0.45, transition: "all 0.15s" }}>
                      <input type="checkbox" value={rNum._id} name={rNum.number.toString()} onChange={handleRoomNumberSelect} disabled={!available} style={{ display: "none" }} />
                      {rNum.number}
                      {!available && <span style={{ fontSize: "9px" }}>Unavail.</span>}
                    </label>
                  );
                })}
              </div>
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