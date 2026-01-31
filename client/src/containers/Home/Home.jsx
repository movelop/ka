import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Heading, Testimonials, Footer } from '../../components';
import { images } from '../../Data/dummy';
import './Home.css'

const Home = () => {
  useEffect(() => {
      document.title = "K.A HOTEL AND SUITES";
    }, []);
  return (
    <div className='home'>
        <Heading img = {images.homeImage} />
        <div className="complementry">
          <h2>At K.A. Hotel and Suites, we pride ourselves on providing a luxurious and seamless stay. Guests enjoy uninterrupted electricity, 
            ensuring all comforts and devices remain powered at all times. Our expansive parking facilities guarantee ample space for your vehicles, 
            while our highly trained security personnel, supported by state-of-the-art CCTV surveillance, ensure your safety and peace of mind around 
            the clock. Every aspect of our service is designed to offer convenience, comfort, and total reassurance during your stay.
          </h2>
        </div>
        <div>
          <div className="explore">
            <div className="exploreContainer">
              <div className="exploreTextContainer">
                <div className="exploreTexts">
                  <h3>Luxury redefined</h3>
                  <p>The rooms at K.A. Hotel and Suites are generously spacious and thoughtfully designed for comfort and convenience. Each room features 
                    luxurious beds, ample wardrobe space, flat-screen televisions with cable channels, and complimentary high-speed Wi-Fi. Guests enjoy 
                    en-suite bathrooms equipped with stand-in showers, premium toiletries, and modern fixtures. Additional amenities include telephones, 
                    luggage storage, and functional tables, ensuring a seamless and enjoyable stay for both business and leisure travelers.
                  </p>
                  <Link to="/rooms">
                    <button className='exploreButton'>Explore our rooms</button>
                  </Link>
                </div>
                <div className='line' />
              </div>
              <div className="exploreImageContainer">
                <img src={images.exploreRooms} alt="exploreRooms" />
              </div>
            </div>
          </div>
          <div className="explore">
            <div className="exploreContainer">
              <div className="exploreTextContainer">
                <div className="exploreTexts">
                  <h3>Leave your worries at the gate</h3>
                  <p>K.A. Hotel and Suites features an elegant restaurant and a well-stocked bar, offering guests a variety of local and continental dishes, 
                    as well as a selection of alcoholic and non-alcoholic beverages to enjoy in a comfortable lounge setting. The hotel is conveniently located 
                    just a 5-minute drive from Living Faith Church Worldwide (Winners Chapel).
                    For a smooth check-in experience, guests are requested to contact the hotel in advance using the details provided in their booking 
                    confirmation. Front desk staff will personally welcome you upon arrival. Guests planning to arrive after 10 PM are especially advised 
                    to notify the hotel beforehand to ensure timely check-in arrangements.
                  </p>
                  <Link to="/facilities">
                    <button className='exploreButton'>Explore our facilities</button>
                  </Link>
                </div>
                <div className='line'  />
              </div>
              <div className="exploreImageContainer">
                <img src={images.explore2} alt="exploreRooms" />
              </div>
            </div>
          </div>
        </div>
        <Testimonials />
        <Footer />
    </div>
  )
}

export default Home