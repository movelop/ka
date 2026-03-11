import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Heading, Testimonials, Footer } from '../../components';
import { images } from '../../Data/dummy';
import './Home.css';

const Home = () => {
  useEffect(() => {
    document.title = "K.A HOTEL AND SUITES";
  }, []);

  return (
    <div className='home'>
      <Heading img={images.homeImage} />

      {/* ── Tagline ── */}
      <div className="complementry">
        <div className="complementry__inner">
          <span className="complementry__label">Our Promise</span>
          <h2>
            At K.A. Hotel and Suites, we pride ourselves on providing a luxurious
            and seamless stay. Guests enjoy uninterrupted electricity, expansive
            parking, and state-of-the-art CCTV surveillance — every detail
            designed for your comfort and total peace of mind.
          </h2>
        </div>
      </div>

      {/* ── Explore Sections ── */}
      <div>

        {/* Section 1 — Rooms */}
        <div className="explore">
          <div className="exploreContainer">
            <div className="exploreTextContainer">
              <div className="exploreTexts">
                <span className="exploreTexts__eyebrow">Accommodations</span>
                <h3>Luxury <em>redefined</em></h3>
                <p>
                  Our rooms are generously spacious and thoughtfully designed for
                  comfort. Each features luxurious beds, flat-screen TVs with cable,
                  complimentary high-speed Wi-Fi, en-suite bathrooms with stand-in
                  showers, premium toiletries, and modern fixtures — a seamless stay
                  for business and leisure alike.
                </p>
                <Link to="/rooms">
                  <button className='exploreButton'>
                    <span>Explore our rooms</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="exploreImageContainer">
              <img src={images.exploreRooms} alt="Luxury hotel room" />
            </div>
          </div>
        </div>

        {/* Section 2 — Facilities */}
        <div className="explore">
          <div className="exploreContainer">
            <div className="exploreTextContainer">
              <div className="exploreTexts">
                <span className="exploreTexts__eyebrow">Facilities</span>
                <h3>Leave your worries <em>at the gate</em></h3>
                <p>
                  Enjoy our elegant restaurant and well-stocked bar, offering local
                  and continental dishes alongside a curated selection of beverages.
                  Conveniently located just a 5-minute drive from Winners Chapel,
                  with dedicated front desk staff ready to welcome you — day or night.
                </p>
                <Link to="/facilities">
                  <button className='exploreButton'>
                    <span>Explore our facilities</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="exploreImageContainer">
              <img src={images.explore2} alt="Hotel facilities" />
            </div>
          </div>
        </div>

      </div>

      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;