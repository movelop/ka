import React,{ useEffect, useContext} from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Tooltip } from '@mui/material';
import { jwtDecode } from "jwt-decode";

import avatar from '../Data/avatar.jpg'
import { useStateContext } from '../context/ContextProvider';
import { UserProfile } from '.'
import { AuthContext } from '../context/AuthContextProvider';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    <Tooltip title={ title } placement='bottom' >
        <button 
          type ='button'
          onClick= {() => customFunc()}
          style = {{ color }}
          className='relative text-xl rounded-full p-3 hover:bg-light-gray'
        >
          <span 
            style={{ background: dotColor }}
            className='absolute inline-flex rounded-full h-2 w-2 right-2 top-2'
          >
            {icon}
          </span>
        </button>
    </Tooltip>
)

const Navbar = () => {
  const { currentColor, activeMenu, setActiveMenu, handleClick, isClicked, setScreenSize, screenSize } = useStateContext();
  const { user, dispatch } = useContext(AuthContext);
  
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => window.removeEventListener('resize', handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if(screenSize <= 900) {
      setActiveMenu(false);
    }else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);
  
  useEffect(() => {
    const token = user?.token
    if(token) {
      const decodedToken = jwtDecode(token);

      if(decodedToken.exp * 1000 < new Date().getTime()) {
        dispatch({ type: 'LOGOUT'});
      }
    }
  }, [user, dispatch]);
  
  const handleActiveMenu = () => setActiveMenu(!activeMenu);
  
  return (
    <div className='flex items-center justify-between px-4 py-2 md:px-8 relative'>
  
  {/* Left: Hamburger menu */}
  <NavButton
    title='Menu'
    customFunc={handleActiveMenu}
    color={currentColor}
    icon={<AiOutlineMenu />}
  />

  {/* Right: User profile */}
  <div className="flex items-center">
    <Tooltip title='Profile' placement='bottom' arrow>
      <button
        type="button"
        className="
          flex items-center gap-2.5
          px-3 py-1.5 rounded-xl
          transition-all duration-200 ease-out
          hover:bg-gray-100 dark:hover:bg-gray-800
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-1
          group
        "
        style={{ focusRingColor: `${currentColor}40` }}
        onClick={() => handleClick('userProfile')}
        aria-haspopup="true"
        aria-expanded={isClicked.userProfile}
      >
        {/* Avatar with online indicator */}
        <div className="relative">
          <img
            src={user?.image || avatar}
            alt="User profile"
            className="rounded-full h-8 w-8 object-cover ring-2 ring-white dark:ring-gray-800"
          />
          <span
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 ring-1 ring-white dark:ring-gray-800"
            aria-label="Online"
          />
        </div>

        {/* Name */}
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs text-gray-400 dark:text-gray-500">Hi,</span>
          <span
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize"
          >
            {user?.firstName}
          </span>
        </div>

        {/* Chevron */}
        <MdKeyboardArrowDown
          className={`
            text-gray-400 dark:text-gray-500 text-lg
            transition-transform duration-200
            ${isClicked.userProfile ? 'rotate-180' : 'rotate-0'}
            group-hover:text-gray-600 dark:group-hover:text-gray-300
          `}
        />
      </button>
    </Tooltip>

    {/* Profile dropdown */}
    {isClicked.userProfile && (
      <div className="animate-fade-in">
        <UserProfile />
      </div>
    )}
  </div>

</div>
  )
}

export default Navbar;