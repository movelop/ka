import React, { useContext,useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';

const Datatable = ({ columns, path }) => {
  const [list, setList] = useState([]);
  const { user } = useContext(AuthContext);
  const { data, loading } = useFetch(`/${path}`)
 
  useEffect(() => {
    setList(data?.[path])
  }, [data, path]);

  const handleDelete = async(id) => {
    try {
      await api.delete(`${path}/${id}`, {
        headers: { token: `Bearer ${user.token}` },
      });
      setList(list.filter((item) => item._id !== id))
    } catch (error) {
      
    }
  };
  const handleSearch = (searchTerm) => {
    if (!data?.[path]) return [];

    const term = searchTerm.toLowerCase();

    return data[path].filter((row) =>
        Object.values(row).some(
        (value) =>
            value && String(value).toLowerCase().includes(term)
        )
    );
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setList(handleSearch(searchTerm));
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="flex items-center gap-3">
            <Link 
              to={`/${path}/${params.row._id}`} 
              style={{ textDecoration: "none" }}
              state = {{ data: params.row}}
              >
              <div className="py-1 px-2 text-blue-700 border-1 border-dotted border-blue-800 cursor-pointer">View</div>
            </Link>
            <div
              className="py-1 px-2 text-red-700 border-1 border-dotted border-red-800 cursor-pointer"
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className='h-[500px]'>
      <div className="flex items-center sm:w-[400px] gap-3 mb-3">
        <input
          type='text'
          placeholder='Search...'
          onChange={handleSearchChange}
          className='sm:w-[100%] border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none'
        />
      </div>
      <DataGrid
        className='datagrid'
        rows={list}
        columns={columns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions = {[9]}
        checkboxSelection
        getRowId={(row) => row._id}
        loading= {loading}
      />
    </div>
  )
}

export default Datatable;