import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';
import api from '../../../hooks/api';
import { PaystackButton } from 'react-paystack';

import './Checkout.css';
import { images } from '../../../Data/dummy';
import { Footer, HeadingSmall, Testimonials, Loading } from '../../../components';

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC;


const Checkout = () => {
    const [loading, setLoading] = useState(false);
    const [pay, setPay] = useState(false);
    const [error, setError] = useState(false);
    const [msg, setMsg] = useState('');
    const [selectedRooms, setSelectedRooms] = useState([])
    const [selectedRoomNumbers, setSelectedRoomNumbers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        identity: "",
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { dates, options, days, totalPrice, room } = location.state;
    const getDatesInRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        const date = new Date(start.getTime());
    
        const dates = [];
    
        while (date <= end) {
          dates.push(new Date(date).getTime());
          date.setDate(date.getDate() + 1);
        }
    
        return dates;
    };

    const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);

    const isAvailable = (roomNumber) => {
        const endTime = new Date(dates[0].endDate).getTime();
        const startTime = new Date(dates[0].startDate).getTime();
        const endtimeNoon = new Date(endTime).setHours(13,0,0,0);
        const endDateAfternoon = new Date(endtimeNoon).getTime();
        const updatedUnavailableDates = roomNumber.unavailableDates.map((date) => {
          const unavailableTime = new Date(date).getTime();
          const checkoutTime = new Date(unavailableTime).setHours(12, 59, 59, 0);
          return checkoutTime;
        });
        const isFound = updatedUnavailableDates.some((checkoutTime) => {
          return (checkoutTime >= startTime && checkoutTime < endTime) ||
                 (checkoutTime >= endTime && checkoutTime < endDateAfternoon);
        });
        return !isFound;
      }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        
    }

    const handleSelect = (e) => {
        const checked = e.target.checked;
        const value = e.target.value;
        const name = e.target.name;

        setSelectedRooms(
          checked
            ? [...selectedRooms, value]
            : selectedRooms.filter((item) => item !== value)
        );

        setSelectedRoomNumbers(
            checked ? [...selectedRoomNumbers, name]
            : selectedRoomNumbers.filter((item) => item !== name)
        )
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        for (let val in formData) {
            if (formData[val] === "") {
              setMsg("You must Fill Out Every Field");
              return setError(true);
            }
        }

        if(formData.identity.length < 9){
            setMsg("Please enter a valid identity");
            return setError(true);
        }
      
        if (isNaN(Number(formData.phone))) {
            setMsg("Phone number must only contain numbers");
            return setError(true);
        }
      
        if (/.+@.+\..+/.test(formData.email) === false) {
            setMsg("Must be a valid email");
            return setError(true);
        }
        
        if(selectedRooms.length > options.rooms || selectedRooms.length < options.rooms) {
            setMsg(`you must select only ${options.rooms} rooms`);
            return setError(true);
        }

        setPay(true);
        setError(false);
    }


    const handleSuccess = async (reference) => {
        const newBooking = {
            ...formData,
            roomTitle: room.title,
            adults: options.adults,
            children: options.children,
            startDate: dates[0].startDate,
            endDate: dates[0].endDate,
            numberOfRooms: options.rooms,
            selectedRooms: selectedRooms,
            roomNumbers: selectedRoomNumbers,
            price: totalPrice,
            paymentReference: reference,
        }
        setLoading(true);
        try {
            const verifyRes = await api.get(`/bookings/verify-payment/${reference}`);
            if(verifyRes.data.data.status === 'success'){
                try {
                    await Promise.all(
                        selectedRooms.map((roomId) => {
                            const res = api.put(`/rooms/availability/${roomId}`, {
                                dates: alldates,
                            });
                            return res.data
                        })
                    );
                    const bookingRes = await api.post('/bookings', newBooking);
                    setLoading(false);
                    navigate('/booking/confirmation', { state: { confirmation: bookingRes.data} })
                } catch (error) {
                    setLoading(false);
                    navigate('/booking/confirmation', { state: { error: error.response.data } })
                }
            }
        } catch (error) {
            setLoading(false);
            navigate('/booking/confirmation', { state: { error: error.response.data }});
        }
    }

    const componentProps = {
        email: formData.email,
        amount: totalPrice * 100,
        metadata:{
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
        },
        publicKey: publicKey,
        text: "Pay Now",
        onSuccess: (reference) => {
            handleSuccess(reference.reference);
        },
        onClose: () => alert("Wait! Don't leave :(")
    }


  return (
    <div>
        <HeadingSmall text='Finish Your Reservation' img={images.checkout} />
        <div className="checkout">
            <div className="checkoutContainer">
                { loading ? (<Loading text={'Please wait ...'} />): (
                    <>
                        <h1>YOUR DETAILS</h1>
                        <div className="checkoutRoomInfo">
                            { room && (
                                <>
                                    <h1>BOOKING SUMMARY</h1>
                                    <div>
                                        <h4>Room:</h4> <span>{room.title}</span>
                                    </div>
                                    <div>
                                        <h4>Check-in Date:</h4>
                                        <span>
                                        {new Date(dates[0].startDate).toLocaleString("en-uk", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                        </span>
                                    </div>
                                    <div>
                                        <h4>Check-out Date:</h4>
                                        <span>
                                        {new Date(dates[0].endDate).toLocaleString("en-uk", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                        })}
                                        </span>
                                    </div>
                                    <div>
                                        <h4>Number of Night(s):</h4>
                                        <span>{days}</span>
                                    </div>
                                    <div>
                                        <h4>Guest(s)</h4>
                                        <span>
                                            {options.adults} Adult(s){" "}
                                            {options.children > 0 &&
                                            `, ${options.children} Children`}
                                        </span>
                                    </div>
                                    <div>
                                        <h4>Number of Room(s):</h4>
                                        <span>{options.rooms}</span>
                                    </div>
                                    <div>
                                        <h4>Total</h4>
                                        <span style={{ fontWeight: "bold" }}><TbCurrencyNaira />{totalPrice.toLocaleString("en-US")}</span>
                                    </div>
                                </>
                            )}
                            <div className="alert">
                                ⚠ Damage to any hotel's property will be charged to the occupant of the room.
                            </div>
                        </div>
                        <div className="guestDetails">
                            <h1>Enter Your Information</h1>
                            {error && <span className="errorMsg">{msg}</span>}
                            <form autoComplete='off'>
                                <div className="guestFormInput">
                                    <label>First Name</label>
                                    <input 
                                        type="text" 
                                        onChange={handleChange}
                                        required
                                        className="guestDetailsInput"
                                        name="firstName"
                                    />
                                </div>
                                <div className="guestFormInput">
                                    <label>Last Name</label>
                                    <input 
                                        type="text" 
                                        onChange={handleChange}
                                        required
                                        className="guestDetailsInput"
                                        name="lastName"
                                    />
                                </div>
                                <div className="guestFormInput">
                                    <label>Email</label>
                                    <input 
                                        type="email"
                                        onChange={handleChange}
                                        required
                                        className='guestDetailsInput'
                                        name='email'
                                    />
                                </div>
                                <div className="guestFormInput">
                                    <label>Phone</label>
                                    <input 
                                        type="tel"
                                        onChange={handleChange}
                                        required
                                        className='guestDetailsInput'
                                        name='phone'
                                    />
                                </div>
                                <div className="guestFormInput">
                                    <label>Identification</label>
                                    <input 
                                        type="text"
                                        onChange={handleChange}
                                        required
                                        className='guestDetailsInput'
                                        name='identity'
                                        placeholder='ID number(NIN, Passport Number, etc.)'
                                    />
                                </div>
                                <div className="selectRoomContainer">
                                    <label>Select your preferred room number(s)</label>
                                    <div className="selectRoom">
                                        {room.roomNumbers.map((roomNumber) => (
                                                <div className="optionsBoxes" key ={roomNumber._id}>
                                                    <label>{roomNumber.number}</label>
                                                    <input
                                                        className='checkbox'
                                                        type="checkbox"
                                                        value={roomNumber._id}
                                                        name= {roomNumber.number}
                                                        onChange={handleSelect}
                                                        disabled={!isAvailable(roomNumber)}
                                                    />
                                                </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                            <div className="guestFormButton">
                                    {pay ? <PaystackButton {...componentProps} className='pay' /> : <button className='continue' onClick={handleSubmit}>Continue to Pay</button>}
                            </div>
                        </div>
                    </>
                ) }
            </div>
        </div>
        <Testimonials />
        <Footer />
    </div>
  )
}

export default Checkout;