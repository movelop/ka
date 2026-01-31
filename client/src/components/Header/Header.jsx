import React from 'react';

import './Header.css';

const Header = ({ name, desc }) => {
  return (
    <div className="header">
        <div className="headerContainer">
            <h3>{ name }</h3> 
            <p>{ desc }</p>
        </div>
    </div>
  )
}

export default Header;