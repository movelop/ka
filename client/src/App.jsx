import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import './App.css';

// Lazy-load every page: each becomes its own JS chunk, so visiting
// /menu no longer pulls in Home's, Rooms', or Facilities' images.
const Home         = lazy(() => import('./containers/Home/Home'));
const Facilities   = lazy(() => import('./containers/Facilities/Facilities'));
const Rooms        = lazy(() => import('./containers/Rooms/Rooms'));
const SingleRoom   = lazy(() => import('./containers/SingleRoom/SingleRoom'));
const Contact      = lazy(() => import('./containers/Contact/Contact'));
const Menu         = lazy(() => import('./containers/Menu/Menu'));
const Booking      = lazy(() => import('./containers/Booking/Booking'));
const Existing     = lazy(() => import('./containers/Booking/Existing/Existing'));
const Checkout     = lazy(() => import('./containers/Booking/Checkout/Checkout'));
const Confirmation = lazy(() => import('./containers/Booking/Confirmation/Confirmation'));
const NoPage       = lazy(() => import('./containers/NoPage/NoPage'));

// Shown briefly for every route while its code chunk is being fetched —
// applies uniformly to Home, Rooms, Menu, etc. so no page needs its own
// separate loading state.
const RouteLoader = () => (
  <div className="routeLoader">
    <div className="routeLoader__ring" />
  </div>
);

const App = () => {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className='app'>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/facilities' element={<Facilities />} />
          <Route path='/rooms' element={<Rooms />} />
          <Route path='/rooms/:id' element={<SingleRoom />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='*' element={<NoPage />} />
          <Route path='/booking' element={<Booking />} />
          <Route path='/booking/existing' element={<Existing />} />
          <Route path='/booking/checkout' element={<Checkout />} />
          <Route path='/booking/confirmation' element={<Confirmation />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;