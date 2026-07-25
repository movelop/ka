import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';
import api from '../../../hooks/api';
import { PaystackButton } from 'react-paystack';

import './Checkout.css';
import { images } from '../../../Data/dummy';
import { Footer, HeadingSmall, Testimonials, Loading } from '../../../components';

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC;

// NOTE: assumes GET /rooms returns every room category with a nightly
// `price` field and a `roomNumbers` array (same shape as the room object
// already passed in via location.state). Adjust the field names below
// (PRICE_FIELD) if your Room model calls it something else.
const PRICE_FIELD = 'price';

let extraCategoryKey = 0;

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
        address: "",
        phone: "",
        identity: "",
    });

    // Extra room categories the guest adds on this page.
    // Each entry: { key, roomId, roomData, quantity, selectedRooms, selectedRoomNumbers }
    const [extraCategories, setExtraCategories] = useState([]);
    const [allRoomTypes, setAllRoomTypes] = useState([]);
    const [roomTypesLoading, setRoomTypesLoading] = useState(false);

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

    // ---- Extra room category handlers ----

    // Fetch every room type once, so the "add another room type" dropdown
    // has options to choose from (excluding the category already selected).
    useEffect(() => {
        // Extra categories only make sense when the guest is taking more
        // than one room of the primary type — skip the fetch otherwise.
        if (options.rooms <= 1) return;

        const fetchRoomTypes = async () => {
            setRoomTypesLoading(true);
            try {
                const res = await api.get('/rooms');
                const list = Array.isArray(res.data) ? res.data : res.data.rooms;
                setAllRoomTypes((list || []).filter((r) => r._id !== room._id));
            } catch (err) {
                // Non-fatal: guest just won't be able to add extra categories
                setAllRoomTypes([]);
            } finally {
                setRoomTypesLoading(false);
            }
        };
        fetchRoomTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If options.rooms is only 1, extra categories should never be active —
    // guard against stale state (e.g. browser back/forward navigation).
    useEffect(() => {
        if (options.rooms <= 1 && extraCategories.length > 0) {
            setExtraCategories([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.rooms]);

    const addCategory = () => {
        setExtraCategories((prev) => [
            ...prev,
            {
                key: extraCategoryKey++,
                roomId: "",
                roomData: null,
                quantity: 1,
                selectedRooms: [],
                selectedRoomNumbers: [],
            },
        ]);
    };

    const removeCategory = (key) => {
        setExtraCategories((prev) => prev.filter((c) => c.key !== key));
    };

    const updateCategory = (key, changes) => {
        setExtraCategories((prev) =>
            prev.map((c) => (c.key === key ? { ...c, ...changes } : c))
        );
    };

    const handleCategoryRoomChange = (key, roomId) => {
        const roomData = allRoomTypes.find((r) => r._id === roomId) || null;
        updateCategory(key, {
            roomId,
            roomData,
            selectedRooms: [],
            selectedRoomNumbers: [],
        });
    };

    const handleCategoryQuantityChange = (key, quantity) => {
        setExtraCategories((prev) => {
            const otherTotal = prev
                .filter((c) => c.key !== key)
                .reduce((sum, c) => sum + c.quantity, 0);
            // Leave at least 0 rooms for the primary category, and never
            // let this single category exceed the total the guest committed to.
            const maxAllowed = Math.max(1, options.rooms - otherTotal);
            const clamped = Math.min(maxAllowed, Math.max(1, Number(quantity) || 1));
            return prev.map((c) =>
                c.key === key
                    ? { ...c, quantity: clamped, selectedRooms: [], selectedRoomNumbers: [] }
                    : c
            );
        });
    };

    const handleCategoryRoomSelect = (key, e) => {
        const checked = e.target.checked;
        const value = e.target.value;
        const name = e.target.name;

        setExtraCategories((prev) =>
            prev.map((c) => {
                if (c.key !== key) return c;
                return {
                    ...c,
                    selectedRooms: checked
                        ? [...c.selectedRooms, value]
                        : c.selectedRooms.filter((v) => v !== value),
                    selectedRoomNumbers: checked
                        ? [...c.selectedRoomNumbers, name]
                        : c.selectedRoomNumbers.filter((v) => v !== name),
                };
            })
        );
    };

    const categoryLineTotal = (category) => {
        if (!category.roomData) return 0;
        const nightlyPrice = Number(category.roomData[PRICE_FIELD]) || 0;
        const pricePerRoom = nightlyPrice * days;
        return pricePerRoom * category.quantity;
    };

    // The guest committed to `options.rooms` total rooms on the search page.
    // Extra categories REDISTRIBUTE that fixed count across room types —
    // they don't add more rooms on top of it. Example: options.rooms = 2,
    // guest can split that into 1 Deluxe + 1 Executive, but never 2 + 1 = 3.
    const extraCategoriesQuantityTotal = extraCategories.reduce(
        (sum, c) => sum + c.quantity,
        0
    );
    const rawPrimaryQuantity = options.rooms - extraCategoriesQuantityTotal;
    const isOverAllocated = rawPrimaryQuantity < 0;
    const primaryQuantity = Math.max(0, rawPrimaryQuantity);

    // You can't have more distinct room TYPES than rooms selected — each
    // type needs at least 1 room, so once (primary + extras) reaches
    // options.rooms, there's no room left to give a brand-new category.
    const maxCategoriesReached = extraCategories.length + 1 >= options.rooms;
    const addCategoryDisabled = roomTypesLoading || allRoomTypes.length === 0 || primaryQuantity === 0 || maxCategoriesReached;

    const primarySubtotal = primaryQuantity * days * (Number(room[PRICE_FIELD]) || 0);

    const extraCategoriesTotal = extraCategories.reduce(
        (sum, c) => sum + categoryLineTotal(c),
        0
    );

    const grandTotal = primarySubtotal + extraCategoriesTotal;

    // If room categories are added/adjusted, the number of primary rooms
    // the guest needs to pick shifts too — clear stale selections so the
    // count can't silently mismatch.
    useEffect(() => {
        setSelectedRooms([]);
        setSelectedRoomNumbers([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [primaryQuantity]);

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

        if (isOverAllocated) {
            setMsg(`You can only select ${options.rooms} room(s) in total across all room types`);
            return setError(true);
        }

        if (primaryQuantity > 0 && selectedRooms.length !== primaryQuantity) {
            setMsg(`you must select exactly ${primaryQuantity} ${room.title} room(s)`);
            return setError(true);
        }

        if (options.rooms > 1) {
            for (const category of extraCategories) {
                if (!category.roomData) {
                    setMsg("Choose a room type for every extra category you added, or remove it");
                    return setError(true);
                }
                if (category.selectedRooms.length !== category.quantity) {
                    setMsg(`You must select exactly ${category.quantity} ${category.roomData.title} room(s)`);
                    return setError(true);
                }
            }
        }

        setPay(true);
        setError(false);
    }


    const handleSuccess = async (reference) => {
        const roomsPayload = [
            ...(primaryQuantity > 0
                ? [
                      {
                          roomTitle: room.title,
                          numberOfRooms: primaryQuantity,
                          selectedRooms: selectedRooms,
                          roomNumbers: selectedRoomNumbers,
                          pricePerRoom: (Number(room[PRICE_FIELD]) || 0) * days,
                      },
                  ]
                : []),
            ...extraCategories.map((c) => ({
                roomTitle: c.roomData.title,
                numberOfRooms: c.quantity,
                selectedRooms: c.selectedRooms,
                roomNumbers: c.selectedRoomNumbers,
                pricePerRoom: Number(c.roomData[PRICE_FIELD]) * days,
            })),
        ];

        const newBooking = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            address: formData.address,
            phone: formData.phone,
            identity: formData.identity,
            rooms: roomsPayload,
            adults: options.adults,
            children: options.children,
            startDate: dates[0].startDate,
            endDate: dates[0].endDate,
            paymentReference: reference,
        }

        const allSelectedRoomIds = roomsPayload.flatMap((r) => r.selectedRooms);

        setLoading(true);
        try {
            const verifyRes = await api.get(`/bookings/verify-payment/${reference}`);
            if(verifyRes.data.data.status === 'success'){
                try {
                    await Promise.all(
                        allSelectedRoomIds.map((roomId) => {
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
        amount: grandTotal * 100,
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
                                        <h4>{room.title} ({primaryQuantity})</h4>
                                        <span><TbCurrencyNaira />{primarySubtotal.toLocaleString("en-US")}</span>
                                    </div>
                                </>
                            )}

                            {options.rooms > 1 && extraCategories.map((category) => (
                                <div className="extraCategoryRow" key={category.key}>
                                    <div>
                                        <h4>{category.roomData ? category.roomData.title : 'Extra room type'} ({category.quantity}):</h4>
                                        <span>
                                            <TbCurrencyNaira />{categoryLineTotal(category).toLocaleString("en-US")}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isOverAllocated && (
                                <div className="alert">
                                    ⚠ You've allocated more rooms than you selected ({options.rooms}). Reduce a room type's quantity or remove a category.
                                </div>
                            )}

                            <div>
                                <h4>Total</h4>
                                <span style={{ fontWeight: "bold" }}><TbCurrencyNaira />{grandTotal.toLocaleString("en-US")}</span>
                            </div>

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
                                    <label>Address</label>
                                    <input 
                                        type="text"
                                        onChange={handleChange}
                                        required
                                        className='guestDetailsInput'
                                        name='address'
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
                                {primaryQuantity > 0 && (
                                    <div className="selectRoomContainer">
                                        <label>Select your preferred room number(s) — {room.title} (choose {primaryQuantity})</label>
                                        <div className="selectRoom">
                                            {room.roomNumbers.map((roomNumber) => (
                                                    <div className="optionsBoxes" key ={roomNumber._id}>
                                                        <label>{roomNumber.number}</label>
                                                        <input
                                                            className='checkbox'
                                                            type="checkbox"
                                                            value={roomNumber._id}
                                                            name= {roomNumber.number}
                                                            checked={selectedRooms.includes(roomNumber._id)}
                                                            onChange={handleSelect}
                                                            disabled={!isAvailable(roomNumber)}
                                                        />
                                                    </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {options.rooms > 1 && (
                                    <>
                                        {extraCategories.map((category) => (
                                            <div className="selectRoomContainer extraCategoryContainer" key={category.key}>
                                                <div className="extraCategoryHeader">
                                                    <label>Extra room type</label>
                                                    <button
                                                        type="button"
                                                        className="removeCategory"
                                                        onClick={() => removeCategory(category.key)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <select
                                                    value={category.roomId}
                                                    onChange={(e) => handleCategoryRoomChange(category.key, e.target.value)}
                                                    disabled={roomTypesLoading}
                                                >
                                                    <option value="">
                                                        {roomTypesLoading ? 'Loading room types...' : 'Select room type'}
                                                    </option>
                                                    {allRoomTypes.map((r) => (
                                                        <option key={r._id} value={r._id}>{r.title}</option>
                                                    ))}
                                                </select>

                                                {category.roomData && (
                                                    <>
                                                        <div className="guestFormInput">
                                                            <label>Number of {category.roomData.title} rooms</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={category.quantity}
                                                                onChange={(e) => handleCategoryQuantityChange(category.key, e.target.value)}
                                                            />
                                                        </div>

                                                        <label>Select your preferred room number(s) — {category.roomData.title}</label>
                                                        <div className="selectRoom">
                                                            {category.roomData.roomNumbers.map((roomNumber) => (
                                                                <div className="optionsBoxes" key={roomNumber._id}>
                                                                    <label>{roomNumber.number}</label>
                                                                    <input
                                                                        className='checkbox'
                                                                        type="checkbox"
                                                                        value={roomNumber._id}
                                                                        name={roomNumber.number}
                                                                        checked={category.selectedRooms.includes(roomNumber._id)}
                                                                        onChange={(e) => handleCategoryRoomSelect(category.key, e)}
                                                                        disabled={!isAvailable(roomNumber)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            className="addCategory"
                                            onClick={addCategory}
                                            disabled={addCategoryDisabled}
                                        >
                                            + Add another room type
                                        </button>
                                        {addCategoryDisabled && !roomTypesLoading && allRoomTypes.length > 0 && (
                                            <p className="allocationHint">
                                                {maxCategoriesReached
                                                    ? `You can't have more room types than rooms selected (${options.rooms}). Remove one to add a different type.`
                                                    : `All ${options.rooms} room(s) are allocated. Reduce a quantity above to free up a room for another type.`}
                                            </p>
                                        )}
                                    </>
                                )}
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