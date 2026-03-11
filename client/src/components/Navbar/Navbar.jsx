import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdCancel } from 'react-icons/md';

import { navData } from '../../Data/dummy';
import './Navbar.css';

const Navbar = () => {
  const [toggleNav, setToggleNav] = useState(false);
  const [colorChange, setColorChange] = useState(false);

  // useEffect to properly add/remove the scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setColorChange(window.scrollY >= 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change / outside click
  const closeMenu = () => setToggleNav(false);

  return (
    <div className={`navbar${colorChange ? ' colorChange' : ''}`}>
      <div className="navbarContainer">

        {/* ── Logo ── */}
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <div className="logoText">
              <h1>K.A</h1>
              <h3>Hotel &amp; Suites</h3>
            </div>
          </Link>
        </div>

        {/* ── Desktop Links ── */}
        <ul className="links">
          <NavLink
            to="/"
            className="navLink"
            style={({ isActive }) => ({ borderBottom: isActive ? '1px solid transparent' : '' })}
            end
          >
            <span>Home</span>
          </NavLink>
          {navData.map((link, index) => (
            <NavLink
              key={index}
              to={`/${link.link}`}
              className="navLink"
              style={({ isActive }) => ({ borderBottom: isActive ? '1px solid transparent' : '' })}
            >
              <span>{link.name}</span>
            </NavLink>
          ))}
        </ul>

        {/* ── Mobile Toggle ── */}
        <div className="navbarToggle">
          {!toggleNav && (
            <GiHamburgerMenu
              size="22px"
              color="#b8913f"
              onClick={() => setToggleNav(true)}
            />
          )}

          {toggleNav && (
            <div className="navbarSmall">
              <MdCancel className="navbarCancel" onClick={closeMenu} />
              <ul className="navbarSmallLinks">
                <NavLink
                  to="/"
                  className="navLinkSmall"
                  style={({ isActive }) => ({ borderBottom: isActive ? '1px solid transparent' : '' })}
                  onClick={closeMenu}
                  end
                >
                  <span>Home</span>
                </NavLink>
                {navData.map((link, index) => (
                  <NavLink
                    key={index}
                    to={`/${link.link}`}
                    className="navLinkSmall"
                    style={({ isActive }) => ({ borderBottom: isActive ? '1px solid transparent' : '' })}
                    onClick={closeMenu}
                  >
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;