import React from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker } from 'react-icons/hi';
import { GiRotaryPhone } from 'react-icons/gi';
import { BsPhoneFill } from 'react-icons/bs';
import { AiFillMail } from 'react-icons/ai';
import './Footer.css';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footerContainer">
        {/* ADDRESS SECTION */}
        <div className="address">
          <div className="addressHotel">
            <h1>K.A</h1>
            <p>HOTEL & SUITES</p>
          </div>

          <div className="addressPlace">
            <p className="addressPlaceInfo">
              <HiLocationMarker className="svg" />
              50, Ige Daramola Street, Iyana Iyesi, Ota, Ogun State
            </p>

            <div className="contact">
              <p><GiRotaryPhone /> Front Desk</p>
              <span>+234 803 988 6484</span>
              <span>+234 816 749 5769</span>
              <span>+234 814 026 6486</span>
            </div>

            <div className="contact">
              <p><BsPhoneFill /> Director</p>
              <span>+234 906 000 8392</span>
              <span>+234 810 656 2129</span>
              <span><AiFillMail /> ifaolokunanimashaun@gmail.com</span>
            </div>

            <p className="addressPlaceInfo">
              <AiFillMail /> info@kuregbeanimashaun.com
            </p>
          </div>
        </div>

        {/* LINKS */}
        <ul className="flinks">
          <Link to="/facilities"><li>Facilities</li></Link>
          <Link to="/contact"><li>Contact us</li></Link>
          <Link to="/rooms"><li>Rooms</li></Link>
        </ul>

        {/* NEWSLETTER */}
        <div className="newsletter">
          <p>Subscribe to our newsletter</p>
          <div className="newsletterInput">
            <input type="email" placeholder="Email address" />
            <button className="btn">OK</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
