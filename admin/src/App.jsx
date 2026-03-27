import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useStateContext } from './context/ContextProvider';
import { AuthContext } from './context/AuthContextProvider';
import { Home, List, Login, NewBooking, NewFacility, NewRoom, NewUser, Single,BookingReceipt } from './Containers';
import './App.css';
import AppWrapper from './wrapper/AppWrapper';
import { userColumns, roomColumns, facilityColumns, bookingColumns } from './Data/datatablesource';

// Eliminates the repeated ternary pattern across every route
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <AppWrapper>{children}</AppWrapper>;
};

const App = () => {
  const { setCurrentColor, setCurrentMode } = useStateContext();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, [setCurrentColor, setCurrentMode]);

  return (
    <Routes>
      <Route path="/">
        <Route path="login" element={<Login />} />
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />

        {/* Users */}
        <Route path="users">
          <Route index element={
            <ProtectedRoute><List columns={userColumns} /></ProtectedRoute>
          } />
          <Route path="new" element={
            <ProtectedRoute><NewUser /></ProtectedRoute>
          } />
          <Route path=":userId" element={
            <ProtectedRoute><Single type="user" /></ProtectedRoute>
          } />
        </Route>

        {/* Facilities */}
        <Route path="facilities">
          <Route index element={
            <ProtectedRoute><List columns={facilityColumns} /></ProtectedRoute>
          } />
          <Route path="new" element={
            <ProtectedRoute><NewFacility /></ProtectedRoute>
          } />
          <Route path=":id" element={
            <ProtectedRoute><Single type="facility" /></ProtectedRoute>
          } />
        </Route>

        {/* Rooms */}
        <Route path="rooms">
          <Route index element={
            <ProtectedRoute><List columns={roomColumns} /></ProtectedRoute>
          } />
          <Route path="new" element={
            <ProtectedRoute><NewRoom /></ProtectedRoute>
          } />
          <Route path=":roomId" element={
            <ProtectedRoute><Single type="room" /></ProtectedRoute>
          } />
        </Route>

        {/* Bookings */}
        <Route path="bookings">
          <Route index element={
            <ProtectedRoute><List columns={bookingColumns} /></ProtectedRoute>
          } />
          <Route path="new" element={
            <ProtectedRoute><NewBooking /></ProtectedRoute>
          } />
          <Route path='receipt' element ={
            <ProtectedRoute><BookingReceipt/></ProtectedRoute>
          } />
          <Route path=":bookingId" element={
            <ProtectedRoute><Single type="booking" /></ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;