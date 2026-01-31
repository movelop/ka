import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdOutlineCancel } from 'react-icons/md';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Tooltip } from '@mui/material';

import { links } from '../Data/dummy';
import { useStateContext } from '../context/ContextProvider';
import { AuthContext } from '../context/AuthContextProvider';

const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } = useStateContext();
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  }
  const handleCloseSidebar = ()=> {
    if(activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2';
  const normalLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2';

  return (
    <div className='h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10'>
      { activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link
              to="/"
              onClick={handleCloseSidebar}
              className="flex items-center gap-3 ml-3 mt-4 text-xl font-extrabold tracking-tight text-gray-700 dark:text-slate-900"
            >
              K.A HOTEL & SUITES
            </Link>
            <Tooltip>
              <button
                type='button'
                onClick={() => setActiveMenu(!activeMenu)}
                style={{ color: currentColor }}
                className='text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden'
              >
                <MdOutlineCancel />
              </button>
            </Tooltip>
          </div>
          <div className="mt-10">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  <NavLink
                    key={link.name}
                    to={`/${link.name}`}
                    onClick={handleCloseSidebar}
                    style={({ isActive }) => ({ backgroundColor: isActive? currentColor : ''})}
                    className={({ isActive }) => (isActive ? activeLink : normalLink)}
                  >
                    {link.icon}
                    <span className='capitalize'>{link.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
            <div>
              <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                actions
              </p>
              <p className={normalLink}
                onClick={handleLogout}
              >
                <ExitToAppIcon />
                <span className='capitalize'>Logout</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Sidebar;