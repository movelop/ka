import React from 'react'
import { Link, useLocation } from 'react-router-dom';

import { BookingTable, Datatable, Header } from '../components';

const List = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split('/')[1]
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl overflow-hidden">
  <div className="flex justify-between items-center mb-4">
    <Header category={path} title={`All ${path}`} />

    <Link
      to={`/${path}/new`}
      className="text-sm md:text-lg text-green-800 px-3 py-1 border border-green-800 rounded-lg hover:text-white hover:bg-green-800 transition"
    >
      Add New
    </Link>
  </div>

  <div className="h-[600px] overflow-hidden">
    {path === 'bookings' ? (
      <BookingTable columns={columns} path={path} />
    ) : (
      <Datatable columns={columns} path={path} />
    )}
  </div>
</div>

  )
}

export default List;