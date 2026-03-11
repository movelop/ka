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
      alert("Booking cancelled successfully.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed. Please try again.");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      year: "numeric", month: "long", day: "numeric",
    });

  return (
    <div>
      <HeadingSmall text="Manage Your Reservations" img={images.existing} />

      <div className="existing">
        <div className="existingContainer">

          {bookings.length > 0 ? (
            bookings.map((info) => (
              <div className="found" key={info._id}>
                <div className="foundCard">

                  {/* Logo */}
                  <div className="foundLogo">
                    <div className="logoImage">
                      <img src={images.logo} alt="K.A Hotel and Suites" />
                    </div>
                    <h6>K.A Hotel &amp; Suites</h6>
                  </div>

                  {/* Confirmation code */}
                  <p className="foundInfo__codeLabel">Confirmation Code</p>
                  <p className="foundInfo__code">{info.confirmation}</p>

                  {/* Details */}
                  <div className="foundInfo">
                    <div>
                      <h3>Room(s)</h3>
                      <h3>{info.roomNumbers?.join(", ") || "N/A"}</h3>
                    </div>
                    <div>
                      <h3>Payment Reference</h3>
                      <h3>{info.paymentReference || "Cash"}</h3>
                    </div>
                    <div>
                      <h3>Name</h3>
                      <h3>{info.firstName} {info.lastName || ""}</h3>
                    </div>
                    <div>
                      <h3>Email</h3>
                      <h3>{info.email}</h3>
                    </div>
                    <div>
                      <h3>Phone</h3>
                      <h3>{info.phone}</h3>
                    </div>
                    <div>
                      <h3>Check-in</h3>
                      <h3>{formatDate(info.startDate)}</h3>
                    </div>
                    <div>
                      <h3>Check-out</h3>
                      <h3>{formatDate(info.endDate)}</h3>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {presentDay < new Date(info.startDate) && !info.cancelled && (
                    <div className="actions">
                      <button
                        className="deleteButton"
                        onClick={() => handleCancel(info)}
                      >
                        <span>Cancel Reservation</span>
                      </button>
                    </div>
                  )}

                  {/* Cautions */}
                  <div className="existingCaution">
                    <span className="caution">
                      Please contact the front desk regarding any cancelled reservations.
                    </span>
                    <span className="caution">
                      Reservations with "non-arrival" will be forfeited if not cancelled at least 24 hours prior to check-in.
                    </span>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="notExisting">
              <div className="notExisting__icon">🔍</div>
              <h1>No Booking Found</h1>
              <p>
                We couldn't find any bookings matching your details. Please
                double-check your confirmation code or email and try again.
              </p>
              <button
                className="notExistingButton"
                onClick={() => navigate("/booking")}
              >
                <span>← Go Back</span>
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