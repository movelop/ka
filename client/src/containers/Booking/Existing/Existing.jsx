import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../hooks/api";

import "./Existing.css";
import { images } from "../../../Data/dummy";
import { Footer, HeadingSmall, Testimonials } from "../../../components";

const Existing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const data = location.state?.data;
  const bookings = data?.bookings || [];

  const presentDay = new Date();

  const handleCancel = async (info) => {
    try {
      await api.put(`/bookings/${info._id}/cancel`, {
        confirmation: info.confirmation,
        email: info.email,
      });

      alert("Booking cancelled successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div>
      <HeadingSmall text="Manage Your Reservations" img={images.existing} />

      <div className="existing">
        <div className="existingContainer">

          {bookings.length > 0 ? (
            bookings.map((info) => (
              <div className="found" key={info._id}>
                <div className="foundCard">

                  <div className="foundLogo">
                    <div className="logoImage">
                      <img src={images.logo} alt="logo" />
                    </div>
                    <h6>K.A HOTEL AND SUITES</h6>
                  </div>

                  <div className="foundInfo">
                    <h1>Confirmation Number:</h1>
                    <h1>{info.confirmation}</h1>

                    <div>
                      <h3>Room:</h3>
                      <h3>
                        {info.roomNumbers.map((room, i) =>
                          i === info.roomNumbers.length - 1
                            ? room
                            : `${room}, `
                        )}
                      </h3>
                    </div>

                    <div>
                      <h3>Payment Reference</h3>
                      <h3>{info.paymentReference || "Cash"}</h3>
                    </div>

                    <div>
                      <h3>Name:</h3>
                      <h3>{`${info.firstName} ${info.lastName || ""}`}</h3>
                    </div>

                    <div>
                      <h3>Email:</h3>
                      <h3>{info.email}</h3>
                    </div>

                    <div>
                      <h3>Phone:</h3>
                      <h3>{info.phone}</h3>
                    </div>

                    <div>
                      <h3>Check-in Date:</h3>
                      <h3>
                        {new Date(info.startDate).toLocaleDateString("en-GB")}
                      </h3>
                    </div>

                    <div>
                      <h3>Check-out Date:</h3>
                      <h3>
                        {new Date(info.endDate).toLocaleDateString("en-GB")}
                      </h3>
                    </div>
                  </div>

                  {presentDay < new Date(info.startDate) &&
                    !info.cancelled && (
                      <div className="actions">
                        <button
                          className="deleteButton"
                          onClick={() => handleCancel(info)}
                        >
                          Cancel Reservation
                        </button>
                      </div>
                    )}

                  <div className="existingCaution">
                    <span className="caution">
                      Please contact the front desk for cancelled reservations!
                    </span>
                    <span className="caution">
                      Confirmed reservation with "Non arrival of guest" will be
                      forfeited if not cancelled 24hrs prior to arrival
                    </span>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="notExisting">
              <h1>No Booking was Found...</h1>
              <button
                className="notExistingButton"
                onClick={() => navigate("/booking")}
              >
                Go Back
              </button>
            </div>
          )}

        </div>
      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Existing;
