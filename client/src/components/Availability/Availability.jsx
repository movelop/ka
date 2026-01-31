import React, { useState, useEffect, useContext } from 'react';
import { HiLocationMarker } from 'react-icons/hi';
import { TbCurrencyNaira } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

import './Availability.css';
import { SearchContext } from '../../contexts/SearchContext';

const Availability = ({ room }) => {
    const [availableRooms, setAvailableRooms] = useState([]);
    const { dates, options } = useContext(SearchContext);
    const navigate = useNavigate();

    useEffect(() => {
        let a = [];
        const isAvailable = () => {
            room?.roomNumbers.forEach((item) => {
                const endTime = new Date(dates[0].endDate).getTime();
                const startTime = new Date(dates[0].startDate).getTime();
                const endtimeNoon = new Date(endTime).setHours(13,0,0,0);
                const endDateAfternoon = new Date(endtimeNoon).getTime();
                const updatedUnavailableDates = item.unavailableDates.map((date) => {
                const unavailableTime = new Date(date).getTime();
                const checkoutTime = new Date(unavailableTime).setHours(12, 59, 59, 0);
                return checkoutTime;
                });
                const isFound = updatedUnavailableDates.some((checkoutTime) => {
                return (checkoutTime >= startTime && checkoutTime < endTime) ||
                        (checkoutTime >= endTime && checkoutTime < endDateAfternoon);
                });
                const update = (obj) => {
                    const roomFound = a.includes(obj)

                    if (roomFound) {
                        return a
                    } else {
                        a = [...a, obj]
                    }
                }

                if(!isFound) {
                    update(item);
                }
                return setAvailableRooms(a);
            })
        }
      isAvailable()
    }, [room, dates])

    const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
    const dayDifference = (date1, date2) => {
        const timeDiff = Math.abs(new Date(date2).getTime() - new Date(date1).getTime());
        const daydiff = Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
        return daydiff;
    }

  const days = dayDifference(dates[0].endDate, dates[0].startDate);
  const totalPrice = days * options.rooms * room.price;

  const handleBooking = (room) => {
    navigate('/booking/checkout', { state: { dates, options, days, totalPrice, room } });
  }
  return (
    <div>
        <div>
            <div className="availabilityCard">
                <div className="availabiltyCardImg">
                    <img src={room.images[0]} alt="room" />
                </div>
                <div className="availabilityCardInfo">
                    <h2>{room.title}</h2>
                    <span className="location">
                        <HiLocationMarker /> K.A Hotel and suites, Ota
                    </span>
                    <div className="details">
                        <div>
                            <label>Size:</label>
                            <p>{room.size}</p>
                        </div>
                        <div>
                            <label>Occupancy:</label>
                            <p>{room.maxPeople}</p>
                        </div>
                        <div>
                            <label>Bedding:</label>
                            <p>{room.bedding}</p>
                        </div>
                        <div>
                            <label>Room(s) Available:</label>
                            <p>{availableRooms.length}</p>
                        </div>
                    </div>
                </div>
                <div className="availabilityCardPrice">
                    <div className='daily'>
                        <label>Daily Price</label>
                        <h6><span><TbCurrencyNaira /></span>{room.price.toLocaleString("en-US")}</h6>
                    </div>
                    {/* <div>
                        <label>{`${days} Night(s) for ${options.rooms} room(s)`}</label>
                        <h6><span><TbCurrencyNaira /></span>{reservationPrice.toLocaleString("en-US")}</h6>
                    </div> */}
                    <div className='total'>
                        <label>Total</label>
                        <h4 className='last'><span><TbCurrencyNaira /></span>{totalPrice.toLocaleString("en-US")}</h4>
                    </div>
                    {availableRooms.length > 0 ? (
                        <button
                            className="availabilityButton"
                            onClick={() => handleBooking(room)}
                        >
                            Book
                        </button>
                    ): (
                        <button
                            className="availabilityButton"
                            style={{ color: "white", backgroundColor: "#14274A" }}
                        >
                            Unavailable
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Availability;