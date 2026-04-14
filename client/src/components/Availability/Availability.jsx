import React, { useState, useEffect, useContext } from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import { TbCurrencyNaira } from 'react-icons/tb';

import './Availability.css';
import { SearchContext } from '../../contexts/SearchContext';

const Availability = ({ room }) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const { dates, options } = useContext(SearchContext);
  const isAvailable = availableRooms.length > 0;

  useEffect(() => {
    let a = [];

    room?.roomNumbers.forEach((item) => {
      const endTime = new Date(dates[0].endDate).getTime();
      const startTime = new Date(dates[0].startDate).getTime();
      const endtimeNoon = new Date(endTime).setHours(12, 0, 0, 0);
      const endDateAfternoon = new Date(endtimeNoon).getTime();

      const updatedUnavailableDates = item.unavailableDates.map((date) => {
        const unavailableTime = new Date(date).getTime();
        const checkoutTime = new Date(unavailableTime).setHours(12, 0, 0, 0);
        return checkoutTime;
      });

      const isFound = updatedUnavailableDates.some((checkoutTime) => {
        return (
          (checkoutTime >= startTime && checkoutTime < endTime) ||
          (checkoutTime >= endTime && checkoutTime < endDateAfternoon)
        );
      });

      if (!isFound) {
        a.push(item);
      }
    });

    setAvailableRooms(a);
  }, [room, dates]);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

  const dayDifference = (date1, date2) => {
    const timeDiff =
      Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
    const daydiff = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
    return daydiff;
  };

  const days = dayDifference(dates[0].endDate, dates[0].startDate);
  const totalPrice = days * options.rooms * room.price;

  const whatsappMessage = `Hello, I'd like to book the *${room.title}* room for ${days} night(s) from ${new Date(dates[0].startDate).toDateString()} to ${new Date(dates[0].endDate).toDateString()}. Total: ₦${totalPrice.toLocaleString('en-US')}`;

  return (
    <div className="availabilityCard">

      <div className="availabiltyCardImg">
        <img src={room.images[0]} alt={room.title} />
      </div>

      <div className="availabilityCardInfo">
        <h2>{room.title}</h2>
        <span className="location">
          <HiLocationMarker /> K.A Hotel and Suites, Ota
        </span>

        <div className="details">
          <div>
            <label>Size</label>
            <p>{room.size}</p>
          </div>
          <div>
            <label>Occupancy</label>
            <p>{room.maxPeople}</p>
          </div>
          <div>
            <label>Bedding</label>
            <p>{room.bedding}</p>
          </div>
          <div>
            <label>Rooms Available</label>
            <p>{availableRooms.length}</p>
          </div>
        </div>
      </div>

      <div className="availabilityCardPrice">
        <div className="daily">
          <label>Daily Price</label>
          <h6>
            <span><TbCurrencyNaira /></span>
            {room.price.toLocaleString('en-US')}
          </h6>
        </div>

        <div className="total">
          <label>Total</label>
          <h4>
            <span><TbCurrencyNaira /></span>
            {totalPrice.toLocaleString('en-US')}
          </h4>
        </div>

        {isAvailable ? (
          <button className="availabilityButton">
            <a
              href={`https://wa.me/2348163140615?text=Hello%20I%20would%20like%20to%20make%20an%20enquiry%20about%20your%20services`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Book</span>
            </a>
          </button>
        ) : (
          <button
            className="availabilityButton availabilityButton--unavailable"
            disabled
          >
            <span>Unavailable</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default Availability;