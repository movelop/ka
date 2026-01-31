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
    <div className='flex justify-between p-2 md:ml-6 md:mr-6 relative'>
      <NavButton title='Menu' customFunc={handleActiveMenu} color={currentColor} icon={<AiOutlineMenu />} />
      <div className="flex">
        <Tooltip title='Profile' placement='bottom'>
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={() => handleClick('userProfile')}
          >
            <img src={user?.image || avatar} alt="user-profile" className='rounded-full h-8 w-8 object-cover' />
            <p>
              <span className="text-gray-400 text-14">Hi,</span>{' '}
              <span className="text-gray-400 font-bold ml-1 text-14 capitalize">
                {user?.firstName}
              </span>
            </p>
            <MdKeyboardArrowDown className="text-gray-400 text-14" />
          </div>
        </Tooltip>
        {isClicked.userProfile && (<UserProfile />)}
      </div>
    </div>
  )
}

export default Navbar;