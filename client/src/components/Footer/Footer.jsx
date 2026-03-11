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

      {/* ── Main Grid ── */}
      <div className="footerContainer">

        {/* Column 1 — Address */}
        <div className="address">
          <div>
            <span className="footer__colLabel">Our Location</span>
            <div className="addressHotel">
              <h1>K.A</h1>
              <p>Hotel &amp; Suites</p>
            </div>
          </div>

          <div className="addressPlace">
            <p className="addressPlaceInfo">
              <HiLocationMarker />
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
              <AiFillMail />
              info@kuregbeanimashaun.com
            </p>
          </div>
        </div>

        {/* Column 2 — Nav Links */}
        <div>
          <span className="footer__colLabel">Quick Links</span>
          <ul className="flinks">
            <Link to="/"><li>Home</li></Link>
            <Link to="/rooms"><li>Rooms</li></Link>
            <Link to="/facilities"><li>Facilities</li></Link>
            <Link to="/contact"><li>Contact Us</li></Link>
          </ul>
        </div>

        {/* Column 3 — Newsletter */}
        <div className="newsletter">
          <span className="footer__colLabel">Stay Connected</span>
          <p>
            Subscribe to receive exclusive offers, updates, and hospitality
            insights from K.A. Hotel and Suites.
          </p>
          <div className="newsletterInput">
            <input type="email" placeholder="Your email address" />
            <button className="btn">
              <span>Subscribe</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} K.A. Hotel &amp; Suites. All rights reserved.
        </p>
        <div className="footer__socials">
          <a className="footer__socialLink" href="#instagram">Instagram</a>
          <a className="footer__socialLink" href="#facebook">Facebook</a>
          <a className="footer__socialLink" href="#twitter">Twitter</a>
        </div>
      </div>

    </div>
  );
};

export default Footer;