import React from 'react';
import { Link } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';

const RoomDetail = ({ item }) => {
  const { _id, title, price, images, description } = item;

  return (
    <div className="room">

      {/* ── Image ── */}
      <div className="roomImageContainer">
        {/* Using <img> instead of background-image so the CSS zoom works */}
        <img src={images[0]} alt={title} />
        <div className="imageOverlay" />
      </div>

      {/* ── Name bar ── */}
      <div className="roomName">
        <h2>{title}</h2>
      </div>

      {/* ── Summary ── */}
      <div className="roomSummary">
        <div className="roomSummaryText">
          <p>{description}</p>
        </div>

        <div className="actionButton">
          {/* Price */}
          <div className="roomPrice">
            <TbCurrencyNaira />
            <span>{price.toLocaleString('en-US')}</span>
          </div>

          {/* Book button — sliding fill animation via CSS */}
          <Link to={`/rooms/${_id}`} state={{ data: item }}>
            <button><span>Explore</span></button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default RoomDetail;