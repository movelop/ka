import { useState, useEffect, useContext, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';
import { useStateContext } from '../context/ContextProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDatesInRange = (startDate, endDate) => {
  const start   = new Date(startDate);
  const end     = new Date(endDate);
  const dates   = [];
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

const StatusBadge = ({ row, onCheckin, onCheckout, currentColor }) => {
  const base = {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '99px',
    border: 'none',
    cursor: 'default',
    whiteSpace: 'nowrap',
  };

  if (row.cancelled) return (
    <span style={{ ...base, background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
      Cancelled
    </span>
  );

  if (row.checkedIn && row.checkedOut) return (
    <span style={{ ...base, background: 'rgba(107,114,128,0.1)', color: '#6b7280' }}>
      Checked Out
    </span>
  );

  if (row.checkedIn && !row.checkedOut) return (
    <button
      type="button"
      onClick={() => onCheckout(row)}
      style={{
        ...base,
        cursor: 'pointer',
        background: 'rgba(249,115,22,0.1)',
        color: '#ea580c',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(249,115,22,0.2)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(249,115,22,0.1)'}
    >
      Check Out ↗
    </button>
  );

  return (
    <button
      type="button"
      onClick={() => onCheckin(row)}
      style={{
        ...base,
        cursor: 'pointer',
        background: `${currentColor}18`,
        color: currentColor,
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = `${currentColor}30`}
      onMouseLeave={(e) => e.currentTarget.style.background = `${currentColor}18`}
    >
      Check In ↗
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingTable = ({ columns, path }) => {
  const { data, loading, error } = useFetch(`/${path}`);
  const { user }                 = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === 'Dark';

  const [list,        setList]        = useState([]);
  const [searchTerm,  setSearchTerm]  = useState('');
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (data?.[path]) setList(data[path]);
  }, [data, path]);

  const filteredList = searchTerm.trim()
    ? list.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : list;

  // ── Handlers ──────────────────────────────────────────────────────────────

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

  // ── Color tokens ──────────────────────────────────────────────────────────

  const c = {
    border:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    bg:       isDark ? '#2d3139' : '#ffffff',
    text:     isDark ? '#f3f4f6' : '#1f2937',
    muted:    isDark ? '#9ca3af' : '#6b7280',
    rowHover: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    inputBg:  isDark ? '#383c44' : '#f9fafb',
  };

  // ── Action columns ────────────────────────────────────────────────────────

  const actionColumns = [
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <StatusBadge
          row={params.row}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
          currentColor={currentColor}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to={`/${path}/${params.row._id}`}
            state={{ data: params.row }}
            style={{
              fontSize: '11px', fontWeight: 600,
              padding: '4px 12px', borderRadius: '8px',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: c.muted,
              border: `1px solid ${c.border}`,
              textDecoration: 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${currentColor}18`;
              e.currentTarget.style.color = currentColor;
              e.currentTarget.style.borderColor = `${currentColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              e.currentTarget.style.color = c.muted;
              e.currentTarget.style.borderColor = c.border;
            }}
          >
            View →
          </Link>
          {user?.username === 'moh' && <button
            type="button"
            onClick={() => handleDelete(params.row)}
            style={{
              fontSize: '11px', fontWeight: 600,
              padding: '4px 12px', borderRadius: '8px',
              background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
          >
            Delete
          </button>}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

      {/* ── Search ── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
        <HiOutlineSearch style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)',
          color: c.muted, fontSize: '15px', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search bookings"
          style={{
            width: '100%', height: '38px',
            paddingLeft: '36px', paddingRight: '16px',
            fontSize: '13px', borderRadius: '10px',
            border: `1px solid ${c.border}`,
            background: c.inputBg,
            color: c.text,
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = currentColor;
            e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = c.border;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* ── Errors ── */}
      {(error || actionError) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[error && 'Failed to load bookings.', actionError].filter(Boolean).map((msg, i) => (
            <div key={i} role="alert" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
              background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
              color: '#ef4444',
            }}>
              ⚠ {msg}
            </div>
          ))}
        </div>
      )}

      {/* ── DataGrid ── */}
      <DataGrid
        rows={filteredList}
        columns={[...columns, ...actionColumns]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        disableSelectionOnClick
        getRowId={(row) => row._id}
        loading={loading}
        autoHeight
        sx={{
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          background: c.bg,
          color: c.text,
          fontFamily: 'inherit',
          fontSize: '13px',

          '& .MuiDataGrid-columnHeaders': {
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderBottom: `1px solid ${c.border}`,
            borderRadius: '12px 12px 0 0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: c.muted,
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },

          '& .MuiDataGrid-row': {
            transition: 'background 0.15s',
            borderBottom: `1px solid ${c.border}`,
          },
          '& .MuiDataGrid-row:hover': { background: c.rowHover },
          '& .MuiDataGrid-row.Mui-selected': { background: `${currentColor}12` },
          '& .MuiDataGrid-row.Mui-selected:hover': { background: `${currentColor}18` },

          '& .MuiDataGrid-cell': {
            borderBottom: 'none', color: c.text, fontSize: '13px',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },

          '& .MuiCheckbox-root': { color: c.muted },
          '& .MuiCheckbox-root.Mui-checked': { color: currentColor },

          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${c.border}`,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          },
          '& .MuiTablePagination-root': { color: c.muted, fontSize: '12px' },
          '& .MuiTablePagination-actions button': { color: c.muted },
          '& .MuiTablePagination-actions button:hover': { color: c.text, background: c.rowHover },
          '& .MuiDataGrid-overlay': {
            background: isDark ? 'rgba(45,49,57,0.8)' : 'rgba(255,255,255,0.8)',
            color: c.muted,
          },
        }}
      />
    </div>
  );
};

export default BookingTable;