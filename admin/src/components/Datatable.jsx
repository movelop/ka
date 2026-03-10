import { useContext, useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';

// ─── Action Column ────────────────────────────────────────────────────────────

const buildActionColumn = (path, onDelete) => ({
  field: 'action',
  headerName: 'Action',
  width: 200,
  sortable: false,
  filterable: false,
  renderCell: (params) => (
    <div className="flex items-center gap-3">
      <Link
        to={`/${path}/${params.row._id}`}
        state={{ data: params.row }}
        className="py-1 px-2 text-blue-700 border border-dotted border-blue-800 rounded hover:bg-blue-50 transition-colors text-sm"
      >
        View
      </Link>
      <button
        type="button"
        onClick={() => onDelete(params.row._id)}
        className="py-1 px-2 text-red-700 border border-dotted border-red-800 rounded hover:bg-red-50 transition-colors text-sm cursor-pointer"
      >
        Delete
      </button>
    </div>
  ),
});

// ─── Main Component ───────────────────────────────────────────────────────────

const Datatable = ({ columns, path }) => {
  const { user } = useContext(AuthContext);
  const { data, loading, error } = useFetch(`/${path}`);

  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  // Sync fetched data into list
  useEffect(() => {
    if (data?.[path]) setList(data[path]);
  }, [data, path]);

  // Derive filtered list from search term — no extra state needed
  const filteredList = searchTerm.trim()
    ? list.filter((row) =>
        Object.values(row).some(
          (value) => value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
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

  const actionColumn = buildActionColumn(path, handleDelete);

  return (
    <div className="h-[500px] flex flex-col gap-3">

      {/* ── Search ── */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-[400px] border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-secondary-dark-bg dark:text-gray-200 h-10 px-5 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
        aria-label="Search table"
      />

      {/* ── Error Banners ── */}
      {error && (
        <p role="alert" className="text-sm text-red-500">Failed to load data.</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-red-500">{deleteError}</p>
      )}

      {/* ── DataGrid ── */}
      <DataGrid
        className="datagrid"
        rows={filteredList}
        columns={[...columns, actionColumn]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        disableSelectionOnClick
        getRowId={(row) => row._id}
        loading={loading}
      />

    </div>
  );
};

export default Datatable;