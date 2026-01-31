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
  console.log(confirmation);
  

  if (!confirmation) {
    return (
      <div>
        <HeadingSmall text="Reservation Error" img={images.confirm} />
        <div className="confirmation">
          <div className="confirmationContainer">
            <h1>Something went wrong</h1>
            <p>Your booking confirmation could not be found.</p>
            <button className="cButton" onClick={() => navigate('/')}>
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <HeadingSmall text="Enjoy Your Stay!" img={images.confirm} />

      <div className="confirmation">
        <div className="confirmationContainer">
          <h1>Thank You!</h1>

          <div className="confirm">
            <div className="foundLogo">
              <div className="logoImage">
                <img src={images.logo} alt="logo" />
              </div>
              <h6>K.A HOTEL AND SUITES</h6>
            </div>

            <h1>Your confirmation code is:</h1>
            <h1>{confirmation.confirmation}</h1>

            <div className="confirmDetail">
              <h3>Room(s):</h3>
              <h3>
                {confirmation.roomNumbers?.length
                  ? confirmation.roomNumbers.join(', ')
                  : 'N/A'}
              </h3>
            </div>

            <div className="confirmDetail">
              <h3>Name:</h3>
              <h3>
                {confirmation.lastName} {confirmation.firstName}
              </h3>
            </div>

            <div className="confirmDetail">
              <h3>Email:</h3>
              <h3>{confirmation.email}</h3>
            </div>

            <div className="confirmDetail">
              <h3>Payment Reference:</h3>
              <h3>{confirmation.paymentReference || 'Cash'}</h3>
            </div>

            <div className="confirmDetail">
              <h3>Phone:</h3>
              <h3>{confirmation.phone}</h3>
            </div>

            <div className="confirmDetail">
              <h3>ID Number:</h3>
              <h3>{confirmation.identity}</h3>
            </div>

            <div className="confirmDetail">
              <h3>Check-in Date:</h3>
              <h3>
                {new Date(confirmation.startDate).toLocaleDateString('en-GB')}
              </h3>
            </div>

            <div className="confirmDetail">
              <h3>Check-out Date:</h3>
              <h3>
                {new Date(confirmation.endDate).toLocaleDateString('en-GB')}
              </h3>
            </div>

            <div className="alert">
              ⚠ Damage to any hotel property will be charged to the occupant.
            </div>

            <div className="alert">
              Reservation with "Non arrival of guest" will be forfeited if not
              cancelled 24hrs prior to arrival.
            </div>

            <div className="confirmButton">
              <button className="cButton" onClick={() => window.print()}>
                <BsPrinterFill /> Print
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
