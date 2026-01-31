import React, { useState, useContext } from 'react';
import { Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import api from '../hooks/api';
import { AuthContext } from '../context/AuthContextProvider';
import { bookingInputs } from '../Data/formsource';
const EditBooking = ({ item, setEdit }) => {
  const [checkedIn, setCheckedIn] = useState(item.checkedIn);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSelect = (e) => {
    const checked = e.target.checked;
    checked ? setCheckedIn(true) : setCheckedIn(false);
  }

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const newBooking = {
        ...item,
        checkedIn,
      }
      await api.put(`/bookings/${item._id}`, newBooking, {
        headers: { token: `Bearer ${user.token}` }, // must match verifyAdmin
      });
      navigate('/bookings')
    } catch (error) {
      console.log(error);
      
    }
  }

  return (
    <div>
      <h1 className="text-xl md:text-3xl font-extrabold tracking tight mb-[20px] dark:text-gray-400 capitalize">update Booking</h1>
      <div className="lg:flex lg:gap-5 ">
        <div className="flex-[2] mt-5 lg:mt-0">
          <form className='w-full md:flex md:flex-wrap md:gap-[30px] justify-between px-3'>
            {bookingInputs.map((input) => (
              <div className='lg:w-[45%] w-full mt-4 mb-4 md:mt-2 md:mb-2' key={input.id}>
                <TextField
                  disabled
                  value={input.placeholder}
                  className="w-full"
                  placeholder={input.placeholder}
                  label={input.label}
                  variant="outlined"
                  id={input.id}
                  type={input.type}
                />
              </div>
            ))}
            <div className='lg:w-[45%] w-full mt-4 mb-4 md:mt-2 md:mb-2 text-gray-400' >
              <Typography>Room</Typography>
              <Typography>{item.roomTitle} ({item.roomNumbers.length >1 ? item.roomNumbers.map((roomNumber) => `${roomNumber}, `): item.roomNumbers.map((roomNumber) => `${roomNumber}`)})</Typography>
            </div>
            <div className='lg:w-[45%] w-full mt-4 mb-4 md:mt-0 md:mb-2'>
                <FormControlLabel
                    label="Checked In"
                    labelPlacement="start"
                    control={
                      <Checkbox
                        checked = {checkedIn}
                        onChange={(handleSelect) }
                      />
                    }
                  />
              </div>
              <div className="w-[100%] flex flex-row-reverse justify-start gap-[10px] lg:pr-4">
                <button className="py-[10px] px-[20px] text-white bg-teal-800 font-body cursor-pointer rounded-sm" onClick = {handleClick}>Send</button>
                <button className="py-[10px] px-[20px] text-white bg-red-400 font-body cursor-pointer rounded-sm" onClick = {() => setEdit(false)}>Cancel</button>
              </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditBooking;