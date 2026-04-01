import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Availability,
  Footer,
  HeadingSearch,
  HeadingSmall,
  Loading,
  Testimonials,
} from "../../components";

import { images } from "../../Data/dummy";
import useFetch from "../../hooks/useFetch";
import api from "../../hooks/api";

import "./Booking.css";

const Booking = () => {
   const navigate = useNavigate();

  const [formData, setFormData] = useState({
    confirmation: "",
    email: "",
  });

  const [error, setError] = useState("");

  const { data, loading } = useFetch("/rooms");

  useEffect(() => {
    document.title = "K.A HOTEL & SUITES || BOOKING";
  }, []);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.confirmation && !formData.email) {
      return setError("Please fill out ONE of these fields.");
    }

    if (formData.confirmation && formData.email) {
      return setError("Only fill out ONE of these fields.");
    }

    try {
      const res = await api.post("/bookings/search", {
        confirmation: formData.confirmation || undefined,
        email: formData.email || undefined,
      });

      navigate("/booking/existing", {
        state: { data: res.data },
      });
    } catch (err) {
      navigate("/booking/existing", {
        state: { data: { bookings: [] } },
      });
    }
  };

  return (
    <div>
      <HeadingSmall text="Make a Reservation" img={images.lobby} />

      <div className="booking">

        {/* ── Check existing booking ── */}
        <div className="checkReservation">
          <span className="checkReservation__eyebrow">Manage Your Stay</span>
          <h1>Already have a booking?</h1>

          <form className="checkReservationForm" onSubmit={handleSubmit}>
            <input
              maxLength="12"
              name="confirmation"
              type="text"
              placeholder="Confirmation code"
              value={formData.confirmation}
              onChange={handleChange}
            />
            <input
              name="email"
              type="text"
              placeholder="Or your email address"
              value={formData.email}
              onChange={handleChange}
            />
            <button className="bookingButton" type="submit">
              <span>Look Up</span>
            </button>
          </form>

          <span className="disclaimer">
            * Expired bookings are automatically removed from our system
          </span>

          {error && <span className="bookingError">{error}</span>}
        </div>

        {/* ── Book a room header ── */}
        <div className="bookingHeader">
          <span className="bookingHeader__eyebrow">Availability</span>
          <h1>Book a Room</h1>
          <div className="bookingHeader__rule" />
        </div>

        {/* ── Search bar ── */}
        <div className="bookingSearch">
          <HeadingSearch />
        </div>

        {/* ── Room availability list ── */}
        <div className="availability">
          {loading ? (
            <Loading />
          ) : (
            data?.rooms
              ?.filter((room) => room.title !== "BQ")
              .map((room) => (
                <Availability room={room} key={room._id} />
              ))
          )}
        </div>

      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Booking;