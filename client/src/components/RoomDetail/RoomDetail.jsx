import React from 'react'; 
import { Link } from 'react-router-dom';
import { TbCurrencyNaira } from 'react-icons/tb';

const RoomDetail = ({ item }) => {
    const { _id, title, price, images, description } = item;
  return (
    <div className="room">
        <div className="roomImageContainer"
            style={{
                background: ` no-repeat center/cover url(${images[0]}) `,
            }}
        >
            <div className="imageOverlay"/>
        </div>
        <div className="roomName">
            <h2>{ title }</h2>
        </div>
        <div className="roomSummary">
            <div className="roomSummaryText">
                <p>{ description }</p>
            </div>
            <div className="actionButton">
                <div className="roomPrice">
                    <TbCurrencyNaira />
                    <span>{price.toLocaleString("en-US")}</span>
                </div>
                <Link 
                    to={`/rooms/${_id}`}
                    state={{ data: item }}
                >
                    <button>Explore</button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default RoomDetail