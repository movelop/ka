import { useContext, useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';
import { useStateContext } from '../context/ContextProvider';

// ─── Action Column ────────────────────────────────────────────────────────────

const buildActionColumn = (path, onDelete, isDark, currentColor) => ({
  field: 'action',
  headerName: 'Action',
  width: 160,
  sortable: false,
  filterable: false,
  renderCell: (params) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Link
        to={`/${path}/${params.row._id}`}
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
          e.currentTarget.style.color = isDark ? '#d1d5db' : '#374151';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        }}
      >
        View →
      </Link>
      <button
        type="button"
        onClick={() => onDelete(params.row._id)}
        style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '8px',
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
      </button>
    </div>
  ),
});

// ─── Main Component ───────────────────────────────────────────────────────────

const Datatable = ({ columns, path }) => {
  const { user } = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const { data, loading, error } = useFetch(`/${path}`);
  const isDark = currentMode === 'Dark';

  const [list, setList]             = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (data?.[path]) setList(data[path]);
  }, [data, path]);

  const filteredList = searchTerm.trim()
    ? list.filter((row) =>
        Object.values(row).some(
          (v) => v && String(v).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : list;

  const handleDelete = useCallback(async (id) => {
    setDeleteError(null);
    try {
      await api.delete(`${path}/${id}`, {
        headers: { token: `Bearer ${user?.token}` },
      });
      setList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError('Failed to delete item. Please try again.');
    }
  }, [path, user?.token]);

  const actionColumn = buildActionColumn(path, handleDelete, isDark, currentColor);

  // ── Color tokens ──────────────────────────────────────────────────────────
  const c = {
    border:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    bg:       isDark ? '#2d3139' : '#ffffff',
    text:     isDark ? '#f3f4f6' : '#1f2937',
    muted:    isDark ? '#9ca3af' : '#6b7280',
    rowHover: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    inputBg:  isDark ? '#383c44' : '#f9fafb',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Search ── */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
        <HiOutlineSearch style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)',
          color: c.muted, fontSize: '15px', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search table"
          style={{
            width: '100%',
            height: '38px',
            paddingLeft: '36px',
            paddingRight: '16px',
            fontSize: '13px',
            borderRadius: '10px',
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
      {(error || deleteError) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[error && 'Failed to load data.', deleteError].filter(Boolean).map((msg, i) => (
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
        columns={[...columns, actionColumn]}
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
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: c.muted,
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },

          '& .MuiDataGrid-row': {
            transition: 'background 0.15s',
            borderBottom: `1px solid ${c.border}`,
          },
          '& .MuiDataGrid-row:hover':  { background: c.rowHover },
          '& .MuiDataGrid-row.Mui-selected': { background: `${currentColor}12` },
          '& .MuiDataGrid-row.Mui-selected:hover': { background: `${currentColor}18` },

          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            color: c.text,
            fontSize: '13px',
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

export default Datatable;