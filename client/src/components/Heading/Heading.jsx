import React from 'react';

import { Navbar } from '../';
import { HeadingSearch } from '..';
import './Heading.css';

const Heading = ({ img }) => {
  return (
    <div className="heading">
      {/* Background image rendered as a dedicated layer for crisp rendering */}
      <div
        className="headingBg"
        style={{ backgroundImage: `url(${img})` }}
        aria-hidden="true"
      />

      {/* Navbar sits outside the overlay — independent stacking context */}
      <Navbar />

      {/* Gradient overlay */}
      <div className="headingOverlay">
        <div className="headingContainer">
          <div className="headingTexts">

            {/* "WELCOME TO" with flanking lines */}
            <h6>Welcome to</h6>

            {/* Main name */}
            <h2>K.A</h2>

            {/* Subtitle */}
            <h4>Hotel &amp; Suites</h4>

            {/* Gold divider */}
            <div className="headingTexts__divider" />

            {/* Tagline */}
            <p>Experience Luxury Redefined at Unbeatable Rates — Book Your Stay Today.</p>

          </div>
        </div>

        {/* Animated scroll cue */}
        <div className="headingScroll">
          <div className="headingScroll__line" />
          <span>Scroll</span>
        </div>
      </div>

      {/* Floating search bar */}
      <div className="headerSearch">
        <HeadingSearch />
      </div>
    </div>
  );
};

export default Heading;