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
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { bookingInputs } from "../Data/formSource";
import useFetch from "../hooks/useFetch";
import { AuthContext } from "../context/AuthContextProvider";

const NewBooking = () => {
  const navigate = useNavigate();

  // States
  const [info, setInfo] = useState({});
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 86400000),
      key: "selection",
    },
  ]);
  const [options, setOptions] = useState({ adults: 1, children: 0, rooms: 1 });
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useContext(AuthContext);
  

  // Fetch rooms from API
  const { data } = useFetch("/rooms");

  useEffect(() => {
    if (data?.rooms) setRooms(data.rooms);
  }, [data]);

  useEffect(() => {
    if (error) toast.error(msg);
  }, [error, msg]);

  // Utility functions
  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current).getTime());
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleDateChange = (item) => {
    setDates([
      {
        startDate: item.selection.startDate,
        endDate: item.selection.endDate,
        key: "selection",
      },
    ]);
  };

  const handleRoomSelect = (e) => {
    const selected = rooms.find((r) => r._id === e.target.value);
    setRoom(selected);
    setSelectedRooms([]);
    setSelectedRoomNumbers([]);
  };

  const updateQuantity = (field, value) => {
    setOptions((prev) => {
      const newVal = Math.min(Math.max(prev[field] + value, 0), 5);
      return { ...prev, [field]: newVal };
    });
  };

  const handleRoomNumberSelect = (e) => {
    const { checked, value, name } = e.target;

    setSelectedRooms((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
    setSelectedRoomNumbers((prev) =>
      checked ? [...prev, name] : prev.filter((n) => n !== name)
    );
  };

  const isRoomAvailable = (roomNumber) => {
    const startTime = dates[0].startDate.getTime();
    const endTime = dates[0].endDate.getTime();

    const unavailable = roomNumber.unavailableDates.map((d) =>
      new Date(d).getTime()
    );

    return !unavailable.some((date) => date >= startTime && date <= endTime);
  };

  const days = Math.ceil(
    (dates[0].endDate - dates[0].startDate) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = days * options.rooms * (room?.price || 0);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (selectedRooms.length !== options.rooms) {
      setMsg(`Please select exactly ${options.rooms} room(s).`);
      return setError(true);
    }

    const bookingData = {
      ...info,
      roomTitle: room.title,
      adults: options.adults,
      children: options.children,
      startDate: dates[0].startDate,
      endDate: dates[0].endDate,
      numberOfRooms: options.rooms,
      selectedRooms,
      roomNumbers: selectedRoomNumbers,
      price: info.amount || totalPrice,
      checkedIn,
      registeredBy: `${user.firstName} ${user.lastName}`
    };

    try {
      // Update room availability
      await Promise.all(
        selectedRooms.map((roomId) =>
          api.put(`/rooms/availability/${roomId}`, {
            dates: getDatesInRange(dates[0].startDate, dates[0].endDate),
          })
        )
      );

      // Create booking
      await api.post("/bookings", bookingData);
      navigate("/bookings");
    } catch (err) {
      setMsg("Error creating booking. Please try again.");
      setError(true);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-5 md:p-10 bg-white rounded-3xl">
      <Typography variant="h4" className="mb-6 dark:text-gray-400 capitalize">
        Add New Booking
      </Typography>

      <div className="lg:flex gap-8">
        {/* Booking Summary */}
        <div className="lg:w-1/3 bg-gray-100 dark:bg-secondary-dark-bg p-5 rounded-md mb-6 lg:mb-0">
          <Typography variant="h6" className="mb-4">
            Booking Summary
          </Typography>
          <div className="flex justify-between mb-2">
            <span>Room:</span>
            <span>{room?.title || "Select a room type"}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Check-in:</span>
            <span>{format(dates[0].startDate, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Check-out:</span>
            <span>{format(dates[0].endDate, "dd/MM/yyyy")}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Night(s):</span>
            <span>{days}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Guests:</span>
            <span>
              {options.adults} Adults {options.children > 0 && `${options.children} Children`}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Room(s):</span>
            <span>{options.rooms}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>N{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Booking Form */}
        <form className="lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleBookingSubmit}>
          {/* Date Range */}
          <div className="relative col-span-2">
            <div className="flex gap-3">
              <TextField
                label="Check-in"
                value={format(dates[0].startDate, "dd/MM/yyyy")}
                readOnly
                onClick={() => setDatePickerOpen(!datePickerOpen)}
              />
              <TextField
                label="Check-out"
                value={format(dates[0].endDate, "dd/MM/yyyy")}
                readOnly
                onClick={() => setDatePickerOpen(!datePickerOpen)}
              />
            </div>

            {datePickerOpen && (
              <div className="absolute z-50 mt-2">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateChange}
                  moveRangeOnFirstSelection={false}
                  ranges={dates}
                  minDate={new Date()}
                  months={2}
                  direction="horizontal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  className="mt-2"
                  onClick={() => setDatePickerOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Options: Adults, Children, Rooms */}
          {["adults", "children", "rooms"].map((field) => (
            <div key={field}>
              <Typography className="mb-1 capitalize">{field}</Typography>
              <div className="flex items-center gap-2">
                <Button variant="outlined" size="small" onClick={() => updateQuantity(field, -1)}>
                  <RemoveIcon fontSize="small" />
                </Button>
                <span>{options[field]}</span>
                <Button variant="outlined" size="small" onClick={() => updateQuantity(field, 1)}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
            </div>
          ))}

          {/* Room Type Select */}
          <FormControl className="col-span-2">
            <Select value={room?._id || ""} onChange={handleRoomSelect} displayEmpty>
              <MenuItem value="" disabled>
                Select Preferred Room
              </MenuItem>
              {rooms.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Room Numbers */}
          {room && (
            <div className="col-span-2 flex flex-wrap gap-2">
              {room.roomNumbers.map((rNum) => (
                <FormControlLabel
                  key={rNum._id}
                  control={
                    <Checkbox
                      value={rNum._id}
                      name={rNum.number.toString()}
                      onChange={handleRoomNumberSelect}
                      disabled={!isRoomAvailable(rNum)}
                    />
                  }
                  label={rNum.number}
                />
              ))}
            </div>
          )}

          {/* Dynamic Inputs */}
          {bookingInputs.map((input) => (
            <TextField
              key={input.id}
              id={input.id}
              label={input.label}
              placeholder={input.placeholder}
              type={input.type}
              fullWidth
              onChange={handleChange}
            />
          ))}

          {/* Checked In */}
          <FormControl>
            <Typography>Checked In</Typography>
            <Select value={checkedIn} onChange={(e) => setCheckedIn(e.target.value)}>
              <MenuItem value={false}>No</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
            </Select>
          </FormControl>

          {/* Submit Button */}
          <div className="col-span-2 flex justify-end">
            <Button type="submit" variant="contained" color="primary">
              Book Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBooking;
