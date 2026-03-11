import React from 'react';
import { BsPrinterFill } from 'react-icons/bs';
import { useLocation, useNavigate } from 'react-router-dom';

import './Confirmation.css';
import { Footer, HeadingSmall, Testimonials } from '../../../components';
import { images } from '../../../Data/dummy';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmation = location.state?.confirmation?.booking;

  /* ── Error state ── */
  if (!confirmation) {
    return (
      <div>
        <HeadingSmall text="Reservation Error" img={images.confirm} />
        <div className="confirmation">
          <div className="confirmationContainer">
            <h1>Something went wrong</h1>
            <div className="confirmation__rule" />
            <p>Your booking confirmation could not be retrieved. Please contact the hotel directly.</p>
            <br />
            <button className="cButton" onClick={() => navigate('/')}>
              <span>← Go Home</span>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div>
      <HeadingSmall text="Enjoy Your Stay!" img={images.confirm} />

      <div className="confirmation">
        <div className="confirmationContainer">
          <h1>Booking Confirmed</h1>
          <div className="confirmation__rule" />

          <div className="confirm">

            {/* Logo */}
            <div className="foundLogo">
              <div className="logoImage">
                <img src={images.logo} alt="K.A Hotel and Suites" />
              </div>
              <h6>K.A Hotel &amp; Suites</h6>
            </div>

            {/* Confirmation code */}
            <p className="confirm__codeLabel">Confirmation Code</p>
            <p className="confirm__code">{confirmation.confirmation}</p>

            {/* Detail rows */}
            <div className="confirmDetail">
              <h3>Room(s)</h3>
              <h3>{confirmation.roomNumbers?.length ? confirmation.roomNumbers.join(', ') : 'N/A'}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Name</h3>
              <h3>{confirmation.lastName} {confirmation.firstName}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Email</h3>
              <h3>{confirmation.email}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Phone</h3>
              <h3>{confirmation.phone}</h3>
            </div>
            <div className="confirmDetail">
              <h3>ID Number</h3>
              <h3>{confirmation.identity}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Payment Reference</h3>
              <h3>{confirmation.paymentReference || 'Cash'}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Check-in</h3>
              <h3>{formatDate(confirmation.startDate)}</h3>
            </div>
            <div className="confirmDetail">
              <h3>Check-out</h3>
              <h3>{formatDate(confirmation.endDate)}</h3>
            </div>

            {/* Alerts */}
            <div className="alert">
              ⚠ Damage to any hotel property will be charged to the room occupant.
            </div>
            <div className="alert">
              Reservations with "non-arrival" will be forfeited if not cancelled at least 24 hours prior to the check-in date.
            </div>

            {/* Actions */}
            <div className="confirmButton">
              <button className="cButton" onClick={() => window.print()}>
                <span><BsPrinterFill /> Print</span>
              </button>
              <button className="cButton" onClick={() => navigate('/')}>
                <span>← Back to Home</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Confirmation;