import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../hooks/api';
import useFetch from '../hooks/useFetch';
import { AuthContext } from '../context/AuthContextProvider';

const BookingTable = ({ columns, path }) => {
const [list,setList] = useState([]);
const { data, loading } = useFetch(`/${path}`);
const { user } = useContext(AuthContext);
const navigate = useNavigate();

useEffect(() => {
    setList(data?.[path])
}, [data, path]);

const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
    dates.push(new Date(date).getTime());
    date.setDate(date.getDate() + 1);
    }

    return dates;
};

  const handleDelete = async (params) => {
    
    
    const id = params._id;
    const selectedRooms = params.selectedRooms;
    const startDate = params.startDate;
    const endDate = params.endDate;
    const alldates = getDatesInRange(startDate, endDate);

    try {
      await Promise.all(
        selectedRooms.map((roomId) => {
          return api.put(`/rooms/availability/${roomId}/cancel`, {dates: alldates }, {
            headers: { token: `Bearer ${user.token}` }
          });
        })
      );
      await api.delete(`/${path}/${id}`, {
        headers: { token: `Bearer ${user.token}` }
      });
      setList(list.filter((item) => item._id !== id))
    } catch (error) {
      console.log(error);
      
    }
  };

  const handleCheckout = async (params) => {
  const id = params._id;
  const selectedRooms = params.selectedRooms;
  const startDate = params.startDate;
  const endDate = params.endDate;
  const alldates = getDatesInRange(startDate, endDate);

  try {
    // 1️⃣ Update room availability
    await Promise.all(
      selectedRooms.map((roomId) =>
        api.put(
          `/rooms/availability/${roomId}/cancel`,
          { dates: alldates },
          { headers: { token: `Bearer ${user.token}` } }
        )
      )
    );

    // 2️⃣ Update booking checkedOut status
    await api.put(
      `/bookings/${id}`,
      { checkedOut: true },
      { headers: { token: `Bearer ${user.token}` } }
    );

    // 3️⃣ Update the frontend state instantly
    setList((prev) =>
      prev.map((b) => (b._id === id ? { ...b, checkedOut: true } : b))
    );

  } catch (error) {
    console.error("Checkout failed:", error);
  }
};


    const handleCheckin = async (params) => {
    const id = params._id;
    try {
        const newBooking = {
        ...params,
        checkedIn: true,
        };

        await api.put(`/bookings/${id}`, newBooking, {
        headers: { token: `Bearer ${user.token}` }, // must match verifyAdmin
        });

        setList((prev) =>
            prev.map((b) => (b._id === id ? { ...b, checkedIn: true } : b))
        );

    } catch (error) {
        console.log(error);
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
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                return(
                    <div className="flex items-center gap-3">
                       {params.row.checkedIn && !params.row.checkedOut && ( <div
                            className="py-1 px-2 text-red-700 border-1 border-dotted border-red-800 cursor-pointer"
                            onClick={() => handleCheckout(params.row)}
                        >
                            Check Out
                        </div>
                        )}
                        {!params.row.checkedIn && !params.row.checkedOut && ( <div
                            className="py-1 px-2 text-green-700 border-1 border-dotted border-green-800 cursor-pointer"
                            onClick={() => handleCheckin(params.row)}
                        >
                            Check In
                        </div>
                        )}
                        {params.row.checkedIn && params.row.checkedOut && ( <div
                            className="py-1 px-2 text-red-700 cursor-pointer"
                        >
                            Checked Out
                        </div>
                        )}
                    </div>
                )
            }
        },
        {
            field: "action",
            headerName: "Action",
            width: 150,
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
                            onClick={() => handleDelete(params.row)}
                        >
                            Delete
                        </div>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="h-[500px] flex flex-col overflow-hidden">
            {/* Search bar */}
            <div className="flex items-center sm:w-[400px] gap-3 mb-3 shrink-0">
                <input
                type="text"
                placeholder="Search..."
                onChange={handleSearchChange}
                className="w-full border-2 border-gray-300 bg-white h-10 px-5 rounded-lg text-sm focus:outline-none"
                />
            </div>

            {/* DataGrid container */}
            <div className="flex-1 overflow-hidden">
                <DataGrid
                className="datagrid"
                rows={list}
                columns={columns.concat(actionColumn)}
                pageSize={9}
                rowsPerPageOptions={[9]}
                checkboxSelection
                getRowId={(row) => row._id}
                loading={loading}
                />
            </div>
        </div>
    )
}

export default BookingTable;