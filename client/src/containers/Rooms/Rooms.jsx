import React, { useEffect } from 'react';

import { Heading, Header, Testimonials, Footer, RoomDetails, Loading } from '../../components';
import { images } from '../../Data/dummy';
import useFetch from '../../hooks/useFetch';
import './Rooms.css';

const name = 'Rooms & Rates';
const desc = 'Each of our bright, well-lit rooms is carefully designed and fully equipped to provide everything you need for a comfortable stay. Beyond comfort, we place strong emphasis on refined design — featuring sleek, contemporary furnishings and tasteful interiors that create a modern, relaxing atmosphere.';

const Rooms = () => {
  const { data, loading } = useFetch('/rooms');

  useEffect(() => {
    document.title = "K.A Hotel & Suites — Rooms";
  }, []);

  return (
    <div>
      <Heading img={images.room} />
      <Header name={name} desc={desc} />

      <div className="rooms">
        <div className="roomsContainer">
          {loading ? (
              <Loading text="Loading rooms…" />
            ) : (
              data?.rooms
                ?.filter((item) => item.title !== "BQ")
                .map((item) => (
                  <RoomDetails key={item._id} item={item} />
                ))
            )}
        </div>
      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Rooms;