import { useState, useEffect, useContext, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDatesInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.getTime());
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const cancelRoomAvailability = (selectedRooms, alldates, token) =>
  Promise.all(
    selectedRooms.map((roomId) =>
      api.put(
        `/rooms/availability/${roomId}/cancel`,
        { dates: alldates },
        { headers: { token: `Bearer ${token}` } }
      )
    )
  );

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ row, onCheckin, onCheckout }) => {
  if (row.cancelled) {
    return <span className="py-1 px-2 text-xs font-medium text-red-700 border border-dotted border-red-400 rounded bg-red-50">Cancelled</span>;
  }
  if (row.checkedIn && row.checkedOut) {
    return <span className="py-1 px-2 text-xs font-medium text-gray-500 border border-dotted border-gray-400 rounded bg-gray-50">Checked Out</span>;
  }
  if (row.checkedIn && !row.checkedOut) {
    return (
      <button type="button" onClick={() => onCheckout(row)}
        className="py-1 px-2 text-xs font-medium text-orange-700 border border-dotted border-orange-500 rounded hover:bg-orange-50 transition-colors cursor-pointer">
        Check Out
      </button>
    );
  }
  return (
    <button type="button" onClick={() => onCheckin(row)}
      className="py-1 px-2 text-xs font-medium text-green-700 border border-dotted border-green-600 rounded hover:bg-green-50 transition-colors cursor-pointer">
      Check In
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingTable = ({ columns, path }) => {
  const { data, loading, error } = useFetch(`/${path}`);
  const { user } = useContext(AuthContext);

  const [list,        setList]        = useState([]);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [actionError, setActionError] = useState(null);

  // Sync fetched data into list
  useEffect(() => {
    if (data?.[path]) setList(data[path]);
  }, [data, path]);

  // Derive filtered list — no state mutation on search
  const filteredList = searchTerm.trim()
    ? list.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : list;

  // ── Delete ──
  const handleDelete = useCallback(async (row) => {
    setActionError(null);
    const alldates = getDatesInRange(row.startDate, row.endDate);
    try {
      await cancelRoomAvailability(row.selectedRooms, alldates, user?.token);
      await api.delete(`/${path}/${row._id}`, {
        headers: { token: `Bearer ${user?.token}` },
      });
      setList((prev) => prev.filter((item) => item._id !== row._id));
    } catch (err) {
      console.error('Delete failed:', err);
      setActionError('Failed to delete booking. Please try again.');
    }
  }, [path, user?.token]);

  // ── Check Out ──
  const handleCheckout = useCallback(async (row) => {
    setActionError(null);
    const alldates = getDatesInRange(row.startDate, row.endDate);
    try {
      await cancelRoomAvailability(row.selectedRooms, alldates, user?.token);
      await api.put(`/bookings/${row._id}`, { checkedOut: true }, {
        headers: { token: `Bearer ${user?.token}` },
      });
      setList((prev) =>
        prev.map((b) => (b._id === row._id ? { ...b, checkedOut: true } : b))
      );
    } catch (err) {
      console.error('Checkout failed:', err);
      setActionError('Failed to check out. Please try again.');
    }
  }, [user?.token]);

  // ── Check In ──
  const handleCheckin = useCallback(async (row) => {
    setActionError(null);
    try {
      await api.put(`/bookings/${row._id}`, { ...row, checkedIn: true }, {
        headers: { token: `Bearer ${user?.token}` },
      });
      setList((prev) =>
        prev.map((b) => (b._id === row._id ? { ...b, checkedIn: true } : b))
      );
    } catch (err) {
      console.error('Checkin failed:', err);
      setActionError('Failed to check in. Please try again.');
    }
  }, [user?.token]);

  // ── Action Columns ──
  const actionColumns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <StatusBadge
          row={params.row}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/${path}/${params.row._id}`}
            state={{ data: params.row }}
            className="py-1 px-2 text-xs font-medium text-blue-700 border border-dotted border-blue-500 rounded hover:bg-blue-50 transition-colors"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(params.row)}
            className="py-1 px-2 text-xs font-medium text-red-700 border border-dotted border-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-[500px] flex flex-col gap-3 overflow-hidden min-w-0 w-full">

      {/* ── Search ── */}
      <input
        type="text"
        placeholder="Search bookings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search bookings"
        className="w-full sm:w-[400px] border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark-bg dark:text-gray-200 h-10 px-5 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors shrink-0"
      />

      {/* ── Error Banners ── */}
      {error       && <p role="alert" className="text-sm text-red-500">Failed to load bookings.</p>}
      {actionError && <p role="alert" className="text-sm text-red-500">{actionError}</p>}

      {/* ── DataGrid ── */}
      <div className="flex-1 overflow-auto min-w-0">
        <DataGrid
          className="datagrid"
          rows={filteredList}
          columns={[...columns, ...actionColumns]}
          pageSize={9}
          rowsPerPageOptions={[9]}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row) => row._id}
          loading={loading}
        />
      </div>

    </div>
  );
};

export default BookingTable;