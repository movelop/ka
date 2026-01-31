import React, { useContext, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../hooks/api';
import { useStateContext } from '../context/ContextProvider';
import { AuthContext } from '../context/AuthContextProvider';

const Login = () => {
  const { currentColor } = useStateContext();
  const [credentials, setCredentials] = useState({
    username: undefined,
    password: undefined,
  });
  const { loading, error, dispatch } = useContext(AuthContext);
  const location = useLocation();
  const state = location.state;
  const from = state?.from || '/';
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch({ type: 'LOGIN_START' });
    try {
      const res = await api.post('/auth/login', credentials);
      if(res.data.user.isAdmin) {
       dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            ...res.data?.user,
            token: res.data?.token,
          },
        });
        navigate(from);
      } else{
        dispatch({ type: 'LOGIN_FAILURE', payload: { message: 'You are not an Admin!!!' } });
      }
      navigate(from);
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response.data });
    }
  }
  return (
     <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
            <div className="w-[90%] md:w-[80%] p-6 m-auto bg-white dark:bg-secondary-dark-bg rounded-md shadow-md lg:max-w-xl">
                <h1 className="text-3xl font-semibold text-center dark:text-gray-200 underline">
                   Sign in
                </h1>
                <form className="mt-6">
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username or Email Address" 
                            onChange={ (e) => setCredentials({ ...credentials, username: e.target.value }) }
                            className="block w-full px-4 py-2 mt-2 text-gray-800 dark:text-gray-400 bg-white dark:bg-secondary-dark-bg border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label   className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password" 
                            placeholder="Enter your password" 
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value }) }
                            className="block w-full px-4 py-2 mt-2 text-gray-800 dark:text-gray-400 bg-white dark:bg-secondary-dark-bg border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    {error && 
                        <p    className="text-lg my-2 text-red-600 hover:underline">
                            {error.message}
                        </p>
                    }
                    <div className="mt-6">
                        <button 
                            disabled={loading}
                            onClick={handleLogin}
                            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600"
                            style={{ backgroundColor: currentColor }}
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
  )
}

export default Login;