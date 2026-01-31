import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';
import Slider from 'react-slick';

import { Footer, HeadingSmall, Testimonials } from '../../components';
import './SingleRoom.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const SingleRoom = () => {
  const location = useLocation();
  const { data } = location.state; // data.images is an array of URLs
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

  console.log(data.images); // debug: make sure this prints an array of URLs

  return (
    <div>
      <HeadingSmall text={data?.title} img={data?.images[0]} type='room' />

      <div className="singleRoom">
        <div className="singleRoomContainer">
          <button className="bookNow" onClick={() => navigate('/booking')}>
            Reserve or Book Now!
          </button>

          <h1 className="singleRoomTitle">{data.title}</h1>
          <p className="singleRoomHighlight">
            Book a stay over ₦{data.price.toLocaleString('en-us')} at this property and get access to free WIFI
          </p>

          {/* Slider */}
          <div className="singleRoomImages">
            {data.images?.length > 0 && (
              <Slider {...settings}>
                {data.images.map((photo, index) => (
                  <div className="singleRoomImgWrapper" key={index}>
                    <img src={photo} alt={`room-${index}`} className="singleRoomImg" />
                  </div>
                ))}
              </Slider>
            )}
          </div>

          <div className="singleRoomDetails">
            <div className="singleRoomDetailsTexts">
              <h1 className="singleRoomTitle">{data.title}</h1>
              <p className="singleRoomDesc">{data.description}</p>
            </div>
            <div className="singleRoomDetailsPrice">
              <h1>Perfect for the night stay!</h1>
              <span>
                This is a completely renovated and soundproofed room, all exterior with furnished balcony.
              </span>
              <h2>
                <b>
                  <span><TbCurrencyNaira className='currency' /></span>
                  {data.price.toLocaleString('en-us')}
                </b> per Night
              </h2>
              <Link to='/booking'>
                <button>Reserve or Book Now!</button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default SingleRoom;
