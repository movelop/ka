import React, { useContext } from 'react';
import { MdOutlineCancel, MdEmail } from 'react-icons/md';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context/ContextProvider';
import { Button } from '.';
import avatar from '../Data/avatar.jpg';
import { AuthContext } from '../context/AuthContextProvider';

const UserProfile = () => {
  const { currentColor, setIsClicked, initialState } = useStateContext();
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsClicked(initialState);
  }

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGOUT' });
    setIsClicked(initialState);
    navigate('/login');
  }

  return (
    <div className='nav-item absolute right-1 top-16 z-50'>
  {/* Backdrop */}
  <div
    className="fixed inset-0 z-40"
    onClick={handleClose}
    aria-hidden="true"
  />

  {/* Card */}
  <div className="
    relative z-50
    bg-white dark:bg-[#2d3139]
    rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40
    w-80 overflow-hidden
    border border-gray-100 dark:border-gray-700/50
    animate-fade-in
  ">

    {/* Header banner */}
    <div
      className="h-16 w-full"
      style={{
        background: `linear-gradient(135deg, ${currentColor}cc, ${currentColor}88)`,
      }}
    />

    {/* Close button */}
    <button
      onClick={handleClose}
      className="
        absolute top-3 right-3
        p-1.5 rounded-full
        bg-white/20 hover:bg-white/35
        text-white transition-all duration-150
        active:scale-90
      "
      aria-label="Close profile"
    >
      <MdOutlineCancel className="text-lg" />
    </button>

    {/* Avatar — overlapping the banner */}
    <div className="px-6 pb-6">
      <div className="flex items-end gap-4 -mt-10 mb-4">
        <div className="relative">
          <img
            src={user.image || avatar}
            alt="avatar"
            className="
              rounded-full h-20 w-20 object-cover
              ring-4 ring-white dark:ring-[#2d3139]
              shadow-md
            "
          />
          {/* Online dot */}
          <span className="
            absolute bottom-1 right-1
            w-3.5 h-3.5 rounded-full bg-green-400
            ring-2 ring-white dark:ring-[#2d3139]
          " />
        </div>

        {/* Name + role beside avatar bottom-aligned */}
        <div className="mb-1">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-base leading-tight">
            {`${user.firstName} ${user.lastName}`}
          </p>
          {user.isAdmin && (
            <span className="
              inline-block mt-1
              text-xs font-medium px-2 py-0.5 rounded-full
              bg-blue-50 dark:bg-blue-900/30
              text-blue-600 dark:text-blue-300
            ">
              Administrator
            </span>
          )}
        </div>
      </div>

      {/* Email row */}
      <div className="
        flex items-center gap-2.5
        px-3 py-2.5 rounded-xl
        bg-gray-50 dark:bg-gray-800/50
        border border-gray-100 dark:border-gray-700/50
        mb-5
      ">
        <MdEmail className="text-gray-400 dark:text-gray-500 text-base flex-shrink-0" />
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </p>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="
          w-full flex items-center justify-center gap-2
          py-2.5 px-4 rounded-xl
          text-white font-medium text-sm
          transition-all duration-200
          hover:opacity-90 hover:shadow-lg active:scale-95
        "
        style={{
          background: `linear-gradient(135deg, ${currentColor}, ${currentColor}cc)`,
          boxShadow: `0 4px 14px ${currentColor}50`,
        }}
      >
        <ExitToAppIcon className="text-base" />
        Logout
      </button>
    </div>
  </div>
</div>
  )
}

export default UserProfile;