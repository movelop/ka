import React from 'react';

import { Navbar, HeadingSearch } from '../';
import './HeadingSmall.css';

const HeadingSmall = ({ img, text, type }) => {
  return (
    <div
      className="small"
      style={{
        background: `no-repeat center/cover url(${img})`,
      }}
    >
      {/* Navbar outside overlay — independent stacking context */}
      <Navbar />

      {/* Gradient overlay */}
      <div className="smallOverlay">
        <div className="smallText">
          <h3>{text}</h3>
        </div>
      </div>

      {/* Search bar — only on room pages */}
      {type === 'room' && (
        <div className="smallHeadingSearch">
          <HeadingSearch />
        </div>
      )}
    </div>
  );
};

export default HeadingSmall;