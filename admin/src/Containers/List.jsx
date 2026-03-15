import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookingTable, Datatable, Header } from '../components';
import { useStateContext } from '../context/ContextProvider';

const List = ({ columns }) => {
  const location = useLocation();
  const { currentColor, currentMode } = useStateContext();
  const path = location.pathname.split('/')[1];
  const isDark = currentMode === 'Dark';

  return (
    <div className="m-2 md:m-10 mt-8 p-6 md:p-8 dark:bg-secondary-dark-bg bg-white rounded-2xl">

      {/* Toolbar */}
      <div className="flex justify-between items-start mb-6">
        <Header category="Management" title={`All ${path}`} />

        <Link
          to={`/${path}/new`}
          className="
            inline-flex items-center gap-2
            text-sm font-semibold px-4 py-2.5
            rounded-xl transition-all duration-200
            hover:opacity-90 hover:shadow-lg active:scale-95
            text-white shrink-0 mt-1
          "
          style={{
            backgroundColor: currentColor,
            boxShadow: `0 4px 14px ${currentColor}35`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New
        </Link>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}
      >
        {path === 'bookings' ? (
          <BookingTable columns={columns} path={path} />
        ) : (
          <Datatable columns={columns} path={path} />
        )}
      </div>

    </div>
  );
};

export default List;