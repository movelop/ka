import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdCancel } from 'react-icons/md';

import { navData } from '../../Data/dummy';
import './Navbar.css';

const Navbar = () => {
  const [toggleNav, setToggleNav] = useState(false);
  const [colorChange, setColorChange] = useState(false);

  const changeNavbarColor = () =>{
    if(window.scrollY >= 10){
      setColorChange(true);
    }
    else{
      setColorChange(false);
    }
 };
 window.addEventListener('scroll', changeNavbarColor);

  return (
    <div className={colorChange ? 'navbar colorChange': 'navbar'}>
      <div className="navbarContainer">
        <div className="logo">
          <Link to="/">
            <div className="logoText">
                <h1>K.A</h1>
                <h3>Hotel & Suites</h3>
            </div>  
          </Link>   
        </div>
        <ul className="links">
          <NavLink
              to={`/`}
              style= {({ isActive }) => ({ borderBottom: isActive ? '4px solid #E0B973' : '' })}
              className='navLink'
              end
            >
              <span className="capitalize">Home</span>
            </NavLink>
          {navData.map((link, index) => (
            <NavLink
              key={index}
              to={`/${link.link}`}
              style= {({ isActive }) => ({ borderBottom: isActive ? '4px solid #E0B973' : '' })}
              className='navLink'
            >
              <span className="capitalize">{link.name}</span>
            </NavLink>
          ))}
        </ul>
        <div className="navbarToggle">
          <GiHamburgerMenu size="27px" color='#E0B973' onClick={() => setToggleNav(true)} />
          { toggleNav && (
            <div className="navbarSmall scale-up-center">
              <MdCancel className='navbarCancel' onClick={() => setToggleNav(false)} />
              <ul className="navbarSmallLinks">
                <NavLink
                  to={`/`}
                  style= {({ isActive }) => ({ borderBottom: isActive ? '3px solid #fff' : '' })}
                  className='navLinkSmall'
                  end
                >
                  <span className="capitalize">Home</span>
                </NavLink>
                {navData.map((link, index) => (
                  <NavLink
                  key={index}
                  to={`/${link.link}`}
                  style= {({ isActive }) => ({ borderBottom: isActive ? '3px solid #fff' : '' })}
                  className='navLinkSmall'
                >
                  <span className="capitalize">{link.name}</span>
                </NavLink>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar