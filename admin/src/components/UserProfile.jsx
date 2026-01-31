import React, { useContext } from 'react';
import { MdOutlineCancel } from 'react-icons/md';
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
    <div className='nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96'>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
                <Button 
                    icon={<MdOutlineCancel />}
                    color="rgb(153, 171, 180)"
                    handleClick={handleClose}
                    bgHoverColor='light-gray'
                    size='2xl'
                    borderRadius='50%'
                />
            </div>
            <div className="flex gap-5 items-center mt-6 border-b-1 border-color pb-6">
                <img src={user.image || avatar} alt="avatar" className='rounded-full h-24 w-24' />
                <div>
                    <p className="font-semibold text-gray-200 text-xl">{`${user.firstName} ${user.lastName}`}</p>
                    {user.isAdmin && <p className="text-gray-500 text-sm dark:text-gray-400">Administrator</p>}
                    <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">{user.email}</p>
                </div>
            </div>
            <div className="mt-5">
                <Button
                    icon = { <ExitToAppIcon />}
                    color='white'
                    bgColor={currentColor}
                    text='Logout'
                    borderRadius='10px'
                    width='full'
                    handleClick={handleLogout}
                />
            </div>
        </div>
  )
}

export default UserProfile;