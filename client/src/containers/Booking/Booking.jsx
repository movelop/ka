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
      <HeadingSmall text="Make A Reservation" img={images.lobby} />

      <div className="booking">
        <div className="checkReservation">
          <h1>Already have a booking?</h1>

          <form className="checkReservationForm" onSubmit={handleSubmit}>
            <input
              maxLength="12"
              name="confirmation"
              type="text"
              placeholder="Enter Confirmation Code"
              value={formData.confirmation}
              onChange={handleChange}
            />

            <input
              name="email"
              type="text"
              placeholder="Or Enter Email"
              value={formData.email}
              onChange={handleChange}
            />

            <button className="bookingButton" type="submit">
              Lookup
            </button>
          </form>

          <span className="disclaimer">
            * expired bookings will automatically be deleted
          </span>

          {error && <span style={{ color: "red" }}>{error}</span>}
        </div>

        <div className="bookingHeader">
          <h1>BOOK A ROOM</h1>
        </div>

        <div className="bookingSearch">
          <HeadingSearch />
        </div>

        <div className="availability">
          {loading ? (
            <Loading />
          ) : (
            <>
              {data?.rooms?.map((room) => (
                <Availability room={room} key={room._id} />
              ))}
            </>
          )}
        </div>
      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Booking;
