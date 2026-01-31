import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../hooks/api';

import { AuthContext } from '../context/AuthContextProvider';
import { EditRoom,EditUser,SingleDetails,EditBooking, EditFacility } from '../components';

const Single = ({ type }) => {
  const [edit, setEdit] = useState(false);
  const [room, setRoom] = useState('');
  const location = useLocation();
  const { data } = location.state;
  const { user } = useContext(AuthContext);
  

  useEffect(() => {
  const getRooms = async () => {
    if (type === 'booking') {
      try {
        const roomsResponse = await api.get("/rooms", {
          headers: { token: `Bearer ${user.token}` },
        });

        // Extract the array safely
        const roomsArray = roomsResponse?.data?.rooms || [];

        // Find the room matching the booking
        const roomData = roomsArray.find(item => item.title === data.roomTitle);

        setRoom(roomData || null);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    }
  };

  if (user && data?.roomTitle) getRooms();
}, [type, data, user]);

  

  return (
    <div>
      <div className='m-2 md:m-10 mt-24 p-[20px] md:p-10 bg-white rounded-3xl relative'>
              <div 
                  className="absolute top-0 right-0 p-[5px] text-sm md:text-lg md:p-[10px] text-[#7451f8] bg-[#7551f818] cursor-pointer rounded-r-lg"
                  onClick={() => setEdit(true)}
              >
                  Edit
              </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking tight mb-[20px] dark:text-gray-400 capitalize">Information</h1>
          <SingleDetails type={type} data={data} img = {room && room.images[0]}  />
      </div>
      
      {edit && <div className="m-2 md:m-10 mt-24 p-[20px] md:p-10 bg-white rounded-3xl">
        {type ===  'room' && (
          <EditRoom item={data} setEdit={setEdit} />
        )}
        {type === 'user' && (
          <EditUser item={data} setEdit={setEdit} />
        )}
        {type === 'facility' && (
          <EditFacility item={data} setEdit={setEdit} />
        )}
        {type === 'booking' && (
          <EditBooking item={data} setEdit={setEdit} />
        )}
      </div>}
    </div>
  )
}

export default Single;