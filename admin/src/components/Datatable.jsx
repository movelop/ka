import { useContext, useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';
import { useStateContext } from '../context/ContextProvider';

// ─── Action Column ─────────────────────────────────────────────

const buildActionColumn = (path, onDelete, isDark, currentColor) => ({
  field: 'action',
  headerName: 'Action',
  width: 160,
  sortable: false,
  filterable: false,
  renderCell: (params) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Link
        to={`/${path}/${params.row.id}`}
        state={{ data: params.row }}
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '8px',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: isDark ? '#d1d5db' : '#374151',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        View →
      </Link>

      <button
        onClick={() => onDelete(params.row.id)}
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '8px',
          background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
          color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.2)',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </div>
  ),
});

// ─── Main Component ───────────────────────────────────────────

const Datatable = ({ columns, path }) => {
  const { user } = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === 'Dark';

  // ✅ endpoint logic
  const endpoint =
    path === 'customers'
      ? `/bookings/${path}`
      : `/${path}`;

  const { data, loading, error } = useFetch(endpoint);

  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  // ✅ normalize rows (fix missing id issue)
  useEffect(() => {
    if (!data) return;

    const raw = data?.[path] || [];

    const normalized = raw.map((item, index) => ({
      ...item,
      id: item._id || item.id || `${path}-${index}`,
    }));

    setList(normalized);
  }, [data, path]);

  // search filter
  const filteredList = searchTerm.trim()
    ? list.filter((row) =>
        Object.values(row).some(
          (v) => v && String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : list;

  // delete handler
  const handleDelete = useCallback(async (id) => {
    setDeleteError(null);
    try {
      await api.delete(`${path}/${id}`, {
        headers: { token: `Bearer ${user?.token}` },
      });

      setList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setDeleteError('Failed to delete item. Please try again.');
    }
  }, [path, user?.token]);

  // ✅ condition: no action column for customers
  const finalColumns =
    path === 'customers'
      ? columns
      : [...columns, buildActionColumn(path, handleDelete, isDark, currentColor)];

  // UI tokens
  const c = {
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    bg: isDark ? '#2d3139' : '#ffffff',
    text: isDark ? '#f3f4f6' : '#1f2937',
    muted: isDark ? '#9ca3af' : '#6b7280',
    rowHover: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    inputBg: isDark ? '#383c44' : '#f9fafb',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* SEARCH */}
      <div style={{ position: 'relative', width: '320px' }}>
        <HiOutlineSearch style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: c.muted,
        }} />

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '36px',
            borderRadius: '10px',
            border: `1px solid ${c.border}`,
            background: c.inputBg,
            color: c.text,
          }}
        />
      </div>

      {/* ERRORS */}
      {(error || deleteError) && (
        <div style={{ color: '#ef4444', fontSize: '13px' }}>
          {error && 'Failed to load data.'}
          {deleteError && ` ${deleteError}`}
        </div>
      )}

      {/* GRID */}
      <DataGrid
        rows={filteredList}
        columns={finalColumns}
        getRowId={(row) => row.id}
        loading={loading}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        autoHeight
        sx={{
          border: `1px solid ${c.border}`,
          borderRadius: '12px',
          background: c.bg,
          color: c.text,
        }}
      />
    </div>
  );
};

export default Datatable;