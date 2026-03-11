import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';
import Slider from 'react-slick';

import { Footer, HeadingSmall, Testimonials } from '../../components';
import './SingleRoom.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SingleRoom = () => {
  const location = useLocation();
  const { data } = location.state;
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: false,
  };

  return (
    <div>
      <HeadingSmall text={data?.title} img={data?.images[0]} type="room" />

      <div className="singleRoom">
        <div className="singleRoomContainer">

          {/* ── Title row ── */}
          <div className="singleRoomHeader">
            <div className="singleRoomTitleBlock">
              <h1 className="singleRoomTitle">{data.title}</h1>
              <p className="singleRoomHighlight">
                Book a stay over ₦{data.price.toLocaleString('en-us')} and enjoy complimentary high-speed Wi-Fi
              </p>
            </div>
            <button className="bookNow" onClick={() => navigate('/booking')}>
              <span>Reserve Now</span>
            </button>
          </div>

          {/* ── Slider ── */}
          <div className="singleRoomImages">
            {data.images?.length > 0 && (
              <Slider {...settings}>
                {data.images.map((photo, index) => (
                  <div className="singleRoomImgWrapper" key={index}>
                    <img
                      src={photo}
                      alt={`${data.title} — view ${index + 1}`}
                      className="singleRoomImg"
                    />
                  </div>
                ))}
              </Slider>
            )}
          </div>

          {/* ── Details ── */}
          <div className="singleRoomDetails">

            {/* Description */}
            <div className="singleRoomDetailsTexts">
              <h2 className="singleRoomTitle">{data.title}</h2>
              <p className="singleRoomDesc">{data.description}</p>
            </div>

            {/* Price card */}
            <div className="singleRoomDetailsPrice">
              <h1>Perfect for your night stay</h1>
              <span>
                A fully renovated, soundproofed room with a furnished balcony,
                premium bedding, and all modern amenities.
              </span>
              <h2>
                <b>
                  <span><TbCurrencyNaira /></span>
                  {data.price.toLocaleString('en-us')}
                </b>
                <small>/ night</small>
              </h2>
              <Link to="/booking">
                <button><span>Reserve or Book Now</span></button>
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