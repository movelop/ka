import React from 'react';

import { Navbar, HeadingSearch } from '../'
import './HeadingSmall.css';

const HeadingSmall = ({ img, text, type }) => {
  return (
    <div className='small'
      style={{
        background: ` no-repeat center/cover url(${img}) `,
      }}
    >
      <div className="smallOverlay">
        <Navbar />
        <div className="smallText">
            <h3>{text}</h3>
        </div>
      </div>
      {type==='room' && (
        <div className="smallHeadingSearch">
          <HeadingSearch />
        </div>
      )}
    </div>
  )
}

export default HeadingSmall