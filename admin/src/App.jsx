import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useStateContext } from './context/ContextProvider';
import { AuthContext } from './context/AuthContextProvider';
import { Home, List, Login, NewBooking, NewFacility, NewRoom, NewUser, Single } from './Containers';
import './App.css';
import AppWrapper from './wrapper/AppWrapper';
import { userColumns, roomColumns, facilityColumns,bookingColumns } from './Data/datatablesource';

const App = () => {
  const { setCurrentColor, setCurrentMode } = useStateContext();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if(currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, [setCurrentColor, setCurrentMode]);

  return (
    <Routes>
      <Route path='/'>
        <Route path = 'login' element= { <Login /> } />
        <Route path='dashboard' element = {
          user ? (
            <AppWrapper>
              <Home />
            </AppWrapper>
          ): (<Navigate to ='/login' />)
        } />
        <Route index element = {
          user ? (
            <AppWrapper>
              <Navigate to = 'dashboard' />
            </AppWrapper>
          ) : (<Navigate to='/login' />)
        }/>
        <Route path='users'>
          <Route index element = {
            user ? (
              <AppWrapper>
                <List columns = { userColumns } />
              </AppWrapper>
            ): (<Navigate to='/login' />)
          }/>
          <Route path='new' element= {
            user ? (
              <AppWrapper>
                <NewUser />
              </AppWrapper>
            ) : (<Navigate to= '/login' />)
          }/>
          <Route path=':userId' element = {
            user ? (
              <AppWrapper>
                <Single type = 'user' />
              </AppWrapper>
            ) : (<Navigate to = '/login' />)
          }/>
        </Route>
        <Route path='facilities'>
          <Route index element={
            user ? (
              <AppWrapper>
                <List columns = { facilityColumns } />
              </AppWrapper>
            ) : (<Navigate to = '/login' />)
          } />
          <Route path="new" element={
            user ? (
                <AppWrapper>
                    <NewFacility />
                </AppWrapper>
            ): (<Navigate to='/login' />)
          }/>
          <Route path=':id' element = {
            user ? (
              <AppWrapper>
                <Single type = 'facility' />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
        </Route>
        <Route path='rooms'>
          <Route index element = {
            user ? (
              <AppWrapper>
                <List columns = { roomColumns } />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
          <Route path='new' element= {
            user ? (
              <AppWrapper>
                <NewRoom />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
          <Route path=':roomId' element= {
            user ? (
              <AppWrapper>
                <Single type='room' />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
        </Route>
        <Route path='bookings'>
          <Route index element= {
            user ? (
              <AppWrapper>
                <List columns={ bookingColumns } />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
          <Route path='new' element= {
            user ? (
              <AppWrapper>
                <NewBooking />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
          <Route path=':bookingId' element= {
            user ? (
              <AppWrapper>
                <Single type='booking' />
              </AppWrapper>
            ) : (<Navigate to='/login' />)
          } />
        </Route>
      </Route>
    </Routes>
  )
}

export default App