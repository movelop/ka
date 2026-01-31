import React from 'react';

import { Navbar } from '../';
import { HeadingSearch } from '..'
import './Heading.css';

const Heading = ({ img }) => {
  

  return (
    <div className="heading"
      style={{
        background: ` no-repeat center/cover url(${img}) `,
      }}
    >
        <div className="headingOverlay">
            <Navbar />
            <div className="headingContainer">
              <div className="headingTexts">
                <h6>WELCOME TO</h6>
                <h2>K.A</h2>
                <h4>HOTEL & SUITES</h4>
                <p>Experience Luxury Redefined at Unbeatable Rates – Book Your Stay Today!
                </p>
              </div>
            </div>
        </div>
        <div className="headerSearch">
          <HeadingSearch />
        </div>
    </div>
  )
}

export default Heading