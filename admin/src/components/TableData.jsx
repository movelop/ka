import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

import useFetch from '../hooks/useFetch';

const TableData = () => {
  const { data } = useFetch('/bookings/latest')
  const bookings =data?.bookings
  
  
  return (
    <TableContainer component={Paper} className='bg-white dark:text-gray-200 dark:bg-secondary-dark-bg'>
      <Table aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell className="dark:text-gray-200">Confirmation</TableCell>
            <TableCell className="dark:text-gray-200">Fullname</TableCell>
            <TableCell className="dark:text-gray-200">Email</TableCell>
            <TableCell className="dark:text-gray-200">Phone Number</TableCell>
            <TableCell className="dark:text-gray-200">Check-In Date</TableCell>
            <TableCell className="dark:text-gray-200">Check-Out Date</TableCell>
            <TableCell className="dark:text-gray-200">Payment Reference</TableCell>
            <TableCell className="dark:text-gray-200">Room Type</TableCell>
            <TableCell className="dark:text-gray-200">Room Number(s)</TableCell>
            <TableCell className="dark:text-gray-200">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings?.map((row) => (
            <TableRow key={row._id}>
              <TableCell className="dark:text-gray-200">{row.confirmation}</TableCell>
              <TableCell className="dark:text-gray-200">{row.lastName? `${row.lastName} ${row.firstName}`: `${row.firstName}`}</TableCell>
              <TableCell className="dark:text-gray-200">{row.email? row.email : 'NIL'}</TableCell>
              <TableCell className="dark:text-gray-200">{row.phone? row.phone : 'NIL'}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(row.startDate).toLocaleString("en-uk", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}</TableCell>
              <TableCell className="dark:text-gray-200">{new Date(row.endDate).toLocaleString("en-uk", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}</TableCell>
              <TableCell className="dark:text-gray-200">{row.paymentReference ? row.paymentReference : 'Cash' }</TableCell>
              <TableCell className="dark:text-gray-200">{row.roomTitle}</TableCell>
              <TableCell className="dark:text-gray-200">{row.roomNumbers.length >1 ? row.roomNumbers.map((roomNumber) => `${roomNumber}, `): row.roomNumbers.map((roomNumber) => `${roomNumber}`)}</TableCell>
              
              <TableCell className="dark:text-gray-200">
              <Link 
                  to={`/bookings/${row._id}`} 
                  style={{ textDecoration: "none" }}
                  state = {{ data: row}}
                  >
                  <div className="py-1 px-2 text-blue-700 border-1 border-dotted border-blue-800 cursor-pointer">View</div>
              </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TableData;